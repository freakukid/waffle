<template>
  <div v-if="!loading.startedLoading" style="height: calc(100vh - 30px); width: calc(100% - 70px); padding-top: 32px; margin: 0 32px 0 auto;">
    <el-table :data="logs" style="width: 100%; height: 100%;" table-layout="auto" >
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="user.name" label="User" />
      <el-table-column prop="description" label="Action">
        <template #default="scope">
          <div v-html="scope.row.description" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'store-required', 'language']
})

//Import
const pinia = useStore()
const { formatDate } = useFormatter()
const { isBoss, getPermissions } = useChecks()
const { getLogDescription } = useHelpers()
const { handleGetRequest } = useHandleRequests()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const logs = ref([])

//General
const loading = reactive({ startedLoading: true })

//Mount
onBeforeMount(async () => {
  //If you are not permitted to be here then return to dashboard
  if(!isBossAccount.value) {
    const permissions = await getPermissions()

    if(!permissions.view_log) {
      window.location.href = '/dashboard'
      return
    }
  }

  await getLogs()
  loading.startedLoading = false
})
//Mount

async function getLogs() {
  const logsArray = await handleGetRequest(`/api/protected/log/${storeId.value}`)

  logs.value = getLogDescription(logsArray)
  
  //Test data
  // console.log(JSON.stringify(logs.value))
}
</script>