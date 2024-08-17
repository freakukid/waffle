import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id) {
    return { statusCode: 400, statusMessage: 'You must be a boss account to create a store.' }
  }

  let { id } = await readBody(event)

  //Check if we have a store id
  if (!id) {
    return { statusCode: 400, statusMessage: 'Store id is required.' }
  }

  //Delete all users associated with the store
  await prisma.user.deleteMany({
    where: {
      worker: {
        store: {
          id: id,
        }
      }
    }
  })

  //Delete store
  const store = await prisma.store.delete({
    where: {
      id
    }
  })

  setResponseStatus(event, 201)
  
  return {
    store_id: store.id,
    message: "Store deleted!"
  }
})