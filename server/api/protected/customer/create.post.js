import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id, name, email, phone, company, address, city, zipcode, state, country, offline_id } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)

  //Check if we have required fields
  if (!store_id || !name)
    return { statusCode: 400, statusMessage: 'Required: store_id, name.' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to create a customer for this store.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.make_transactions)
      return { statusCode: 400, statusMessage: `You do not have the rights to commit this action.` }
  }

  //Create Customer
  const customer = await prisma.customer.create({
    data: {
      store: { connect: { id: store_id } },
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

  
  const response = { customer: customer, message: "Customer Created!" }

  if(offline_id)
    response.offline_id = offline_id
  
  return response
})
