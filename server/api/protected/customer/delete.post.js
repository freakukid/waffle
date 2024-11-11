import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { id, store_id, name } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)

  //Check if we have required fields
  if (!id || !store_id || !name)
    return { statusCode: 400, statusMessage: 'Required parameters are missing.' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to delete a customer for this store.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.make_transactions)
      return { statusCode: 400, statusMessage: `You do not have the rights to commit this action.` }
  }

  //Update layaway that are connected to customer
  const layaway = await prisma.layaway.findMany({
    where: {
      customer_id: id,
      store_id: store_id
    }
  })

  //Check if we layaway transactions
  if (layaway.length)
    return { statusCode: 400, statusMessage: 'Customer cannot be deleted because they are associated with layaway transactions.' }

  //Delete Customer
  const customer = await prisma.customer.delete({
    where: {
      id: id,
      store_id: store_id
    }
  })

  setResponseStatus(event, 201)
  
  return {
    message: "Customer Deleted!"
  }
})
