import useAuthChecks from '../../../../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id, product_id } = event.context.params
  const isValidWorker = isStoreWorker(authUser, store_id)

  //Check if we have required fields
  if (!store_id || !product_id)
    throw new Error(`Required parameters are missing`)

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    throw new Error(`You do not have the rights to view this data`)

  const inventory = await prisma.inventory.findUnique({
    where: {
      store_id: parseInt(store_id),
    },
    select: {
      columns: true,
      name_column: true,
      price_column: true,
      quantity_column: true,
      discount_column: true,
      cost_column: true,
      stock: true
    }
  })

  const logs = await prisma.log.findMany({
    where: {
      store_id: parseInt(store_id),
      item_id: parseInt(product_id)
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  })

  const transactions = await prisma.$queryRawUnsafe(`
    SELECT *
    FROM "Transaction"
    WHERE store_id = $1
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(items) AS item
      WHERE item->>'key' = $2
    )
  `,
    parseInt(store_id),
    product_id
  )

  const layaways = await prisma.$queryRawUnsafe(`
      SELECT 
            l.*,
            json_build_object(
              'name', u.name
            ) as "user",
            json_build_object(
              'id', c.id,
              'name', c.name,
              'company', c.company,
              'phone', c.phone,
              'email', c.email,
              'address', c.address,
              'city', c.city,
              'zipcode', c.zipcode,
              'state', c.state,
              'country', c.country
            ) as "customer"
      FROM "Layaway" l
      LEFT JOIN "User" u ON l.user_id = u.id
      LEFT JOIN "Customer" c ON l.customer_id = c.id
      WHERE l.store_id = $1
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(l.items) AS item
        WHERE item->>'key' = $2
      )
    `,
    parseInt(store_id),
    product_id
  )
  
  return {
    columns: inventory.columns,
    name_column: inventory.name_column,
    price_column: inventory.price_column,
    quantity_column: inventory.quantity_column,
    cost_column: inventory.cost_column,
    discount_column: inventory.discount_column,
    product: inventory.stock[product_id],
    logs: logs,
    transactions: transactions,
    layaways: layaways
  }
})