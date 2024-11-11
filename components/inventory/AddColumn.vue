<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.add column`)" width="300" @opened="focusInput">
      <el-form :model="form" @submit.prevent="addColumn()">
        <el-form-item prop="name">
          <el-input v-model="form.name" ref="addColumnInput" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>

          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button disabled type="success">{{$t(`label.add`)}}</el-button>
          </el-tooltip>
          <el-button v-else type="success" @click="addColumn()" :loading="loading.addColumn">{{$t(`label.add`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
import { ElNotification } from 'element-plus'
const offlineStore = useOfflineStore()

const loading = reactive({ addColumn: false })
const popup = ref(false)
const form = reactive({
  name: '',
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

//Focus Input
const addColumnInput = ref()
const focusInput = () => {
  addColumnInput.value?.focus()
}

//Prompt
function openPopup() {
  popup.value = true
  form.name = ''
}

//Request
async function addColumn() {
  const columnName = form.name.trim()

  //Check if we at least have a string
  if(!columnName) {
    ElNotification({ title: 'Warning', message: 'No column name was provided.', type: 'warn'})
    return
  }

  //Check if this column already exist
  if (props.inventory.columns.includes(columnName)) {
    ElNotification({ title: 'Warning', message: `Column '${columnName}' already exist.`, type: 'warn'})
    return
  }

  //Make inventory request
  loading.addColumn = true
  let inventory = await handleInventoryRequest({
    path: 'add-column',
    data: { store_id: props.storeId, column_name: columnName },
  })

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.addColumn = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>