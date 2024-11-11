<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.sort columns`)" width="300">
      <el-tree :data="form.value" draggable :allow-drop="allowDrop" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button disabled type="warning">{{$t(`label.sort`)}}</el-button>
          </el-tooltip>
          <el-button v-else type="warning" @click="sortColumn()" :loading="loading.sortColumn">{{$t(`label.sort`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
const offlineStore = useOfflineStore()

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

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>