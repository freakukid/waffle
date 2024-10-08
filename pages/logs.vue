<template>
  <div v-if="!loading.startedLoading" style="height: calc(100vh - 215px);width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
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
//Import
const pinia = useStore()
const { formatDate } = useFormatter()
const { isBoss, getPermissions } = useChecks()

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
  logs.value = await useFetchApi(`/api/protected/log/${storeId.value}`)

  for (const log of logs.value) {
    log.date = formatDate(log.timestamp)

    //Setup data
    if(log.action === 'import')
      log.description = `<b style="color: green">Imported</b> an excel file to create inventory.`
    else if(log.action === 'add_column')
      log.description = `<b style="color: green">Added</b> a new column: <b style="color: white">${log.after.title}</b>`
    else if(log.action === 'edit_column') {
      let html = ``
      for (let beforeString in log.after) {
        const afterString = log.after[beforeString]
        html += `<div><b style="color: yellow">Edited</b> a column from <b style="color: white">${beforeString}</b> to <b style="color: white">${afterString}</b></div>`
      }
      log.description = html
    } else if(log.action === 'delete_column')
      log.description = `<b style="color: red">Deleted</b> a column: <b style="color: white">${log.before.title}</b>`
    else if(log.action === 'add_row') {
      let html = `<span><b style="color: green">Added</b> new item:</span>`
      for (let column in log.after) {
        const value = log.after[column]
        if(value) {
          html += `<div>${column}: <b>${value}</b>`
        }
      }
      log.description = html
    } else if(log.action === 'edit_row') {
      let html = `<b style="color: yellow">Edited</b> <b>${log.before.name ? log.before.name : 'an item'}</b> from:`
      for (let column in log.before.item) {
        const beforeValue = log.before.item[column]
        const afterValue = log.after.item[column]
        if(beforeValue !== afterValue) {
          html += `<div>${column}: <b>${beforeValue}</b> to <b>${afterValue}</b></div>`
        }
      }
      log.description = html
    } else if(log.action === 'delete_row') {
      let html = `<span><b style="color: red">Deleted</b> an item:</span>`
      for (let column in log.before) {
        const value = log.before[column]
        if(value) {
          html += `<div>${column}: <b>${value}</b>`
        }
      }
      log.description = html
    } else if(log.action === 'recieving') {
      let html = `
        <span><b style="color: green">Recieved</b> <b>${log.after.name}</b></span>
        <div>Recieved Quantity: <b style="color: green">+${log.after.qty}</b></div>
        <div>Total Cost of Recieved Items: ${log.after.total_cost}</div>
        <div>Cost Per Item: From ${log.before.cost} to <b>${log.after.cost}</b></div>`

      log.description = html
    }
  }
  
  //Test data
  // console.log(JSON.stringify(logs.value))
}
</script>