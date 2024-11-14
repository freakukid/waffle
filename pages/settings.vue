<template>
  <div class="flex">
    <el-menu id="settings-sidebar">
      <h1 class="text-base pb-4">Settings</h1>
      <label class="block text-xs opacity-60 mb-1">General</label>
      <el-menu-item class="sidebar-item" :class="{active: tab === 'account'}" index="1" @click="tab = 'account'">
        <Icon name="mingcute:user-setting-fill" /> Account
      </el-menu-item>
      <el-menu-item class="sidebar-item" :class="{active: tab === 'preference'}" index="1" @click="tab = 'preference'">
        <Icon name="oui:controls-horizontal" /> Preference
      </el-menu-item>

      <div v-if="storeId">
        <label class="block text-xs opacity-60 mb-1">Inventory</label>
        <el-menu-item class="sidebar-item" :class="{active: tab === 'columns'}" index="1" @click="tab = 'columns'">
          <Icon name="fluent:database-plug-connected-20-filled" /> Columns
        </el-menu-item>
      </div>
    </el-menu>
    <div class="flex justify-center w-full">
      <div v-if="tab === 'account'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">Account</h1>
        </div>

        <el-form class="px-6" :model="form" disabled label-position="top">
          <el-form-item label="Username" prop="username"
            :rules="[{ min: 3, max: 15, message: 'Username must be between 3 and 15 characters', trigger: 'blur' },
            { validator: validateUsername, trigger: 'change' }]"
          >
            <el-input v-model="form.username" :value="form.username" autocomplete="off" />
          </el-form-item>

          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" :value="form.name" autocomplete="off" />
          </el-form-item>

          <el-form-item label="Email" prop="email" :rules="[{ validator: validateOptionalEmail, trigger: 'blur' }]">
            <el-input v-model="form.email" :value="form.email" autocomplete="off" />
          </el-form-item>

          <el-form-item label="New Password" prop="password" :rules="[{ min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }]">
            <el-input v-model="form.password" :value="form.password"  type="password" placeholder="******" autocomplete="off" />
          </el-form-item>
        </el-form>

        <div class="px-6 py-2">
          <el-button class="!block ml-auto" disabled native-type="submit">Save</el-button>
        </div>
      </div>

      <div v-if="tab === 'preference'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">Preference</h1>

          <div class="px-6 py-4">
            <div>
              <label class="block text-sm opacity-80 mb-2">Language</label>
              <el-select v-model="form.language" placeholder="Language" @change="saveUserSettings">
                <el-option label="English" value="en" />
                <el-option label="Spanish" value="es" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tab === 'columns'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">Columns</h1>

          <div class="flex flex-col gap-3 px-6 py-4">
            <div>
              <label class="block text-base font-bold mb-1">Name</label>
              <p class="text-sm mb-2 opacity-85">Which column contains the name of the product?</p>
              <el-select v-model="columnForm.name" placeholder="Select" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.price || !item.includes(columnForm.price)) && 
                  (!columnForm.quantity || !item.includes(columnForm.quantity)) &&
                  (!columnForm.discount || !item.includes(columnForm.discount)) &&
                  (!columnForm.cost || !item.includes(columnForm.cost)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>(Type: String)</span>
              </div>
            </div>

            <div>
              <label class="block text-base font-bold mb-1">Price</label>
              <p class="text-sm mb-2 opacity-85">Which column lists the product price?</p>
              <el-select v-model="columnForm.price" placeholder="Select" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.name || !item.includes(columnForm.name)) && 
                  (!columnForm.quantity || !item.includes(columnForm.quantity)) &&
                  (!columnForm.discount || !item.includes(columnForm.discount)) &&
                  (!columnForm.cost || !item.includes(columnForm.cost)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>(Type: Float)</span>
                <span>(Default value: 0.00)</span>
              </div>
            </div>

            <div>
              <label class="block text-base font-bold mb-1">Quantity</label>
              <p class="text-sm mb-2 opacity-85">Which column lists the product quantity?</p>
              <el-select v-model="columnForm.quantity" placeholder="Select" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.name || !item.includes(columnForm.name)) && 
                  (!columnForm.price || !item.includes(columnForm.price)) &&
                  (!columnForm.discount || !item.includes(columnForm.discount)) &&
                  (!columnForm.cost || !item.includes(columnForm.cost)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>(Type: Whole Number)</span>
                <span>(Default value: 0)</span>
              </div>
            </div>

            <div>
              <label class="block text-base font-bold mb-1">Discount</label>
              <p class="text-sm mb-2 opacity-85">Which column lists the product discount?</p>
              <el-select v-model="columnForm.discount" placeholder="Select" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.name || !item.includes(columnForm.name)) && 
                  (!columnForm.price || !item.includes(columnForm.price)) &&
                  (!columnForm.quantity || !item.includes(columnForm.quantity)) &&
                  (!columnForm.cost || !item.includes(columnForm.cost)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>(Type: Whole Number)</span>
                <span>(Default value: 0%)</span>
              </div>
            </div>

            <div>
              <label class="block text-base font-bold mb-1">Cost</label>
              <p class="text-sm mb-2 opacity-85">Which column lists the product cost?</p>
              <el-select v-model="columnForm.cost" placeholder="Select" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.name || !item.includes(columnForm.name)) && 
                  (!columnForm.price || !item.includes(columnForm.price)) &&
                  (!columnForm.quantity || !item.includes(columnForm.quantity)) && 
                  (!columnForm.discount || !item.includes(columnForm.discount)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>(Type: Float)</span>
                <span>(Default value: 0.00)</span>
              </div>
            </div>
          </div>

          <div class="px-6 py-3">
            <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
              <el-button class="!block ml-auto" type="success" plain disabled>Save</el-button>
            </el-tooltip>
            <el-button v-else class="!block ml-auto" type="success" :loading="loading.linkColumns" plain @click="linkColumns">Save</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
definePageMeta({
  middleware: 'unauth'
})

const { fetch } = useUserSession()
const { $switchLocale } = useNuxtApp()
const { handleGetRequest, handleInventoryRequest } = useHandleRequests()
const { getAuthUser } = useAuth()
const { sendNotification, sendFrontendNotification } = useHelpers()
const { validateUsername, validateOptionalEmail } = useValidator()
const { formatNameColumn, formatPriceColumn, formatQuantityColumn, formatDiscountColumn, formatCostColumn } = useFormatter()
const hash = computed(() => { return window.location.hash.replace('#', '') || '' })

//Store
const pinia = useStore()
const offlineStore = useOfflineStore()

const tabOptions = ['account', 'preference', 'columns']

const loading = reactive({linkColumns: false})
const tab = ref('account')
const user = ref(getAuthUser())
const form = reactive({
  username: user.value.username,
  name: user.value.name,
  password: '',
  email: user.value.email,
  language: user.value.language,
  ip: user.value.ip
})

const storeId = computed(pinia.getStore)
const store = ref(null)
const columnForm = reactive({
  name: '',
  price: '',
  quantity: '',
  discount: '',
  cost: '',
})

//Mount
onBeforeMount(async () => {
  if(tabOptions.includes(hash.value)) {
    tab.value = hash.value
    const baseUrl = window.location.href.split('#')[0]
    window.history.replaceState(window.history.state || {}, '', baseUrl)
  }

  await fetchStore()
})

async function saveUserSettings() {
  //Make request
  const response = await useFetchApi(`/api/protected/settings/edit-user-settings`, {
    method: "POST",
    body: { language: form.language, ip: form.ip }
  })
  //Fetch updated auth data
  await fetch()

  //Switch language
  $switchLocale(form.language)

  sendNotification(response.message, 'success')
}

//Gets the user store
async function fetchStore() {
  if(storeId) {
    store.value = await handleGetRequest(`/api/protected/store/${storeId.value}`)

    const {name_column, price_column, quantity_column, discount_column, cost_column} = store.value.inventory
    columnForm.name = name_column
    columnForm.price = price_column
    columnForm.quantity = quantity_column
    columnForm.discount = discount_column
    columnForm.cost = cost_column
  }
  
  //Test data
  // console.log(JSON.stringify(store.value))
}

async function linkColumns() {
  const { name, price, quantity, discount, cost } = columnForm
  let stock = store.value.inventory.stock

  if(!name || !price) {
    sendFrontendNotification('The Name and Price columns are mandatory for saving', 'warning')
    return
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
  loading.linkColumns = true
  const inventory = await handleInventoryRequest({
    path: 'register-columns',
    data: { store_id: storeId.value, stock: stock, name_column: name, price_column: price, quantity_column: quantity, discount_column: discount, cost_column: cost },
  })

  if(inventory)
    store.value.inventory = inventory

  //Loading complete
  loading.linkColumns = false
}
</script>

<style lang="scss" scoped>
#settings-sidebar {
  height: 100vh;
  width: 220px;
  padding: 16px 8px;
  border-color: #2b2b2b;
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #bfbfbf;
    padding: 16px;
    font-size: 16px;
    height: 40px;
    border-radius: 8px;
    margin: 4px 0;
    user-select: none;
    &.is-disabled {
      color: #ffffff;
    }
    &:hover, &.active {
      background: #ffffff14;
      color: #ffffff;
    }
  }
}

.tab {
  padding: 0 16px 0 16px;
  max-width: 600px;
  width: 100%;
}
</style>