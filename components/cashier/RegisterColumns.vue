<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Register Columns" :show-close="props.inventory?.name_column !== '' && props.inventory?.price_column !== ''" :close-on-click-modal="props.inventory?.name_column !== '' && props.inventory?.price_column !== ''">
      <p>In order to get the cashier working you would need to register columns in your inventory.</p>
      <el-form :model="form" @submit.prevent="registerColumns()">
        <el-form-item>
          <label><b>Name (Required):&nbsp;</b></label>
          <p>This is the column that contains the name of the product.</p>
          <el-select v-model="form.name" placeholder="Select" size="large" style="width: 100%">
            <div :key="column" v-for="column in props.inventory.columns.filter(item => 
            (!form.price || !item.includes(form.price)) && 
            (!form.quantity || !item.includes(form.quantity)) &&
            (!form.discount || !item.includes(form.discount)) &&
            (!form.cost || !item.includes(form.cost)))">
              <el-option :label="column" :value="column" />
            </div>
          </el-select>

          <label><b>Price (Required):&nbsp;</b></label>
          <p>This is the column that will contain the price of the item. (This will force all data in this column to be float numbers and accept only whole numbers/float numbers [0.00]).</p>
          <el-select v-model="form.price" placeholder="Select" size="large">
            <div :key="column" v-for="column in props.inventory.columns.filter(item => 
            (!form.name || !item.includes(form.name)) && 
            (!form.quantity || !item.includes(form.quantity)) &&
            (!form.discount || !item.includes(form.discount)) &&
            (!form.cost || !item.includes(form.cost)))">
              <el-option :label="column" :value="column" />
            </div>
          </el-select>

          <label><b>Quantity (Optional):&nbsp;</b></label>
          <p>This is the column that will be subtracted when an item is bought. (This will change all data to be whole numbers and accept only whole numbers.) [1, 2, 10, etc.]</p>
          <el-select v-model="form.quantity" placeholder="Select" size="large" clearable>
            <div :key="column" v-for="column in props.inventory.columns.filter(item => 
            (!form.name || !item.includes(form.name)) && 
            (!form.price || !item.includes(form.price)) &&
            (!form.discount || !item.includes(form.discount)) &&
            (!form.cost || !item.includes(form.cost)))">
              <el-option :label="column" :value="column" />
            </div>
          </el-select>

          <label><b>Discount (Optional):&nbsp;</b></label>
          <p>This is the column will discount the price column. (This will change all data to be whole numbers and accept only whole numbers. 0-100%) [1, 2, 10, etc.]</p>
          <el-select v-model="form.discount" placeholder="Select" size="large" clearable>
            <div :key="column" v-for="column in props.inventory.columns.filter(item => 
            (!form.name || !item.includes(form.name)) && 
            (!form.price || !item.includes(form.price)) &&
            (!form.quantity || !item.includes(form.quantity)) &&
            (!form.cost || !item.includes(form.cost)))">
              <el-option :label="column" :value="column" />
            </div>
          </el-select>

          <label><b>Cost (Optional):&nbsp;</b></label>
          <p>This is the column will determine the profit margin (price - cost). (This will force all data in this column to be float numbers and accept only whole numbers/float numbers [0.00])</p>
          <el-select v-model="form.cost" placeholder="Select" size="large" clearable>
            <div :key="column" v-for="column in props.inventory.columns.filter(item => 
            (!form.name || !item.includes(form.name)) && 
            (!form.price || !item.includes(form.price)) &&
            (!form.quantity || !item.includes(form.quantity)) && 
            (!form.discount || !item.includes(form.discount)))">
              <el-option :label="column" :value="column" />
            </div>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="props.inventory?.name_column !== '' && props.inventory?.price_column !== ''" @click="popup = false">Cancel</el-button>
          <el-button type="success" @click="registerColumns()" :loading="loading.registerColumns" :disabled="form.name === '' || form.price === ''">Register Columns</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
    
    <!-- Register Btn -->
    <el-button @click="openPopup()" type="success">Column Settings</el-button>
    <!-- Register Btn -->
  </div>
</template>

<script setup>
const { notify } = useNotification()
const { handleInventoryRequest } = useHandleRequests()
const { formatNameColumn, formatPriceColumn, formatQuantityColumn, formatDiscountColumn, formatCostColumn } = useFormatter()

const loading = reactive({ registerColumn: false })
const popup = ref(false)
const form = reactive({
  name: '',
  price: '',
  quantity: '',
  discount: '',
  cost: '',
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

//Prompt
function openPopup() {
  form.name = props.inventory.name_column
  form.price = props.inventory.price_column
  form.quantity = props.inventory.quantity_column
  form.discount = props.inventory.discount_column
  form.cost = props.inventory.cost_column
  popup.value = true
}

//Request
async function registerColumns() {
  const { name, price, quantity, discount, cost } = form
  let stock = props.inventory.stock

  //Must have name or price to continue
  if(name === '' || price === '') {
    notify({ title: 'Error', text: 'Name and Price columns are required for the cashier page', type: 'error'})
  }

  //Format data
  for (let key in stock) {
    //Required
    stock[key][name] = formatNameColumn(stock[key][name])
    stock[key][price] = formatPriceColumn(stock[key][price])
    //Optional
    if (quantity)
      stock[key][quantity] = formatQuantityColumn(stock[key][quantity])
    if (discount)
      stock[key][discount] = formatDiscountColumn(stock[key][discount])
    if (cost)
      stock[key][cost] = formatCostColumn(stock[key][cost])
  }

  //Make inventory request
  loading.registerColumns = true
  let inventory = await handleInventoryRequest({
    path: 'register-columns',
    data: { store_id: props.storeId, stock: stock, name_column: name, price_column: price, quantity_column: quantity, discount_column: discount, cost_column: cost },
  })

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.registerColumns = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>