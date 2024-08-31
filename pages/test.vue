<template>
  <div style="height: calc(100vh - 215px);width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
    <!-- <el-button @click="printReceipt()">Print</el-button> -->
  </div>
</template>

<script setup>
const { data } = useAuth()
const pinia = useStore()
const storeId = computed(pinia.getStore)


console.log(storeId.value)
</script>


<style scoped>

</style>