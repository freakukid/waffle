export default () => {
  function isBoss() {
    const { getAuthUser } = useAuth()

    return getAuthUser().is_boss
  }

  //Gets workers permission
  async function getPermissions() {
    //Setup data
    const { getAuthUser } = useAuth()
    const user = getAuthUser()
    const workerId = user.worker?.id
    //Make request
    let response = null
    try {
      response = await useFetchApi(`/api/protected/workers/permissions/${workerId}`)
    } catch (e) { //If permissions can't be retrieved user might be deleted so sign him out
      const { logout } = useAuth()
      logout()
    }

    //Return value
    return response
  }

  return {
    isBoss,
    getPermissions
  }
}