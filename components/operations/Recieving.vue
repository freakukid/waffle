<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Recieve Item">
      <label>Item Recieved:</label>
      <el-select
        v-model="search"
        filterable
        remote
        reserve-keyword
        placeholder="Please enter a keyword"
        :remote-method="filterInventory"
        @change="addItem"
      >
        <el-option v-for="(item, key) in options" :key="key" :label="item[inventory?.name_column]" :value="key" />
      </el-select>

      <el-form :model="form" @submit.prevent="recieveItem()" style="margin-top: 16px;">
        <label>Qty Recieved:</label>
        <el-form-item prop="tax">
          <el-input-number v-model="form.qty" />
        </el-form-item>

        <p>You can either submit cost per item or total cost of all items recieved</p>

        <div style="display:flex; align-items:center; gap: 10px;">
          <div>
            <label>Cost Per Item:</label>
            <el-form-item prop="tax">
              <el-input-number v-model="form.costPerItem" :precision="2" @change="form.totalCost = 0" />
            </el-form-item>
          </div>

          <div>or</div>

          <div>
            <label>Total Cost:</label>
            <el-form-item prop="tax">
              <el-input-number v-model="form.totalCost" :precision="2" @change="form.costPerItem = 0" />
            </el-form-item>
          </div>
        </div>
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
    <el-tooltip v-if="!inventory.name_column || !inventory.quantity_column || !inventory.cost_column" content="Name, Quantity, Cost Column must be registered before recieving." placement="top">
      <el-button disabled type="success">Recieving</el-button>
    </el-tooltip>
    <el-button v-else @click="openPopup()" type="success">
      <span>Recieving</span>
    </el-button>
    <!-- Receiving Btn -->
  </div>
</template>

//Need user to select item
//Either per unit cost or total cost


<script setup>
const { handleInventoryRequest } = useHandleRequests()
const { notify } = useNotification()
const { calcTotalCost } = useCalculations()
const loading = reactive({ recieve: false, search: false })
const popup = ref(false)
const search = ref('')
const options = ref([])

const form = reactive({
  key: 0,
  qty: 0,
  costPerItem: 0,
  totalCost: 0
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

//Filters inventory depending on search query
const filterInventory = (query) => {
  loading.search = true
  const { name_column, stock } = props.inventory
  if (query) {
    const filteredDictionary = {}

    for (const key in stock) {
      const data = stock[key]
      if (data[name_column].toLowerCase().includes(query.toLowerCase()))
        filteredDictionary[key] = data
    }
    
    options.value = filteredDictionary
  } else {
    options.value = stock
  }
  loading.search = false
}

//Prompt
function openPopup() {
  form.key = 0
  form.qty = 0
  form.costPerItem = 0
  form.totalCost = 0
  search.value = ''
  options.value = []

  popup.value = true
}

//Add item to form
function addItem(key) {
  form.key = key
}

//Request
async function recieveItem() {
  const { quantity_column, cost_column } = props.inventory
  let { key, qty, costPerItem, totalCost } = form
  const prevCost = props.inventory.stock[key][cost_column]

  //Checks
  if(!key) {
    notify({ title: 'Warning', text: 'No item was selected.', type: 'warn'})
    return
  }

  if(!qty) {
    notify({ title: 'Warning', text: 'Must have a quantity greater than 0.', type: 'warn'})
    return
  }

  if(!costPerItem && !totalCost) {
    notify({ title: 'Warning', text: 'Cost per item or Total cost is required.', type: 'warn'})
    return
  }

  //Calculate total cost
  if(costPerItem)
    totalCost = calcTotalCost(qty, costPerItem)

  //Make inventory request
  loading.recieve = true
  let inventory = await handleInventoryRequest({
    path: 'recieving',
    data: { store_id: props.storeId, key: key, qty: qty, total_cost: totalCost, prev_cost: prevCost, quantity_column: quantity_column, cost_column: cost_column },
  })

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.recieve = false
  popup.value = false
}
</script>