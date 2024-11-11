import useAuthChecks from '../../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id, worker_id, name, permissions } = await readBody(event)

  //Check if we have required fields
  if (!store_id || !worker_id || !name || !permissions)
    return { statusCode: 400, statusMessage: 'Required parameters are missing.' }

  //Check if this user has access rights to change permissions for this worker
  if(!isStoreOwner(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have access rights to edit a worker's permission.` }

  //Update permissions 
  const permission = await prisma.permission.update({
    where: {
      worker_id: worker_id
    },
    data: {
      add_item: permissions.add_item,
      edit_item: permissions.edit_item,
      delete_item: permissions.delete_item,
      make_transactions: permissions.make_transactions,
      view_log: permissions.view_log,
      receiving: permissions.receiving,
    },
  })

  setResponseStatus(event, 201)
  
  return {
    permission: permission,
    message: `Permissions updated for ${name}!`
  }
})
