import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id, stock, name_column, price_column, quantity_column, discount_column, cost_column } = await readBody(event)

  //Check if we have a store id
  if (!store_id || !stock || !name_column || !price_column)
    return { statusCode: 400, statusMessage: 'Required parameters are missing.' }
  
  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

  //Upsert: If inventory exist update else create inventory
  const inventory = await prisma.inventory.update({
    where: {
      store_id: parseInt(store_id)
    },
    data: {
      stock: stock,
      name_column: name_column,
      price_column: price_column,
      quantity_column: quantity_column ? quantity_column : '',
      discount_column: discount_column ? discount_column : '',
      cost_column: cost_column ? cost_column : '',
    },
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: inventory,
    message: "Columns registered!"
  }
})