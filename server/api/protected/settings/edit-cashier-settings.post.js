import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const boss_id = authUser?.boss?.id
  const { store_id, tax, header, footer, invoice_notes } = await readBody(event)

  //Check if we have required fields
  if (!store_id)
    return { statusCode: 400, statusMessage: `Required parameters are missing` }

  //Check if this user has access rights to this data
  if(!isStoreOwner(authUser, store_id) && !isStoreWorker(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have the rights to commit this action` }

  //Edit store 
  const store = await prisma.store.update({
    where: {
      id: store_id,
      boss_id: boss_id
    },
    data: {
      tax: tax,
      header: header,
      footer: footer,
      invoice_notes: invoice_notes
    },
    include: {
      inventory: true
    }
  })

  setResponseStatus(event, 201)
  
  return {
    store: store,
    message: "Settings Updated!"
  }
})