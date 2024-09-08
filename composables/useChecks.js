import { useAuth } from '#imports'

export default () => {
  function isBoss() {
    const { data } = useAuth()
    const user = data?.value?.user

    return user.is_boss
  }

  //Gets workers permission
  async function getPermissions() {
    //Setup data
    const { data } = useAuth()
    const workerId = data?.value?.user?.worker?.id
    //Make request
    let response = null
    try {
      response = await useFetchApi(`/api/protected/workers/permissions/${workerId}`)
    } catch (e) { //If permissions can't be retrieved user might be deleted so sign him out
      const { signOut } = useAuth()
      signOut({ callbackUrl: '/login' })
    }

    //Return value
    return response
  }

  return {
    isBoss,
    getPermissions
  }
}