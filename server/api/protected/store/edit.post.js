import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const boss_id = authUser?.boss?.id
  const { id, store_name } = await readBody(event)

  //Check if we have required fields
  if (!id || !store_name)
    throw new Error(`Required: id, store_name.`)

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, id))
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

  //Check if store name is at least 2 characters long
  if(store_name.length < 2)
    return { statusCode: 400, statusMessage: 'Store Name must be at least 2 characters long.' }

  //Edit store 
  const store = await prisma.store.update({
    where: {
      id: id,
      boss_id: boss_id
    },
    data: {
      name: store_name,
    },
    include: {
      workers: true
    }
  })

  setResponseStatus(event, 201)
  
  return {
    store: store,
    message: "Store successfully edited!"
  }
})