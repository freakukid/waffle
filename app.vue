<template>
  <div id="app">
    <SideBar v-if="loggedIn && !isDocsPage" />
    <div class="w-full">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { loggedIn } = useUserSession()
const isDocsPage = computed(() => route.path.startsWith('/docs'))
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
  display: flex;
  color: #ffffff;
  min-height: 100vh;
}
</style>
