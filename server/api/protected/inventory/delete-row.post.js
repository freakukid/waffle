import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user_id = session?.user?.id

  //Check if this user is login
  if(!user_id)
    return { statusCode: 400, statusMessage: 'You must be login to delete an item.' }

  let { store_id, key, item } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

  let query = `
    UPDATE "Inventory"
    SET stock = stock - $2
    WHERE store_id = $1 AND stock IS NOT NULL
    RETURNING *;`

  const result = await prisma.$queryRawUnsafe(query, store_id, key)

  //Record action
  delete item.__id
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'delete_row',
      before: item
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Item deleted!"
  }
})
