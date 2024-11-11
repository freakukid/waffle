import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, column_name } = await readBody(event)

  //Check if we have required fields
  if (!store_id || !column_name)
    return { statusCode: 400, statusMessage: 'Required parameters are missing' }

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have the rights to commit this action` }

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
    message: "Column Added!"
  }
})