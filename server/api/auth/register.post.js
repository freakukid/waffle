import { hash } from "bcrypt"

export default defineEventHandler(async (event) => {
  let { username, name, email, password, storeCode, storeName } = await readBody(event)

  //Check if the bare minimum was filled out
  if (!username || !password || !name || !storeName) {
    throw createError({statusCode: 400, statusMessage: `Required parameters are missing`})
  }

  //Check if we at least have a store code or store name
  // if (!storeCode && !storeName) {
  //   throw createError({statusCode: 400, statusMessage: "Either Store Code or Store Name must be provided"})
  // }

  //Check username params
  if (!/^(?:[a-zA-Z0-9]{3,15})$/.test(username)) {
    throw createError({statusCode: 400, statusMessage: "Username must be between 3 and 15 characters and contain only letters and numbers"})
  }

  //Check password params
  if (password.length < 6) {
    throw createError({statusCode: 400, statusMessage: "Password must be at least 6 characters long"})
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
    throw createError({statusCode: 403, statusMessage: "Username already exist"})
  }

  const isBoss = !storeCode && storeName
  let store = null
  // Check if a store exist for a worker
  if(!isBoss) {
    store = await prisma.store.findFirst({ where: { code: storeCode } })
    if (!store) {
      throw createError({statusCode: 400, statusMessage: "Store not found"})
    }
  }

  try {
    if(isBoss) {
      // Create a new user
      const user = await prisma.user.create({
        data: {
          username,
          name,
          email,
          password: await hash(password, 12)
        }
      })

      //Connect user to settings
      const settings = await prisma.settings.create({
        data: {
          user: { connect: { id: user.id } },
        }
      })

      //Connect boss to user
      const boss = await prisma.boss.create({
        data: {
          user: { connect: { id: user.id } }
        }
      })

      //Create store 
      const store = await prisma.store.create({
        data: {
          name: storeName,
          code: `${Array.from({ length: 3 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + (Math.random() < 0.5 ? 65 : 97))).join('')}${storeName.substring(0, 3).replace(/[^a-zA-Z]/g, '').split('').sort(() => Math.random() < 0.5 ? -1 : 1).join('')}`,
          boss: { connect: { id: boss.id } }
        }
      })
    } else {
      // Create a new user
      const user = await prisma.user.create({
        data: {
          username,
          name,
          email: email ? email : '',
          password: await hash(password, 12)
        }
      })

      //Connect user to settings
      const settings = await prisma.settings.create({
        data: {
          user: { connect: { id: user.id } },
        }
      })

      //Connect user to worker, store to worker
      const worker = await prisma.worker.create({
        data: {
          user: { connect: { id: user.id } },
          store: { connect: { id: store.id } }
        }
      })

      //Connect worker to permission
      const permission = await prisma.permission.create({
        data: {
          worker: { connect: { id: worker.id } },
        }
      })
    }
  } catch (error) {
    console.error(error)
    throw createError({statusCode: 500, statusMessage: "Error updating user"})
  }

  setResponseStatus(event, 201)
  
  return { message: "User Created!" }
})
