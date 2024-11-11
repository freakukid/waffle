import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id

  //Check if this user is login
  if(!user_id) {
    throw new Error(`You do not have the rights to view this data`)
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
