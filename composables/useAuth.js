export default () => {
  function getAuthUser() {
    const { user } = useUserSession()

    return user.value
  }

  async function logout() {
    const { fetch, clear } = useUserSession()

    await clear()
    await fetch()
  
    navigateTo('/login')
  }

  return {
    getAuthUser,
    logout
  }
}