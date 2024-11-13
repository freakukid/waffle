import { compare } from 'bcrypt'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  const user = await prisma.user.findUnique({
    where: { username: username },
    include: {
      boss: {
        include: {
          stores: {
            select: {
              id: true
            }
          } 
        }
      },
      worker: true,
      settings: {
        select: {
          ip: true,
          language: true
        }
      }
    }
  })

  if(!user) {
    return { statusCode: 403, statusMessage: `User not found` }
  }

  const isPasswordValid = await compare(password, user.password)

  if (!isPasswordValid) {
    return { statusCode: 403, statusMessage: `Invalid password` }
  }

  //Setup session data
  const userData = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    ip: user.settings.ip,
    language: user.settings.language
  }

  if(user.boss) {
    userData.boss = user.boss
    userData.is_boss = true
  } else if(user.worker) {
    userData.worker = user.worker
    userData.is_boss = false
  }

  await setUserSession(event, { user: userData, loggedInAt: new Date() }, { maxAge: 60 * 60 * 24 * 30 })

  setResponseStatus(event, 201)
  
  return { message: 'Login Successful!' }
})
