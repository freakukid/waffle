import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user_id = session?.user?.id

  //Check if this user is login
  if(!user_id)
    return { statusCode: 400, statusMessage: 'You must be login to edit an item.' }

  let { store_id, key, item, prev_item } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

  const query = `
    UPDATE "Inventory"
    SET stock = jsonb_set(stock::jsonb, ARRAY[$2]::text[], $3::jsonb, true)
    WHERE store_id = $1
    RETURNING *;`

  const result = await prisma.$queryRawUnsafe(query, store_id, key, JSON.stringify(item))

  //Record action
  const name_column = result[0].name_column
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'edit_row',
      before: {name: name_column ? prev_item[name_column]: '', item: prev_item},
      after: {name: name_column ? item[name_column]: '', item: item}
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Item edited!"
  }
})
