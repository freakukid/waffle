import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id } = event.context.params

  //Check if we have required fields
  if (!store_id)
    throw new Error(`Required parameters are missing.`)

  //Check if this user has access rights to view workers
  if(!isStoreOwner(authUser, store_id))
    throw new Error(`You do not have access rights to view workers.`)

  const workers = await prisma.worker.findMany({
    where: {
      store_id: parseInt(store_id)
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true
        }
      },
      permission: {
        select: {
          add_item: true,
          edit_item: true,
          delete_item: true,
          make_transactions: true,
          view_log: true,
          receiving: true
        }
      }
    },
    orderBy: {
      user: {
        id: 'desc' // or 'asc' for ascending order
      }
    }
  })
  
  return workers
})