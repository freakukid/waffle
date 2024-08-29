import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user_id = session?.user?.id

  //Check if this user is login
  if(!user_id) {
    return { statusCode: 400, statusMessage: 'You must be login get user settings.' }
  }

  const settings = await prisma.settings.findUnique({
    where: {
      user_id: user_id
    }
  })
  
  setResponseStatus(event, 201)
  
  return {
    settings: settings,
  }
})
