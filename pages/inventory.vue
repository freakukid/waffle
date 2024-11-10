<template>
  <div>
    <InventoryBoss v-if="user.is_boss" />
    <InventoryWorker v-else />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'store-required']
})
//Imports
const { getAuthUser } = useAuth()
//Data
const user = getAuthUser()
</script>