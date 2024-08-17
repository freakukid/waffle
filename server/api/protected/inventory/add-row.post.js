import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user_id = session?.user?.id

  //Check if this user is login
  if(!user_id)
    return { statusCode: 400, statusMessage: 'You must be login to add an item.' }

  let { store_id, item } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

  let query = `
    WITH unique_key_value AS (
      SELECT unique_key, unique_key + 1 AS incremented_key
      FROM "Inventory"
      WHERE store_id = $1
      LIMIT 1
    )
    UPDATE "Inventory"
    SET stock = jsonb_set(stock::jsonb, ARRAY[(SELECT unique_key::text FROM unique_key_value)], $2::jsonb, true),
        unique_key = (SELECT incremented_key FROM unique_key_value)
    WHERE store_id = $1
    RETURNING *;`

  const result = await prisma.$queryRawUnsafe(query, store_id, JSON.stringify(item))

  //Record action
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'add_row',
      after: item
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Item added!"
  }
})
