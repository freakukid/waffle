<template>
  <div>
    <h1 class="text-3xl pt-16 text-center">Offline Manager</h1>

    <div v-if="requests.length">
      <!-- LOGS -->
      <div v-if="logs.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">Pending Inventory Operations</h1>
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
      <!-- LOGS -->
    </div>

    <div v-else>
      <h1 class="my-8 text-center">Nothing in queue!</h1>
    </div>
  </div>
</template>

<script setup>
//Import
const pinia = useStore()
const offlineStore = useOfflineStore()
const { formatDate } = useFormatter()
const { getLogDescription } = useHelpers()
const requests = computed(offlineStore.getRequests)

//Data
const logs = computed(() => {
  return (requests.value || []).filter(item => item.category === 'inventory').map(item => item.log)
})

//General
const loading = reactive({ startedLoading: true })

//Mount
onBeforeMount(async () => {
  getLogs()
  loading.startedLoading = false
})
//Mount

function getLogs() {
  logs.value = getLogDescription(logs.value)
  
  //Test data
  // console.log(JSON.stringify(logs.value))
}
</script>