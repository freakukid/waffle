import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id) {
    return { statusCode: 400, statusMessage: 'You must be a boss account to edit a store.' }
  }

  let { id, store_name } = await readBody(event)

  //Check if we have a store name
  if (!store_name) {
    return { statusCode: 400, statusMessage: 'Store Name must be provided.' }
  }

  //Check if store name is at least 2 characters long
  if(store_name.length < 2) {
    return { statusCode: 400, statusMessage: 'Store Name must be at least 2 characters long.' }
  }

  //Edit store 
  const store = await prisma.store.update({
    where: {
      id: id,
      boss_id: boss_id
    },
    data: {
      name: store_name,
    },
    include: {
      workers: true
    }
  })

  setResponseStatus(event, 201)
  
  return {
    store: store,
    message: "Store successfully edited!"
  }
})