import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id, id, status, prev_status, payment, cash, card, check, items, quantity_column } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)
  const validStatuses = ['paid', 'pending', 'declined']
  
  //Check if we have required fields
  if (!store_id || !id || !status || !items)
    return { statusCode: 400, statusMessage: `Required: store_id, id, prev_status, status, items.` }

  //Check if we are changing status
  if (prev_status === status)
    return { statusCode: 400, statusMessage: `The status is already set to ${status}.` }

  //Check if status is valid
  if (!validStatuses.includes(status)) {
    return { statusCode: 400, statusMessage: `Status is invalid. Valid statuses: paid, pending, or declined.` }
  }
  
  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to make this transaction.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.make_transactions)
      return { statusCode: 400, statusMessage: `You do not have the rights to make this transaction.` }
  }

  // if(prev_status === 'pending' && status === 'paid') {

  // } else if(prev_status === 'pending' && status === 'declined') { //put items back into the inventory
  //   operator = '+'
  //   editQty = true
  // } else if(prev_status === 'declined' && status === 'paid') { //subtract items from inventory because we put them back when declined
  //   editQty = true
  // } else if(prev_status === 'declined' && status === 'pending') { //subtract items from inventory because we put them back when declined
  //   editQty = true
  // } else if(prev_status === 'paid' && status === 'pending') { // do nothing

  // } else if(prev_status === 'paid' && status === 'declined') { //put items back into the inventory
  //   operator = '+'
  //   editQty = true
  // }

  let operator = '-'
  let editQty = false
  if((prev_status === 'pending' && status === 'declined') || (prev_status === 'paid' && status === 'declined')) {
    operator = '+' //Put items back from limbo into inventory
    editQty = true
  } else if((prev_status === 'declined' && status === 'paid') || (prev_status === 'declined' && status === 'pending')) {
    editQty = true //Take away items from inventory to limbo
  }

  //If we have a quantity provided then subtract from quantity
  if(editQty && quantity_column) {
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
                  to_jsonb((si.value->>(SELECT quantity_column FROM inventory_info))::int ${operator} du.item_qty)
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
    const inventory = (await prisma.$queryRawUnsafe(query, store_id, JSON.stringify(items)))[0]
  }

  //Upadte layaway
  const layaway = await prisma.layaway.update({
    where: {
      id: id
    },
    data: {
      status: status,
      payment: payment,
      cash: cash ? parseFloat(cash) : 0,
      card: card,
      check: check,
    },
    include: {
      customer: true
    }
  })

  setResponseStatus(event, 201)

  console.log(layaway)
  
  return {
    layaway: layaway,
    message: `Layaway transaction status: ${status}!`
  }
})

