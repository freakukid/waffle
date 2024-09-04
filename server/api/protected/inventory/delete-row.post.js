import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, key, item } = await readBody(event)

  //Check if we have required fields
  if (!store_id || !key || !item)
    return { statusCode: 400, statusMessage: 'Required: store_id, key, item' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isStoreWorker(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

  let query = `
    UPDATE "Inventory"
    SET stock = stock - $2
    WHERE store_id = $1 AND stock IS NOT NULL
    RETURNING *;`

  const result = await prisma.$queryRawUnsafe(query, store_id, key)

  //Record action
  delete item.__id
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'delete_row',
      before: item
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Item deleted!"
  }
})
