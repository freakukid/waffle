import useAuthChecks from '../../composables/useAuthChecks'
import { hash } from "bcrypt"

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, updateAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser.id
  const { password } = await readBody(event)

  //Check if we have required fields
  if (!password)
    return { statusCode: 400, statusMessage: `Required parameters are missing` }

  //Check password params
  if (password.length < 6)
    return { statusCode: 400, statusMessage: `Password must be at least 6 characters long` }

  //Edit user
  const user = await prisma.user.update({
    where: {
      id: user_id
    },
    data: {
      password: await hash(password, 12)
    }
  })

  await updateAuthUser(event, user_id)

  setResponseStatus(event, 201)
  
  return {
    user: user,
    message: "Password Updated!"
  }
})