import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, updateAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser?.id
  const { ip, language } = await readBody(event)

  //Edit settings
  const settings = await prisma.settings.update({
    where: {
      user_id: user_id
    },
    data: {
      ip: ip,
      language: language
    }
  })

  await updateAuthUser(event, authUser.id)

  setResponseStatus(event, 201)
  
  return {
    settings: settings,
    message: "Settings Updated!"
  }
})