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
      worker: true
    }
  })

  if(!user) {
    throw createError({
      statusCode: 403,
      statusMessage: "User not found.",
    })
  }

  const isPasswordValid = await compare(password, user.password)

  if (!isPasswordValid) {
    throw createError({
      statusCode: 403,
      statusMessage: "Invalid password.",
    })
  }

  //Setup session data
  const userData = {
    id: user.id,
    username: user.username,
    email: user.email
  }

  if(user.boss) {
    userData.boss = user.boss
    userData.is_boss = true
  } else if(user.worker) {
    userData.worker = user.worker
    userData.is_boss = false
  }

  await setUserSession(event, { user: userData, loggedInAt: new Date() })

  setResponseStatus(event, 201)
  
  return { message: 'Login successful' }
})
