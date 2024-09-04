import { getServerSession } from '#auth'

export default () => {
  async function getAuthUser(event) {
    const session = await getServerSession(event)
    return session.user
  }

  function isStoreOwner(user, store_id) {
    if(user.is_boss) {
      const stores = user.boss.stores
      return stores.some(store => store.id === store_id)
    } else {
      return false
    }
  }

  function isStoreWorker(user, store_id) {
    if(!user.is_boss) {
      return user.worker.store_id === store_id
    } else {
      return false
    }
  }

  return {
    getAuthUser,
    isStoreOwner,
    isStoreWorker
  }
}