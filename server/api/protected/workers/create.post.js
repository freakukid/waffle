import { hash } from "bcrypt"
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id) {
    return { statusCode: 400, statusMessage: 'You must be a boss account to create a user.' }
  }

  let { username, name, email, password, store_id } = await readBody(event)

  //Check if the bare minimum was filled out
  if (!username || !password || !name) {
    return {statusCode: 400, statusMessage: "All fields are required."}
  }

  //Check username params
  if (!/^(?:[a-zA-Z0-9]{3,15})$/.test(username)) {
    return {statusCode: 400, statusMessage: "Username must be between 3 and 15 characters and contain only letters and numbers"}
  }

  //Check password params
  if (password.length < 6) {
    return {statusCode: 400, statusMessage: "Password must be at least 6 characters long"}
  }

  //Checks if user already exist
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

  let worker = null

  try {
    // Create a new user
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email: email ? email : '',
        password: await hash(password, 12)
      }
    })

    //Connect user to worker, store to worker
    worker = await prisma.worker.create({
      data: {
        user: { connect: { id: user.id } },
        store: { connect: { id: store_id } }
      }
    })

    //Connect worker to permission
    const permission = await prisma.permission.create({
      data: {
        worker: { connect: { id: worker.id } },
      }
    })
    
    //Connect user to settings
    const settings = await prisma.settings.create({
      data: {
        user: { connect: { id: user.id } },
      }
    })
  } catch (error) {
    console.error(error)
    return {statusCode: 500, statusMessage: "Error creating user"}
  }

  //Get user
  const newUser = await prisma.worker.findUnique({
    where: {
      id: worker.id
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true
        }
      },
      permission: {
        select: {
          add_item: true,
          edit_item: true,
          delete_item: true
        }
      }
    },
  })

  setResponseStatus(event, 201)
  
  return { message: "User created", user: newUser }
})
