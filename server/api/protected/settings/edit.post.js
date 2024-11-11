import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const boss_id = authUser?.boss?.id
  const { store_id, tax, receipt_ip, header, footer, invoice_notes } = await readBody(event)

  //Check if we have required fields
  if (!store_id)
    return { statusCode: 400, statusMessage: `Required parameters are missing.` }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isStoreWorker(authUser, store_id))
    return { statusCode: 400, statusMessage: `You do not have save settings for this store/user.` }

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

  //Edit settings
  let settings = null
  if(receipt_ip) {
    settings = await prisma.settings.update({
      where: {
        user_id: user_id
      },
      data: {
        ip: receipt_ip,
      }
    })
  }

  setResponseStatus(event, 201)
  
  return {
    store: store,
    settings: settings,
    message: "Settings successfully edited!"
  }
})