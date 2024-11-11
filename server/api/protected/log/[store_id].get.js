import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id } = event.context.params
  const isValidWorker = isStoreWorker(authUser, store_id)

  //Check if we have required fields
  if (!store_id)
    throw new Error(`Required parameters are missing`)

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    throw new Error(`You do not have the rights to view this data`)

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.view_log)
      throw new Error(`You do not have the rights to view this data`)
  }
  
  const logs = await prisma.log.findMany({
    where: {
      store_id: parseInt(store_id)
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      timestamp: 'desc' // or 'asc' for ascending order
    }
  })
  
  return logs
})