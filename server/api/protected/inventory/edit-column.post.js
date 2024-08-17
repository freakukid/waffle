import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id
  const user_id = session?.user?.id

  //Check if this is a boss account
  if(!boss_id)
    return { statusCode: 400, statusMessage: 'You must be a boss account to edit a column.' }

  let { store_id, column_map, name_column, price_column, quantity_column, discount_column, cost_column } = await readBody(event)

  //Check if we have a store id
  if (!store_id)
    return { statusCode: 400, statusMessage: 'Store Id must be provided.' }

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
    message: "Column edited!"
  }
})
