import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, column_name, name_column, price_column, quantity_column, discount_column, cost_column } = await readBody(event)

  //Check if we have required fields
  if (!store_id || !column_name)
    return { statusCode: 400, statusMessage: 'Required parameters are missing.' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

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
    columns = (
        SELECT ARRAY_AGG(col)
        FROM (
            SELECT col
            FROM unnest(columns) AS col
            WHERE col <> $2
            ORDER BY array_position(columns, col)
        ) AS filtered
    ),
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
