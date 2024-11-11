import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, key, item } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)

  //Check if we have required fields
  if (!store_id || !key || !item)
    return { statusCode: 400, statusMessage: 'Required parameters are missing' }

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have the rights to commit this action` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.delete_item)
      return { statusCode: 400, statusMessage: `You do not have the rights to commit this action` }
  }

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
      before: item,
      item_id: parseInt(key)
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Item Deleted!"
  }
})
