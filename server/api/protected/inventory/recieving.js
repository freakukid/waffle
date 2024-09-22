import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, key, qty, total_cost, prev_cost, cost_column, quantity_column } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)

  //Check if we have required fields
  if (!store_id || !key || !qty || !total_cost || !prev_cost || !cost_column || !quantity_column)
    return { statusCode: 400, statusMessage: 'Required: store_id, key, qty, total_cost, prev_cost, cost_column, quantity_column.' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.recieving)
      return { statusCode: 400, statusMessage: `You do not have the rights to commit this action.` }
  }

  const query = `
    WITH current_stock AS (
      SELECT 
        (stock-> $2 ->> $5)::int AS current_qty,
        (stock-> $2 ->> $6)::numeric AS current_cost
      FROM "Inventory"
      WHERE store_id = $1
    ),
    calculations AS (
      SELECT 
        current_qty,
        current_qty * current_cost AS current_total,
        ($4::numeric) AS new_cost, 
        $3::int AS new_qty,
        (current_qty + $3::int) AS total_qty,
        ROUND((current_qty * current_cost + $4::numeric) / (current_qty + $3::int), 2) AS new_avg_cost
      FROM current_stock
    )
    UPDATE "Inventory"
      SET stock = jsonb_set(
        jsonb_set(stock::jsonb, ARRAY[$2, $5], (COALESCE((stock-> $2 ->> $5)::int, 0) + $3)::text::jsonb),
        ARRAY[$2, $6], to_jsonb(TO_CHAR((SELECT new_avg_cost FROM calculations), 'FM999999999.00'))
      )
    WHERE store_id = $1
    RETURNING *;
  `

  const result = await prisma.$queryRawUnsafe(query, store_id, key, qty, total_cost, quantity_column, cost_column)

  //Record action
  const name_column = result[0].name_column
  const item = result[0].stock[key]
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'recieving',
      before: {cost: prev_cost},
      after: {name: item[name_column], qty: qty, total_cost: parseFloat(total_cost).toFixed(2), cost: item[cost_column]}
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Item recieved!"
  }
})
