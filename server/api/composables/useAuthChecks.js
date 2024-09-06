import { getServerSession } from '#auth'

export default () => {
  async function getAuthUser(event) {
    const session = await getServerSession(event)
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
        view_log: true
      }
    })
      
    return permissions
  }

  return {
    getAuthUser,
    isStoreOwner,
    isStoreWorker,
    getWorkerPermissions
  }
}