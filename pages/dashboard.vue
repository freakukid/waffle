<template>
  <div>
    <h1>Dashboard</h1>

    <DashboardBoss v-if="data.user.is_boss" :user="data.user" />
    <DashboardWorker v-else :user="data.user" />
  </div>
</template>

<script setup>
const { data } = useAuth()
</script>

<style lang="scss" scoped>
h1 {
  text-align: center;
  padding: 18px 0;
}
</style>