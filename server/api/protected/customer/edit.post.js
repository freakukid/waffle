import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { id, store_id, name, email, phone, company, address, city, zipcode, state, country } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)

  //Check if we have required fields
  if (!id || !store_id || !name)
    return { statusCode: 400, statusMessage: 'Required parameters are missing.' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to edit a customer for this store.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.make_transactions)
      return { statusCode: 400, statusMessage: `You do not have the rights to commit this action.` }
  }

  //Create Customer
  const customer = await prisma.customer.update({
    where: {
      id: id,
      store_id: store_id
    },
    data: {
      name: name,
      email: email,
      phone: phone,
      company: company,
      address: address,
      city: city,
      zipcode: zipcode,
      state: state,
      country: country
    }
  })

  setResponseStatus(event, 201)
  
  return {
    customer: customer,
    message: "Customer Edited!"
  }
})
