import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, column_map, name_column, price_column, quantity_column, discount_column, cost_column } = await readBody(event)

  //Check if we have required fields
  if (!store_id || !column_map)
    return { statusCode: 400, statusMessage: 'Required parameters are missing' }

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have the rights to commit this action` }

  const jsonUpdateParts = []
  const updateColumnsQueryPart = []

  for (const [oldKey, newKey] of Object.entries(column_map)) {
    //SQL Query for stock json. Replaces old key to new key name
    jsonUpdateParts.push(`jsonb_build_object('${newKey}', value->'${oldKey}')`)
    //Sql Query for columns array
    updateColumnsQueryPart.push(`WHEN elem = '${oldKey}' THEN '${newKey}'`)
  }

  // Create the final strings
  const jsonUpdate = jsonUpdateParts.join(' || ')
  const updateColumnsArray = updateColumnsQueryPart.join(' ')

  // Construct the CASE statement for updating columns
  const caseStatement = `
    CASE 
      ${updateColumnsArray}
      ELSE elem
    END
  `

  const updateStatement = `
    UPDATE "Inventory" t1
    SET stock = (
      SELECT jsonb_object_agg(key, 
        value - '${Object.keys(column_map).join("' - '")}' || 
        (${jsonUpdate}) 
      )
      FROM "Inventory" t2, jsonb_each(t2.stock) AS elem(key, value)
      WHERE t1.id = t2.id
    ),
    columns = (
      SELECT ARRAY(SELECT ${caseStatement} FROM unnest(t1.columns) AS elem)
    ),
    name_column = $2,
    price_column = $3,
    quantity_column = $4,
    discount_column = $5,
    cost_column = $6
    WHERE store_id = $1
    RETURNING *;
  `;

  const result = await prisma.$queryRawUnsafe(updateStatement, store_id, name_column, price_column, quantity_column, discount_column, cost_column)

  //Record action
  const log = await prisma.log.create({
    data: {
      store: { connect: { id: store_id } },
      user: { connect: { id: user_id } },
      action: 'edit_column',
      after: column_map
    }
  })

  setResponseStatus(event, 201)

  return {
    inventory: result[0],
    message: "Column Updated!"
  }
})
