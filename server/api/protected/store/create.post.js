import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, updateAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const boss_id = authUser?.boss?.id
  const { name, email, website, phone, address, city, zipcode, state, country } = await readBody(event)

  //Check if this is a boss account
  if(!boss_id)
    return { statusCode: 400, statusMessage: 'You must be a boss account to create a store.' }
  
  //Check if we have required fields
  if (!name)
    return { statusCode: 400, statusMessage: `Required: name.` }

  //Check if store name is at least 2 characters long
  if(name.length < 2)
    return { statusCode: 400, statusMessage: 'Store name must be at least 2 characters long.' }

  //Create store 
  const store = await prisma.store.create({
    data: {
      code: `${Array.from({ length: 3 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + (Math.random() < 0.5 ? 65 : 97))).join('')}${name.substring(0, 3).replace(/[^a-zA-Z]/g, '').split('').sort(() => Math.random() < 0.5 ? -1 : 1).join('')}`,
      boss: { connect: { id: boss_id } },
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

  //Update session
  await updateAuthUser(event, authUser.id)

  setResponseStatus(event, 201)
  return {
    store: store,
    message: "Store created!"
  }
})

