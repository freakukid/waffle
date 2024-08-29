import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user_id = session?.user?.boss?.id
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!user_id) {
    return { statusCode: 400, statusMessage: 'You must be login to edit these settings.' }
  }

  let { id, tax, receipt_ip, header, footer } = await readBody(event)

  //Check if we have tax
  if (!tax) {
    return { statusCode: 400, statusMessage: 'Tax must be provided.' }
  }

  //Edit store 
  const store = await prisma.store.update({
    where: {
      id: id,
      boss_id: boss_id
    },
    data: {
      tax: tax,
      header: header,
      footer: footer
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