import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id
  const user_id = session?.user?.id

  //Check if this is a boss account
  if(!boss_id)
    return { statusCode: 400, statusMessage: 'You must be a boss account to delete a column.' }

  let { store_id, column_name, name_column, price_column, quantity_column, discount_column, cost_column } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

  let query = `
    WITH updated_stock AS (
      SELECT  id,
              jsonb_object_agg(key, value - $2) AS new_stock
      FROM (
          SELECT  id,
                  key,
                  value
          FROM "Inventory",
                jsonb_each(stock) AS stock_items(key, value)
          WHERE store_id = $1 AND stock IS NOT NULL
      ) AS subquery
      GROUP BY id
    )
    UPDATE "Inventory" i
    SET stock = u.new_stock,
    columns = ARRAY(SELECT unnest(columns) EXCEPT SELECT $2),
    name_column = $3,
    price_column = $4,
    quantity_column = $5,
    discount_column = $6,
    cost_column = $7
    FROM updated_stock AS u
    WHERE i.id = u.id
    RETURNING *;`

  const result = await prisma.$queryRawUnsafe(query, store_id, column_name, name_column, price_column, quantity_column, discount_column, cost_column)

  //Record action
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'delete_column',
      before: { title: column_name }
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Column deleted!"
  }
})
