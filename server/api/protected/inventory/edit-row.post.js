import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, key, item, prev_item } = await readBody(event)
  const isValidWorker = isStoreWorker(authUser, store_id)

  //Check if we have required fields
  if (!store_id || !key || !item || !prev_item)
    return { statusCode: 400, statusMessage: 'Required: store_id, key, item, prev_item.' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.edit_item)
      return { statusCode: 400, statusMessage: `You do not have the rights to commit this action.` }
  }
  
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
