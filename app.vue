<template>
  <NuxtNotifications position="top center" :pauseOnHover='true' />

  <div id="app">
    <NavBar />
    <NuxtPage />
    <SideBar v-if="storeId" />
  </div>
</template>

<script setup>
const pinia = useStore()
const storeId = computed(() => pinia.store)

useHead({
  htmlAttrs: {
    class: 'dark',
  },
})
</script>

<style lang="scss">
.page-enter-active, .page-leave-active {
  transition: opacity 0.5s ease;
  animation: pulse 0.5s ease forwards;
}

.page-enter, .page-leave-to {
  opacity: 0;
}

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
  margin-top: 40px;
  min-height: calc(100vh - 40px);
}
</style>
