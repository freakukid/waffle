import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const boss_id = authUser?.boss?.id
  const { id, store_id } = await readBody(event)

  //Check if we have required fields
  if (!id || !store_id)
    return {statusCode: 400, statusMessage: `Required parameters are missing`}

  //Check if this user has access rights to view workers
  if(!isStoreOwner(authUser, store_id))
    return {statusCode: 400, statusMessage: `You do not have the rights to commit this action`}

  //Delete all users associated with boss
  const user = await prisma.user.delete({
    where: {
      id,
      worker: {
        store: {
          boss_id: boss_id
        }
      }
    }
  })

  if(!user)
    return { statusCode: 400, statusMessage: 'Invalid data' }
  

  setResponseStatus(event, 201)
  
  return {
    message: "User Deleted!"
  }
})