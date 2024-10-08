<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Delete Table">
      <p class="text-center">The following will be deleted:</p>
      <ul class="list-disc w-44 my-4 mx-auto">
        <li>Inventory</li>
        <li>Transaction History</li>
        <li>Lawaway Transactions</li>
        <li>Inventory Logs</li>
      </ul>

      <p class="text-center text-red-400"><b>This cannot be undone!</b></p>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button :loading="loading.dropTable" type="danger" @click="dropTable()">Delete</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
    
    <!-- Drop Table Btn -->
    <el-button @click="openPopup" type="danger">Drop Table</el-button>
    <!-- Drop Table Btn -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()

const loading = reactive({ dropTable: false })
const popup = ref(false)
const form = reactive({value: []})

//Component Emits,Props
const emits = defineEmits(['setInventory'])
const props = defineProps({
  storeId: {
    type: Number,
  }
})

//Prompt
function openPopup() {
  popup.value = true
}

//Request
async function dropTable() {
  //Make inventory request
  loading.dropTable = true
  let inventory = await handleInventoryRequest({
    path: 'drop-table',
    data: { store_id: props.storeId },
  })

  //Emit to parent component
  if(inventory) {
    emits('setInventory', inventory)
  }

  //Loading complete, Close popup
  loading.dropTable = false
  popup.value = false
}
</script>