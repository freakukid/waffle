<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t('title.item received')">
      <label v-if="form.item[inventory.name_column]" class="block text-center text-base"><b>{{form.item[inventory.name_column]}}</b></label>
      <el-form :model="form" @submit.prevent="receiveItem()" style="margin-top: 16px;">

        <div class="text-center mb-2">{{$t('title.quantity received')}}</div>
        <div class="flex items-center justify-center">
          <el-form-item prop="tax">
            <el-input-number v-model="form.qty" />
          </el-form-item>
        </div>

        <p class="text-center mb-2">{{$t('text.please provide either the cost for each item or the total cost for all items received')}}</p>

        <div class="flex items-center justify-center gap-4">
          <div>
            <div class="text-center mb-2">{{$t('title.cost per item')}}</div>
            <el-form-item prop="tax">
              <el-input-number v-model="form.costPerItem" :precision="2" @change="form.totalCost = 0" />
            </el-form-item>
          </div>

          <div>{{$t('label.or')}}</div>

          <div>
            <div class="text-center mb-2">{{$t('title.total cost')}}:</div>
            <el-form-item prop="tax">
              <el-input-number v-model="form.totalCost" :precision="2" @change="form.costPerItem = 0" />
            </el-form-item>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-button type="success" @click="receiveItem()" :loading="loading.receive">{{$t(`label.receive`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
//Import
const { sendFrontendNotification } = useHelpers()
const { handleInventoryRequest } = useHandleRequests()
const { calcTotalCost, calcAvgCostPerItem } = useCalculations()
const offlineStore = useOfflineStore()

//Data
const loading = reactive({ receive: false })
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
async function receiveItem() {
  let inventory = null
  const { name_column, quantity_column, cost_column } = props.inventory
  let { key, qty, costPerItem, totalCost } = form
  const prevCost = props.inventory.stock[key][cost_column]
  const prevQty = props.inventory.stock[key][quantity_column]

  //Checks
  if(!key) {
    sendFrontendNotification('No changes were provided', 'warn')
    return
  }

  if(!qty) {
    sendFrontendNotification('Please enter a quantity greater than 0', 'warn')
    return
  }

  if(!costPerItem && !totalCost) {
    sendFrontendNotification('Please specify either the cost per item or the total cost', 'warn')
    return
  }

  if(prevQty < 0) {
    sendFrontendNotification('The quantity of this item is below 0, please revise this number to a non-negative value on the inventory page', 'warn')
    return
  }

  //Calculate total cost
  if(costPerItem)
    totalCost = calcTotalCost(qty, costPerItem)

  //Make inventory request
  loading.receive = true
  const postData = { store_id: props.storeId, key: key, qty: qty, total_cost: totalCost, prev_cost: prevCost, quantity_column: quantity_column, cost_column: cost_column, timestamp: new Date() }
  const isUserOnline = await offlineStore.tryPingingServer()

  if(isUserOnline) {
    inventory = await handleInventoryRequest({ path: 'receiving', data: postData })
  } else {
    //Setup fake data to render
    const { getAuthUser } = useAuth()
    const user = getAuthUser()
    const item = props.inventory.stock[key]
    const newQty = item[quantity_column] + qty
    const newCost = parseFloat(calcAvgCostPerItem(item[quantity_column], item[cost_column], newQty, totalCost)).toFixed(2)
    const fakeLogData = {
      timestamp: postData.timestamp,
      user: { name: user.name },
      action: 'receiving',
      before: { cost: prevCost },
      after: { name: item[name_column], qty: qty, total_cost: parseFloat(totalCost).toFixed(2), cost: newCost },
      item_id: key
    }

    offlineStore.addPostRequest('inventory', 'receiving', postData, { log: fakeLogData, qty: qty, cost: newCost })
    sendFrontendNotification(`Your changes have been added to the offline queue and will take effect once you're back online`, 'offline_success')
  }

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.receive = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>