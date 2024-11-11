<template>
  <div>
    <h1>Dashboard</h1>
  </div>

  <div v-if="loggedIn">
    <h1>Welcome {{ user }}!</h1>
    <p>Logged in since {{ session.loggedInAt }}</p>
    <el-button @click="logout()" type="danger">Logout</el-button>

    <div><el-button @click="consoleLogUserData()">Console Log</el-button></div>
  </div>
  <div v-else>
    <h1>Not logged in</h1>
  </div>



  <div>
    <p>Current Locale: {{ $getLocale() }}</p>
    <div>
      <button
        v-for="locale in $getLocales()"
        class="block"
        :key="locale.code"
        :disabled="locale.code === $getLocale()"
        @click="() => $switchLocale(locale.code)"
      >
        Switch to {{ $t(locale.code) }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { $getLocale, $switchLocale, $getLocales, $t } = useNuxtApp()
const { loggedIn, user, session, fetch, clear } = useUserSession()
const { getAuthUser, logout } = useAuth()
const loading = ref(false)

definePageMeta({
  middleware: 'unauth'
})

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