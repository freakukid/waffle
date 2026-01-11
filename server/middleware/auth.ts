export default eventHandler(async (event) => {
  // Protect all API endpoints inside protected
  if (!event.node.req.url?.startsWith('/api/protected')) {
    return
  }

  // First, try session-based auth (for web app)
  const session = await getUserSession(event)

  if (session?.user) {
    return // Authenticated via session
  }

  // Second, try API key auth (for external apps)
  const apiKey = getHeader(event, 'X-API-Key')

  if (apiKey) {
    // Look up user by API key
    const settings = await prisma.settings.findUnique({
      where: { api_key: apiKey },
      include: {
        user: {
          include: {
            boss: {
              include: {
                stores: {
                  select: { id: true }
                }
              }
            },
            worker: true
          }
        }
      }
    })

    if (settings?.user) {
      const user = settings.user

      // Build user data matching session structure
      const userData: any = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        ip: settings.ip,
        language: settings.language,
        api_key: settings.api_key
      }

      if (user.boss) {
        userData.boss = user.boss
        userData.is_boss = true
      } else if (user.worker) {
        userData.worker = user.worker
        userData.is_boss = false
      }

      // Store user in event context for handlers to access
      event.context.user = userData
      event.context.isApiKeyAuth = true
      return // Authenticated via API key
    }
  }

  throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
})