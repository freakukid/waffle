<template>
  <div id="app" :class="{'pl-16': loggedIn}">
    <NuxtPage />
  </div>

  <SideBar v-if="loggedIn" />
</template>

<script setup>
const { loggedIn } = useUserSession()
const offlineStore = useOfflineStore()
const storeId = computed(() => pinia.store)

useHead({
  htmlAttrs: {
    class: 'dark',
  },
  link: [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'manifest', href: '/manifest.json' }
  ]
})

async function checkPing() {
  offlineStore.tryPingingServer()
}

//Mount
onBeforeMount(async () => {
  setInterval(checkPing, 10000)
})
//Mount
</script>

<style lang="scss" scoped>
#app {
  background: #1c1c1c;
  color: #ffffff;
  min-height: 100vh;
}
</style>
