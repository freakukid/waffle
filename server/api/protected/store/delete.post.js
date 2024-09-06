import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { id } = await readBody(event)

  //Check if we have required fields
  if (!id)
    throw new Error(`Required: id.`)

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, id))
    return { statusCode: 400, statusMessage: `You do not have access rights to delete this store.` }

  //Delete all users associated with the store
  await prisma.user.deleteMany({
    where: {
      worker: {
        store: {
          id: id,
        }
      }
    }
  })

  //Delete store
  const store = await prisma.store.delete({
    where: {
      id
    }
  })

  setResponseStatus(event, 201)
  
  return {
    store_id: store.id,
    message: "Store deleted!"
  }
})