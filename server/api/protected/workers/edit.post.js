import { hash } from "bcrypt"
import { getServerSession } from '#auth'

//Have to check if boss owns worker
export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id) {
    return { statusCode: 400, statusMessage: 'You must be a boss account to delete a user.' }
  }

  let { id, username, name, email, password, prevUsername } = await readBody(event)

  //Check if the bare minimum was filled out
  if (!username || !name) {
    return {statusCode: 400, statusMessage: "All fields are required."}
  }

  //Check username params
  if (!/^(?:[a-zA-Z0-9]{3,15})$/.test(username)) {
    return {statusCode: 400, statusMessage: "Username must be between 3 and 15 characters and contain only letters and numbers"}
  }

  //Check password params
  if (password !== '' && password.length < 6) {
    return {statusCode: 400, statusMessage: "Password must be at least 6 characters long"}
  }

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
