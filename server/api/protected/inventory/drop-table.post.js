import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id } = await readBody(event)

  //Check if we have required fields
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Required: store_id.' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

  //Empty the inventory and columns/Clear columns
  const inventory = await prisma.inventory.update({
    where: {
      store_id: store_id
    },
    data: {
      stock: {},
      columns: [],
      unique_key: 0,
      version: 0,
      name_column: '',
      price_column: '',
      quantity_column: '',
      discount_column: '',
      cost_column: ''
    },
  })

  //Delete the logs if we are deleting the table
  const logs = await prisma.log.deleteMany({
    where: {
      store_id: store_id
    }
  })

  const transactions = await prisma.transaction.deleteMany({
    where: {
      store_id: store_id
    }
  })

  const layaways = await prisma.layaway.deleteMany({
    where: {
      store_id: store_id
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: inventory,
    message: "Inventory dropped!"
  }
})
