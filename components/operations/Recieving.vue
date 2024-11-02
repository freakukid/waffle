<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Item Recieved">
      <label v-if="form.item[inventory.name_column]" class="block text-center text-base"><b>{{form.item[inventory.name_column]}}</b></label>
      <el-form :model="form" @submit.prevent="recieveItem()" style="margin-top: 16px;">

        <div class="text-center mb-2">Qty Recieved:</div>
        <div class="flex items-center justify-center">
          <el-form-item prop="tax">
            <el-input-number v-model="form.qty" />
          </el-form-item>
        </div>

        <p class="text-center mb-2">You can either submit cost per item or total cost of all items recieved.</p>

        <div class="flex items-center justify-center gap-4">
          <div>
            <div class="text-center mb-2">Cost Per Item:</div>
            <el-form-item prop="tax">
              <el-input-number v-model="form.costPerItem" :precision="2" @change="form.totalCost = 0" />
            </el-form-item>
          </div>

          <div>or</div>

          <div>
            <div class="text-center mb-2">Total Cost:</div>
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
    <!-- <el-tooltip v-if="!inventory.name_column || !inventory.quantity_column || !inventory.cost_column" content="Name, Quantity, Cost Column must be registered before recieving." placement="top">
      <el-button disabled type="success">Recieving</el-button>
    </el-tooltip>
    <el-button v-else @click="openPopup()" type="success">
      <span>Recieving</span>
    </el-button> -->
    <!-- Receiving Btn -->
  </div>
</template>

<script setup>
//Import
import { ElNotification } from 'element-plus'
const { handleInventoryRequest } = useHandleRequests()
const { calcTotalCost, calcAvgCostPerItem } = useCalculations()
const offlineStore = useOfflineStore()

//Data
const loading = reactive({ recieve: false })
const popup = ref(false)
const search = ref('')
const options = ref([])

const form = reactive({
  item: {},
  key: 0,
  qty: 0,
  costPerItem: 0,
  totalCost: 0
})

//Component Emits,Props
const emits = defineEmits(['setInventory'])
const props = defineProps({
  storeId: { type: Number },
  inventory: { type: Object },
})

//Prompt
function openPopup(item) {
  form.item = item
  form.key = item.__id
  form.qty = 0
  form.costPerItem = 0
  form.totalCost = 0
  search.value = ''
  options.value = []

  popup.value = true
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
    ElNotification({ title: 'Warning', message: 'No item was selected.', type: 'warn'})
    return
  }

  if(!qty) {
    ElNotification({ title: 'Warning', message: 'Must have a quantity greater than 0.', type: 'warn'})
    return
  }

  if(!costPerItem && !totalCost) {
    ElNotification({ title: 'Warning', message: 'Cost per item or Total cost is required.', type: 'warn'})
    return
  }

  if(prevQty < 0) {
    ElNotification({ title: 'Warning', message: 'The Quantity of this item is less than 0. Please edit this number into a non negative number on the inventory page.', type: 'warn'})
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
    ElNotification({ title: 'Offline Success', message: `Added to the offline queue. Changes will take effect when you're back online.`, type: 'success'})
  }

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.recieve = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>