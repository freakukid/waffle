import useAuthChecks from '../../composables/useAuthChecks'
import crypto from 'crypto'

function generateApiKey() {
  return 'wfl_' + crypto.randomBytes(32).toString('hex')
}

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, updateAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser.id
  const { ip, language, regenerate } = await readBody(event)

  // Get current settings to check api_key
  const currentSettings = await prisma.settings.findUnique({
    where: { user_id: user_id }
  })

  // Generate API key if null or regenerate requested
  let api_key = currentSettings?.api_key
  if (!api_key || regenerate) {
    api_key = generateApiKey()
  }

  //Edit settings
  const settings = await prisma.settings.update({
    where: {
      user_id: user_id
    },
    data: {
      ip: ip ? ip : authUser.ip,
      language: language ? language : authUser.language,
      api_key: api_key
    }
  })

  await updateAuthUser(event, user_id)

  setResponseStatus(event, 201)

  return {
    settings: settings,
    message: "Settings Updated!"
  }
})