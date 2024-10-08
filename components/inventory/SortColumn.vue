<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Sort Columns">
      <el-tree :data="form.value" draggable :allow-drop="allowDrop" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button type="warning" @click="sortColumn()" :loading="loading.sortColumn">Sort</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
    
    <!-- Sort Btn -->
    <el-button @click="openPopup()" type="warning">Sort Columns</el-button>
    <!-- Sort Btn -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()

const loading = reactive({ sortColumn: false })
const popup = ref(false)
const form = reactive({value: []})

//Component Emits, Props
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
function openPopup() {
  popup.value = true
  form.value = props.inventory.columns.map(item => ({ label: item }))
}

//Prevent dragging inside a node for element plus
const allowDrop = (draggingNode, dropNode, type) => {
  if(type === 'inner') {
    return false
  } else {
    return true
  }
}

//Request
async function sortColumn() {
  //Make inventory request
  loading.sortColumn = true
  let inventory = await handleInventoryRequest({
    path: 'sort-columns',
    data: { store_id: props.storeId, columns: form.value.map(item => item.label)}
  })

  //Emit to parent component
  if(inventory) {
    emits('setInventory', inventory)
  }

  //Loading complete, Close popup
  loading.sortColumn = false
  popup.value = false
}
</script>