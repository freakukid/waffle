import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id)
    return { statusCode: 400, statusMessage: 'You must be a boss account to register a column.' }
  

  let { store_id, stock, name_column, price_column, quantity_column, discount_column, cost_column } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }
  

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