import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id } = event.context.params

  //Check if we have required fields
  if (!store_id)
    throw new Error(`Required: store_id.`)
  
  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isStoreWorker(authUser, store_id))
    throw new Error(`You do not have access rights to retrieve this store.`)

  const inventory = await prisma.inventory.findUnique({
    where: {
      store_id: parseInt(store_id),
    },
    select: {
      columns: true,
      name_column: true,
      price_column: true,
      quantity_column: true,
      discount_column: true,
      cost_column: true,
    }
  })

  if(!inventory) 
    throw new Error(`Invalid store id.`)

  return inventory
})