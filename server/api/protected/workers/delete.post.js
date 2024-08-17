import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id) {
    return { statusCode: 400, statusMessage: 'You must be a boss account to delete a user.' }
  }

  let { id } = await readBody(event)

  //Check if we have a store id
  if (!id) {
    return { statusCode: 400, statusMessage: 'User id is required.' }
  }

  //Delete all users associated with boss
  const user = await prisma.user.delete({
    where: {
      id,
      worker: {
        store: {
          boss_id: boss_id
        }
      }
    }
  })

  if(!user) {
    return { statusCode: 400, statusMessage: 'User was not found.' }
  }

  setResponseStatus(event, 201)
  
  return {
    message: "User deleted"
  }
})