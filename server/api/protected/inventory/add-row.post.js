import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, item } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)
  
  //Check if we have required fields
  if (!store_id || !item)
    return { statusCode: 400, statusMessage: 'Required: store_id, item' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.add_item)
      return { statusCode: 400, statusMessage: `You do not have the rights to commit this action.` }
  }

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
      after: item,
      item_id: result[0].unique_key - 1
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Item added!"
  }
})
