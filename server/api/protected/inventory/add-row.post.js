import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, item } = await readBody(event)

  //Check if we have required fields
  if (!store_id || !item)
    return { statusCode: 400, statusMessage: 'Required: store_id, item' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isStoreWorker(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

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
