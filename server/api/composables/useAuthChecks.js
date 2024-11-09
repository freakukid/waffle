export default () => {
  async function getAuthUser(event) {
    const session = await getUserSession(event)
    return session.user
  }

  function isStoreOwner(user, store_id) {
    if(user.is_boss) {
      const stores = user.boss.stores
      
      return stores.some(store => store.id === parseInt(store_id))
    } else {
      return false
    }
  }

  function isStoreWorker(user, store_id) {
    if(!user.is_boss) {
      return user.worker.store_id === parseInt(store_id)
    } else {
      return false
    }
  }

  async function getWorkerPermissions(worker_id) {
    //Get permissions
    const permissions = await prisma.permission.findUnique({
      where: {
        worker_id: parseInt(worker_id)
      },
      select: {
        add_item: true,
        edit_item: true,
        delete_item: true,
        make_transactions: true,
        view_log: true,
        recieving: true,
      }
    })
      
    return permissions
  }

  async function updateAuthUser(event, id) {
    const user = await prisma.user.findUnique({
      where: { id: id },
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

    await replaceUserSession(event, { user: userData, loggedInAt: new Date() })
  }

  return {
    getAuthUser,
    isStoreOwner,
    isStoreWorker,
    getWorkerPermissions,
    updateAuthUser
  }
}