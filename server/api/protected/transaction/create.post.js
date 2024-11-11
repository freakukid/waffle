import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const name = authUser?.name
  const { store_id, tax, items, quantity_column, payment, cash, card, check, timestamp } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)
  
  //Check if we have required fields
  if (!store_id || !items.length || !payment)
    return { statusCode: 400, statusMessage: `Required parameters are missing.` }
  
  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to make this transaction.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.make_transactions)
      return { statusCode: 400, statusMessage: `You do not have the rights to make this transaction.` }
  }

  //If we have a quantity provided then subtract from quantity
  let inventory = null
  if(quantity_column) {
    let query = `
      WITH inventory_info AS (
        SELECT 
          quantity_column
        FROM "Inventory"
        WHERE store_id = $1
      ),
      dynamic_updates AS (
        SELECT 
          (update_data->>'key') AS item_key,
          (update_data->>'qty')::int AS item_qty
        FROM jsonb_array_elements($2::jsonb) AS update_data
      ),
      current_stock AS (
        SELECT 
          s.store_id,
          s.stock
        FROM "Inventory" s
        WHERE s.store_id = $1
      ),
      updated_stock AS (
        SELECT 
          jsonb_object_agg(
            si.key,
            CASE 
              WHEN du.item_key IS NOT NULL AND si.key = du.item_key THEN
                jsonb_set(
                  si.value,
                  ARRAY[(SELECT quantity_column FROM inventory_info)],  -- Path as an array
                  to_jsonb((si.value->>(SELECT quantity_column FROM inventory_info))::int - du.item_qty)
                )
              ELSE si.value
            END
          ) AS stock
        FROM current_stock,
        jsonb_each(current_stock.stock) AS si
        LEFT JOIN dynamic_updates du ON si.key = du.item_key
        WHERE current_stock.store_id = $1
        GROUP BY current_stock.store_id
      )
      UPDATE "Inventory" 
      SET stock = updated_stock.stock
      FROM updated_stock
      WHERE "Inventory".store_id = $1
      RETURNING *;
    `
    inventory = (await prisma.$queryRawUnsafe(query, store_id, JSON.stringify(items)))[0]
  } else {
    inventory = await prisma.inventory.findUnique({
      where: {
        store_id: store_id
      }
    })
  }

  //Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      timestamp: timestamp ? timestamp : new Date(),
      items: items,
      tax: tax,
      name: name,
      payment: payment,
      cash: cash ? parseFloat(cash) : 0,
      card: card,
      check: check,
      user: { connect: { id: user_id } },
      store: { connect: { id: store_id } }
    }
  })

  setResponseStatus(event, 201)
  
  return {
    transaction: transaction,
    inventory: inventory,
    message: "Transaction created!"
  }
})

