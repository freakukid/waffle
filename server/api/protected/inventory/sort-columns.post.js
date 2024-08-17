import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id)
    return { statusCode: 400, statusMessage: 'You must be a boss account to sort columns.' }

  let { store_id, columns } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

  //Edit column order
  const inventory = await prisma.inventory.update({
    where: {
      store_id: store_id
    },
    data: {
      columns: columns,
    },
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: inventory,
    message: "Columns sorted!"
  }
})
