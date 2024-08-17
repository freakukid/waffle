import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id
  const user_id = session?.user?.id

  //Check if this is a boss account
  if(!boss_id)
    return { statusCode: 400, statusMessage: 'You must be a boss account to add a column.' }

  let { store_id, column_name } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

  //Add a column
  const result = await prisma.$queryRawUnsafe(`
    UPDATE "Inventory"
    SET 
      stock = (
        SELECT jsonb_object_agg(key, value || jsonb_build_object($1, '')) 
        FROM jsonb_each(stock)
      ),
      columns = array_append(columns, $1)
    WHERE store_id = $2 AND stock IS NOT NULL
    RETURNING *;`,
    column_name,
    store_id
  )

  //Record action
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'add_column',
      after: { title: column_name }
    }
  })

  setResponseStatus(event, 201)
  
  return {
    inventory: result[0],
    message: "Column added!"
  }
})
