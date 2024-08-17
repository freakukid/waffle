import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id
  const user_id = session?.user?.id

  //Check if this is a boss account
  if(!boss_id)
    return { statusCode: 400, statusMessage: 'You must be a boss account to create an inventory.' }

  let { store_id, stock, columns, unique_key } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

  //Upsert: If inventory exist update else create inventory
  const inventory = await prisma.inventory.upsert({
    where: {
      store_id: store_id
    },
    create: {
      store: { connect: { id: store_id } },
      stock: stock,
      columns: columns,
      unique_key: unique_key
    },
    update: {
      stock: stock,
      columns: columns,
      unique_key: unique_key
    },
  })

  //Record action
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'import'
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: inventory,
    message: "Inventory created!"
  }
})
