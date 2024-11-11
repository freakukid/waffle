import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const boss_id = authUser?.boss?.id
  const { id, name, email, website, phone, address, city, zipcode, state, country } = await readBody(event)

  //Check if we have required fields
  if (!id || !name)
    return { statusCode: 400, statusMessage: `Required parameters are missing` }

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, id))
    return { statusCode: 400, statusMessage: `You do not have the rights to commit this action` }

  //Check if store name is at least 2 characters long
  if(name.length < 2)
    return { statusCode: 400, statusMessage: 'Store name must be at least 2 characters long' }

  //Edit store 
  const store = await prisma.store.update({
    where: {
      id: id,
      boss_id: boss_id
    },
    data: {
      name: name,
      email: email,
      website: website,
      phone: phone,
      address: address,
      city: city,
      zipcode: zipcode,
      state: state,
      country: country,
    },
    include: {
      workers: true
    }
  })

  setResponseStatus(event, 201)
  
  return {
    store: store,
    message: "Store Updated!"
  }
})