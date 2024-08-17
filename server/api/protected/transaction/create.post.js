import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user_id = session?.user?.id

  //Check if this user is login
  if(!user_id) {
    return { statusCode: 400, statusMessage: 'You must be login to create a transaction.' }
  }

  let { store_id, tax, items, quantity_column } = await readBody(event)

  //Check if we all fields before we create a transaction
  if (!store_id || items.length === 0) {
    return { statusCode: 400, statusMessage: 'All fields must be provided to create a transaction.' }
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
        id: parseInt(id)
      }
    })
  }

  //Create transaction
  items.forEach(item => { delete item.key })
  const transaction = await prisma.transaction.create({
    data: {
      items: items,
      tax: tax,
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

