import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const { store_id, columns } = await readBody(event)

  //Check if we have required fields
  if (!store_id || !columns)
    return { statusCode: 400, statusMessage: 'Required parameters are missing' }

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have the rights to commit this action` }

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
    message: "Columns Sorted!"
  }
})
