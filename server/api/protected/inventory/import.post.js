import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { store_id, stock, columns, unique_key } = await readBody(event)

  //Check if we have required fields
  if (!store_id || !stock || !columns || !unique_key)
    return { statusCode: 400, statusMessage: 'Required: store_id, stock, columns, unique_key.' }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have access rights to edit this store.` }

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
