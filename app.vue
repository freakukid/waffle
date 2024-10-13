<template>
  <NuxtNotifications position="top center" :pauseOnHover='true' />

  <div id="app">
    <NuxtPage />
  </div>

  <SideBar v-if="status === 'authenticated'" />
</template>

<script setup>
const { status } = useAuth()
const pinia = useStore()
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
</script>

<style lang="scss">
.vue-notification-group {
  top: 5px !important;
  max-width: calc(100vw - 50px);
  left: 50% !important;
  transform: translateX(-50%);
  cursor: default;
  user-select: none;
  border-left: none;
  font-size: 14px;
  text-align: center;

  &.success {
    background:#4CD77580;
  }

  &.warn {
    background: #ffb3407d;
  }

  &.error {
    background: rgba(221, 80, 80, 0.5)
  }

  .notification-title {
    font-size: 16px;
  }

  .vue-notification-template {
    backdrop-filter: blur(12px);
    border-radius: 2px;
    border: none;
  }
}
</style>

<style lang="scss" scoped>
#app {
  background: #1c1c1c;
  color: #ffffff;
  min-height: 100vh;
  padding-left: 64px;
}
</style>
