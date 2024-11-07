<template>
  <div>
    <h1>Dashboard</h1>
  </div>

  <div v-if="loggedIn">
    <h1>Welcome {{ user }}!</h1>
    <p>Logged in since {{ session.loggedInAt }}</p>
    <el-button @click="logout()" type="danger">Logout</el-button>

    <!-- <div><el-button @click="replaceSessionTest()" :loading="loading">Replace Session!</el-button></div> -->

    <div><el-button @click="consoleLogUserData()">Console Log</el-button></div>
  </div>
  <div v-else>
    <h1>Not logged in</h1>
  </div>
</template>

<script setup>
import { ElNotification } from 'element-plus'
const { loggedIn, user, session, fetch, clear } = useUserSession()
const { getAuthUser, logout } = useAuth()
const loading = ref(false)

definePageMeta({
  middleware: 'unauth'
})

async function replaceSessionTest() {
  loading.value = true
  const response = await useFetchApi(`/api/auth/replace-session`, {
    method: "POST",
  })
  await fetch()
  loading.value = false

  ElNotification({ title: 'Success', message: response.message, type: 'success'})
}

function consoleLogUserData() {
  console.log(JSON.stringify(getAuthUser()))
}
</script>

<style lang="scss" scoped>
h1 {
  text-align: center;
  padding: 18px 0;
}
</style>