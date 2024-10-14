import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { id } = event.context.params

  //Check if we have required fields
  if (!id)
    throw new Error(`Required: id.`)

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, id) && !isStoreWorker(authUser, id))
    throw new Error(`You do not have access rights to retrieve this store.`)

  const store = await prisma.store.findUnique({
    where: {
      id: parseInt(id)
    },
    include: {
      inventory: true
    }
  })

  if(!store) 
    throw new Error(`Invalid store id.`)

  return store
})