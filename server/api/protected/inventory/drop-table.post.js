import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id)
    return { statusCode: 400, statusMessage: 'You must be a boss account to drop an inventory.' }

  let { store_id } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

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

  setResponseStatus(event, 201)
  
  return {
    inventory: inventory,
    message: "Inventory dropped!"
  }
})
