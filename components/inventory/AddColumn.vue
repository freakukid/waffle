<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Add Column" width="300" @opened="focusInput">
      <el-form :model="form" @submit.prevent="addColumn()">
        <el-form-item prop="name">
          <el-input v-model="form.name" ref="addColumnInput" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button type="success" @click="addColumn()" :loading="loading.addColumn">Add Column</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
    
    <!-- Add Btn -->
    <el-button @click="openPopup()" type="success">Add Column</el-button>
    <!-- Add Btn -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
const { notify } = useNotification()
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
    notify({ title: 'Warning', text: 'No column name was provided.', type: 'warn'})
    return
  }

  //Check if this column already exist
  if (props.inventory.columns.includes(columnName)) {
    notify({ title: 'Warning', text: `Column '${columnName}' already exist.`, type: 'warn'})
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
</script>