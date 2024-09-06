import useAuthChecks from '../../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const auth_worker_id = authUser?.worker?.id
  const { worker_id } = event.context.params

  //Check if we have required fields
  if (!worker_id)
    throw new Error(`Required: worker_id.`)

  //Check if this user has access rights to this user's permission
  if(!parseInt(worker_id) === auth_worker_id)
    throw new Error(`You do not have access rights get this user's permission.`)

  const permissions = await prisma.permission.findUnique({
    where: {
      worker_id: parseInt(worker_id)
    },
    select: {
      add_item: true,
      edit_item: true,
      delete_item: true,
      make_transactions: true,
      view_log: true
    }
  })

  if(!permissions)
    throw new Error(`Worker does not exist`)

  return permissions
})
