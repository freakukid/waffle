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
    const response = await useFetchApi(`/api/protected/workers/permissions/${workerId}`)
    //Return value
    return response
  }

  return {
    isBoss,
    getPermissions
  }
}