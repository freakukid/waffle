<template>
  <div>
    <DashboardBoss v-if="user.is_boss" :user="user" />
    <DashboardWorker v-else :user="user" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'language']
})

const { getAuthUser } = useAuth()
const user = getAuthUser()
</script>

<style lang="scss" scoped>
h1 {
  text-align: center;
  padding: 18px 0;
}
</style>