import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, updateAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { id } = await readBody(event)

  //Check if we have required fields
  if (!id)
    return { statusCode: 400, statusMessage: `Required parameters are missing` }

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, id))
    return { statusCode: 400, statusMessage: `You do not have the rights to commit this action` }

  //Delete the logs if we are deleting the table
  const logs = await prisma.log.deleteMany({
    where: {
      store_id: id
    }
  })

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

  await updateAuthUser(event, authUser.id)

  setResponseStatus(event, 201)
  return {
    store_id: store.id,
    message: "Store Deleted!"
  }
})