import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id) {
    return { statusCode: 400, statusMessage: 'You must be a boss account edit these settings.' }
  }

  let { id, tax } = await readBody(event)

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
    },
    include: {
      inventory: true
    }
  })

  setResponseStatus(event, 201)
  
  return {
    store: store,
    message: "Settings successfully edited!"
  }
})