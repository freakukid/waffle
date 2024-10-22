<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Delete Item">
      <p style="text-align: center; color: #ff4545; font-size: 24px;">
        <b>Are you sure you want to delete the following row?</b>
      </p>

      <el-table :data="[form.row]" style="width: 100%; height: 100%;" table-layout="auto">
        <el-table-column v-for="column in props.inventory.columns" :key="column" :prop="column" :label="column" />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>

          <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
            <el-button disabled type="danger">Delete</el-button>
          </el-tooltip>
          <el-button v-else type="danger" @click="deleteRow()" :loading="loading.deleteRow">Delete</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
const offlineStore = useOfflineStore()

const loading = reactive({ deleteRow: false })
const popup = ref(false)
const form = reactive({
  key: 0,
  row: {}
})

//Component Emits,Props
const emits = defineEmits(['setInventory'])
const props = defineProps({
  storeId: {
    type: Number,
  },
  inventory: {
    type: Object,
  }
})

//Prompt
function openPopup(row) {
  popup.value = true
  form.key = row.__id
  form.row = row
}

//Request
async function deleteRow() {
  //Make inventory request
  loading.deleteRow = true
  let inventory = await handleInventoryRequest({
    path: 'delete-row',
    data: { store_id: props.storeId, key: form.key, item: form.row },
  })

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)
  
  //Loading complete, Close popup
  loading.deleteRow = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>