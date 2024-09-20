<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Add Column" width="300" @opened="focusInput">
      <el-select
        v-model="search"
        filterable
        remote
        reserve-keyword
        placeholder="Please enter a keyword"
        :remote-method="filterInventory"
        @change="addItem"
      >
        <el-option v-for="(item, key) in options" :key="key" :label="item[store.inventory?.name_column]" :value="key" />
      </el-select>


      <el-form :model="form" @submit.prevent="addColumn()">
        <el-form-item prop="name">
          <el-input v-model="form.name" ref="addColumnInput" autocomplete="off" />
        </el-form-item>
      </el-form>


      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button type="success" @click="recieveItem()" :loading="loading.recieve">Recieve Items</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
    
    <!-- Receiving Btn -->
    <el-button @click="openPopup()" type="success">Recieving</el-button>
    <!-- Receiving Btn -->
  </div>
</template>

//Need user to select item
//Either per unit cost or total cost


<script setup>
const { handleInventoryRequest } = useHandleRequests()
const { notify } = useNotification()
const loading = reactive({ recieve: false, search: false })
const popup = ref(false)
const search = ref('')
const form = reactive({
  item: null,
  qty: 0,
  costPerItem: 0,
  totalCost: 0
})

//Component Emits,Props
const emits = defineEmits(['setInventory'])
const props = defineProps({
  storeId: {
    type: Number,
    required: true
  },
  inventory: {
    type: Object,
    required: true
  }
})

//Focus Input
const addColumnInput = ref()
const focusInput = () => {
  addColumnInput.value?.focus()
}

//Filters inventory depending on search query
const filterInventory = (query) => {
  loading.search = true
  const name = props.inventory.name_column
  if (query) {
    options.value = store.value.inventory.stock.filter((data) => {
      return data[name].toLowerCase().trim().includes(query.toLowerCase().trim())
    })
  } else {
    options.value = store.value.inventory.stock
  }
  loading.search = false
}

//Prompt
function openPopup() {
  popup.value = true
  form.name = ''
}

//Add item for the form
function addItem(item) {
  props.item = item
}

//Request
async function recieveItem() {
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