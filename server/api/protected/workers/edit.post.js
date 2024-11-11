import { hash } from "bcrypt"
import useAuthChecks from '../../composables/useAuthChecks'

//Have to check if boss owns worker
export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const boss_id = authUser?.boss?.id
  const { id, store_id, username, name, email, password, prevUsername } = await readBody(event)

  //Check if we have required fields
  if (!id, !store_id || !username || !name)
    return {statusCode: 400, statusMessage: `Required parameters are missing.`}

  //Check if this user has access rights to view workers
  if(!isStoreOwner(authUser, store_id))
    return {statusCode: 400, statusMessage: `You do not have access rights to create a worker in this store.`}

  //Check username params
  if (!/^(?:[a-zA-Z0-9]{3,15})$/.test(username))
    return {statusCode: 400, statusMessage: "Username must be between 3 and 15 characters and contain only letters and numbers"}

  //Check password params
  if (password !== '' && password.length < 6)
    return {statusCode: 400, statusMessage: "Password must be at least 6 characters long"}

  //Checks if user already exist if username was changed
  if(username !== prevUsername) {
    const userExists = await prisma.user.findFirst({
      where: { 
        OR: [
          { username: username }
        ]
      }
    })

    if(userExists) {
      return {statusCode: 403, statusMessage: "Account username already exists"}
    }
  }

  let user = null

  try {
    //Setup data
    const dataToUpdate = {
      username: username,
      name: name,
      email: email ? email : '',
    }

    // Check if password is provided and not an empty string
    if (password && password !== '') {
      dataToUpdate.password = await hash(password, 12)
    }

    // Edit a user
    user = await prisma.user.update({
      where: {
        id,
        worker: {
          store: {
            boss_id: boss_id
          }
        }
      },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        name: true,
        email: true
      }
    })
  } catch (error) {
    console.error(error)
    return {statusCode: 500, statusMessage: "Error editing user"}
  }

  setResponseStatus(event, 201)
  
  return { user: user, message: "User edited" }
})