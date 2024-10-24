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

<script setup>
//Import
const { handleInventoryRequest } = useHandleRequests()
const { notify } = useNotification()
const { calcTotalCost, calcAvgCostPerItem } = useCalculations()
const offlineStore = useOfflineStore()

//Data
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
  storeId: { type: Number },
  inventory: { type: Object }
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
  let inventory = null
  const { name_column, quantity_column, cost_column } = props.inventory
  let { key, qty, costPerItem, totalCost } = form
  const prevCost = props.inventory.stock[key][cost_column]
  const prevQty = props.inventory.stock[key][quantity_column]

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

  if(prevQty < 0) {
    notify({ title: 'Warning', text: 'The Quantity of this item is less than 0. Please edit this number into a non negative number on the inventory page.', type: 'warn'})
    return
  }

  //Calculate total cost
  if(costPerItem)
    totalCost = calcTotalCost(qty, costPerItem)

  //Make inventory request
  loading.recieve = true
  const postData = { store_id: props.storeId, key: key, qty: qty, total_cost: totalCost, prev_cost: prevCost, quantity_column: quantity_column, cost_column: cost_column, timestamp: new Date() }
  const isUserOnline = await offlineStore.tryPingingServer()

  if(isUserOnline) {
    inventory = await handleInventoryRequest({ path: 'recieving', data: postData })
  } else {
    //Setup fake data to render
    const { data } = useAuth()
    const item = props.inventory.stock[key]
    const newQty = item[quantity_column] + qty
    const newCost = parseFloat(calcAvgCostPerItem(item[quantity_column], item[cost_column], newQty, totalCost)).toFixed(2)
    const fakeLogData = {
      timestamp: postData.timestamp,
      user: { name: data.value.user.name },
      action: 'recieving',
      before: { cost: prevCost },
      after: { name: item[name_column], qty: qty, total_cost: parseFloat(totalCost).toFixed(2), cost: newCost },
      item_id: key
    }

    offlineStore.addPostRequest('inventory', 'recieving', postData, { log: fakeLogData, qty: qty, cost: newCost })
    notify({ title: 'Offline Success', text: `Added to the offline queue. Changes will take effect when you're back online.`, type: 'success'})
  }

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.recieve = false
  popup.value = false
}
</script>