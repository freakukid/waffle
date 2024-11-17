import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, updateAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const user_id = authUser.id
  const { username, name, email } = await readBody(event)

  //Check if we have required fields
  if (!username || !name || !email)
    return { statusCode: 400, statusMessage: `Required parameters are missing` }

  //Check username params
  if (!/^(?:[a-zA-Z0-9]{3,15})$/.test(username))
    return { statusCode: 400, statusMessage: `Username must be between 3 and 15 characters and contain only letters and numbers` }

  //Checks if user already exist
  const userExists = await prisma.user.findFirst({
    where: { 
      username: username
    }
  })

  if(userExists && user_id !== userExists.id)
    return { statusCode: 400, statusMessage: `Username already exist` }

  //Edit user
  const user = await prisma.user.update({
    where: {
      id: user_id
    },
    data: {
      username: username,
      name: name,
      email: email
    }
  })

  await updateAuthUser(event, user_id)

  setResponseStatus(event, 201)
  
  return {
    user: user,
    message: "User Updated!"
  }
})