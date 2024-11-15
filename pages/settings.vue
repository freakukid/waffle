<template>
  <div v-if="!loading.startedLoading" id="settings-page" class="flex">
    <el-menu id="settings-sidebar">
      <h1 class="text-base pb-4">Settings</h1>
      <label class="block text-xs opacity-60 mb-1">General</label>
      <el-menu-item class="sidebar-item" :class="{active: tab === 'account'}" index="1" @click="tab = 'account'">
        <Icon name="mingcute:user-setting-fill" /> Account
      </el-menu-item>
      <el-menu-item class="sidebar-item" :class="{active: tab === 'preference'}" index="2" @click="tab = 'preference'">
        <Icon name="oui:controls-horizontal" /> Preference
      </el-menu-item>

      <div v-if="storeId">
        <label class="block text-xs opacity-60 mb-1">Inventory</label>
        <el-menu-item class="sidebar-item" :class="{active: tab === 'columns'}" index="3" @click="tab = 'columns'">
          <Icon name="fluent:database-plug-connected-20-filled" /> Columns
        </el-menu-item>
      </div>

      <label class="block text-xs opacity-60 mb-1">Cashier</label>
      <el-menu-item class="sidebar-item" :class="{active: tab === 'receipt'}" index="4" @click="tab = 'receipt'">
        <Icon name="tabler:receipt-filled" /> Receipt
      </el-menu-item>
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
              <label class="block text-base font-bold mb-2">Language</label>
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

      <div v-if="tab === 'receipt'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">Cashier</h1>

          <div class="flex flex-col gap-3 px-6 py-4">
            <div>
              <label class="block text-base font-bold mb-2">Tax</label>
              <el-input-number v-model="cashierForm.tax" :precision="2" :step="0.1" :max="100" :disabled="!isBossAccount">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-input-number>
            </div>
          </div>

          <h1 class="text-xl text-white mt-4">Reciept Printer</h1>

          <div class="flex flex-col gap-3 px-6 py-4">
            <div>
              <label class="block text-base font-bold mb-2">Epson Ip Address</label>
              <el-input v-model="cashierForm.ip" placeholder="192.168.1.xxx" />
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span></span>
                <span>(Example: 192.168.1.xxx)</span>
              </div>
            </div>
          </div>

          <h1 class="flex items-center justify-between text-xl text-white my-4">
            <span>Reciept</span>
            <div>
              <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                <el-button class="!block ml-auto" type="success" plain disabled>Print Sample</el-button>
              </el-tooltip>
              <el-button v-else class="!block ml-auto" type="success" :loading="loading.printReceipt" plain @click="printReceipt">Print Sample</el-button>
            </div>
          </h1>

          <div class="flex items-center flex-col py-6">
            <div id="receipt">
              <img src="@/public/test.png" />

              <br/>

              <div v-for="header in cashierForm.header" :key="header" class="line" 
              :class="{'align-left': header.align === 'left', 'align-center': header.align === 'center', 'align-right': header.align === 'right',
                      'font-1': header.size === 1, 'font-2': header.size === 2, 'font-3': header.size === 3}">{{header.text}}</div>
              
              <br/>

              <div v-for="item in items" :key="item" >
                <div class="table-line">
                  <div class="product-name">{{item.name}}</div>
                  <div class="price">{{item.total}}</div>
                </div>

                <div v-if="item.discount > 0" class="line">{{`&nbsp;&nbsp;(${item.qty} @ ${item.price} ea) | Discount ${item.discount}%`}}</div>
                <div v-else-if="item.qty > 1" class="line">{{`&nbsp;&nbsp;(${item.qty} @ ${item.price} ea)`}}</div>
              </div>

              <br/>

              <div class="table-line">
                <div class="output-name">SAVINGS:</div>
                <div class="price">25.00</div>
              </div>
              <div class="table-line">
                <div class="output-name">SUBTOTAL:</div>
                <div class="price">475.00</div>
              </div>
              <div class="table-line">
                <div class="output-name">TAX(10.00%):</div>
                <div class="price">4.75</div>
              </div>
              <div class="table-line bold">
                <div class="output-name">TOTAL:</div>
                <div class="price">479.75</div>
              </div>
              <br/>
              <div class="table-line bold">
                <div class="output-name">MASTERCARD:</div>
                <div class="price">479.75</div>
              </div>
              <br/>

              <div v-for="footer in cashierForm.footer" :key="footer" class="line" 
              :class="{'align-left': footer.align === 'left', 'align-center': footer.align === 'center', 'align-right': footer.align === 'right',
                      'font-1': footer.size === 1, 'font-2': footer.size === 2, 'font-3': footer.size === 3}">{{footer.text}}</div>
            </div>
          </div>

          <div id="receipt-wrapper">
            <div class="w-full">
              <label class="flex items-center justify-between text-base font-bold mb-2">
                <span>Receipt Header</span>
                <el-button type="success" plain @click="addHeader()">Add Header</el-button>
              </label>

              <div v-for="(header, h) in cashierForm.header" :key="header">
                <div class="input">
                  <div>
                    <label>Font Size</label>
                    <el-select v-model="header.size" placeholder="Select">
                      <el-option v-for="i in [1, 2, 3]" :key="i" :label="i" :value="i" />
                    </el-select>
                  </div>

                  <div>
                    <label>Text Alignment</label>
                    <el-select v-model="header.align" placeholder="Select">
                      <el-option v-for="i in ['left', 'center', 'right']" :key="i" :label="i.charAt(0).toUpperCase() + i.substring(1).toLowerCase()" :value="i" />
                    </el-select>
                  </div>

                  <div class="flex-auto">
                    <label>Text</label>
                    <el-input v-model="header.text">
                      <template v-if="h > 0" #append>
                        <el-button @click="removeItem(cashierForm.header, h)">
                          <Icon class="text-base text-red-500" name="material-symbols:delete-rounded" />
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>
            </div>

            <div class="w-full">
              <label class="flex items-center justify-between text-base font-bold mb-2">
                <span>Receipt Footer</span>
                <el-button type="success" plain @click="addFooter()">Add Footer</el-button>
              </label>

              <div v-for="(footer, f) in cashierForm.footer" :key="f">
                <div class="input">
                  <div>
                    <label>Font Size</label>
                    <el-select v-model="footer.size" placeholder="Select">
                      <el-option v-for="i in [1, 2, 3]" :key="i" :label="i" :value="i" />
                    </el-select>
                  </div>

                  <div>
                    <label>Text Alignment</label>
                    <el-select v-model="footer.align" placeholder="Select">
                      <el-option v-for="i in ['left', 'center', 'right']" :key="i" :label="i.charAt(0).toUpperCase() + i.substring(1).toLowerCase()" :value="i" />
                    </el-select>
                  </div>

                  <div class="flex-auto">
                    <label>Text</label>
                    <el-input v-model="footer.text">
                      <template v-if="f > 0" #append>
                        <el-button @click="removeItem(cashierForm.footer, f)">
                          <Icon class="text-base text-red-500" name="material-symbols:delete-rounded" />
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="px-6 py-3">
            <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
              <el-button class="!block ml-auto" type="success" plain disabled>Save</el-button>
            </el-tooltip>
            <el-button v-else class="!block ml-auto" type="success" :loading="loading.saveCashier" plain @click="saveCashierSettings">Save</el-button>
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
const { isBoss } = useChecks()
const { formatNameColumn, formatPriceColumn, formatQuantityColumn, formatDiscountColumn, formatCostColumn } = useFormatter()
const hash = computed(() => { return window.location.hash.replace('#', '') || '' })

//Store
const pinia = useStore()
const offlineStore = useOfflineStore()
const isBossAccount = computed(isBoss)
const tabOptions = ['account', 'preference', 'columns', 'cashier']

const loading = reactive({startedLoading: true, linkColumns: false, printReceipt: false, saveCashier: false})
const tab = ref('account')
const user = ref(getAuthUser())
const form = reactive({
  username: user.value.username,
  name: user.value.name,
  password: '',
  email: user.value.email,
  language: user.value.language,
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

const cashierForm = reactive({
  tax: 0,
  ip: user.value.ip,
  header: [{text: '', align: 'left', size: 1}],
  footer: [{text: '', align: 'left', size: 1}],
  invoice_notes: [{text: '', bold: false}],
})
const items = [{name: 'Product Name', qty: 1, price: '100.00', discount: 0, total: '100.00'}, {name: 'Product Name', qty: 3, price: '50.00', discount: 0, total: '150.00'}, {name: 'Product Name', qty: 10, price: '25.00', discount: 10, total: '225.00'}]

//Mount
onBeforeMount(async () => {
  if(tabOptions.includes(hash.value)) {
    tab.value = hash.value
    const baseUrl = window.location.href.split('#')[0]
    window.history.replaceState(window.history.state || {}, '', baseUrl)
  }

  await fetchStore()
  loading.startedLoading = false
  // console.log(JSON.stringify(user.value))
})

async function saveUserSettings() {
  //Make request
  const response = await useFetchApi(`/api/protected/settings/edit-user-settings`, {
    method: "POST",
    body: { language: form.language }
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

    const { tax, inventory, header, footer, invoice_notes } = store.value
    const { name_column, price_column, quantity_column, discount_column, cost_column } = inventory

    //Columns
    columnForm.name = name_column
    columnForm.price = price_column
    columnForm.quantity = quantity_column
    columnForm.discount = discount_column
    columnForm.cost = cost_column

    //Cashier
    cashierForm.tax = tax
    if(header)
      cashierForm.header = header
    if(footer)
      cashierForm.footer = footer
    if(invoice_notes)
      cashierForm.invoice_notes = invoice_notes
  }

  //Test data
  console.log(JSON.stringify(store.value))
}

// COLUMNS //
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
// COLUMNS //

// RECEIPT //
function removeItem(array, i) {
  array.splice(i, 1)
}

function addHeader() {
  cashierForm.header.push({text: '', align: 'left', size: 1})
}

function addFooter() {
  cashierForm.footer.push({text: '', align: 'left', size: 1})
}

//Print Test Receipt
async function printReceipt() {
  //Save cashier settings
  loading.printReceipt = true
  await saveCashierSettings(false)

  //Print test receipt
  const response = await useFetchApi(`/api/protected/transaction/print`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      items: items,
      tax: '10.00',
      subtotal: '475.00',
      tax_total: '4.75',
      total: '479.75',
      savings: '25.00',
      payment: 'card',
      card: 'mastercard'
    }
  })
  loading.printReceipt = false

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Display Success
  sendNotification(response.message, 'success')
}
// RECEIPT //

//Saves cashier settings
async function saveCashierSettings(notifyUser = true) {
  const { tax, ip, header, footer, invoice_notes } = cashierForm
  loading.saveCashier = true
  //Save new ip address
  if(user.value.ip !== ip) {
    //Make request
    await useFetchApi(`/api/protected/settings/edit-user-settings`, {
      method: "POST",
      body: { ip: ip }
    })

    //Fetch updated auth data
    await fetch()
  }

  //Check if tax is withing 0 to 100%
  if(tax < 0 || tax > 100) {
    sendFrontendNotification('The tax percentage must be between 0% and 100%', 'error')
    return
  }

  //Save settings before printing receipt
  const response = await useFetchApi(`/api/protected/settings/edit-cashier-settings`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      tax: tax,
      header: header,
      footer: footer,
      invoice_notes: invoice_notes,
    }
  })
  loading.saveCashier = false

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Display Success
  if(notifyUser)
    sendNotification(response.message, 'success')
}


</script>

<style lang="scss">
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

#settings-page {
  .tab {
    padding: 0 16px 0 16px;
    max-width: 600px;
    width: 100%;
  }
  //el-input-number
  .el-input__suffix-inner > :first-child {
    margin-left: 0;
  }

  .input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 8px 4px;
    label {
      display: block;
      padding-bottom: 8px;
    }
  }

  #receipt-wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 10px;
  }

  #receipt {
    width: 360px;
    height: fit-content;
    padding-bottom: 40px;
    background: white;
    font-family: 'Lucida Console';
    color: #000;
    img {
      display: block;
      margin: 20px auto 0 auto;
      max-width: 66%;
    }

    .line {
      width: 308px;
      font-size: 12px;
      margin: 0 auto;
    }

    .table-line {
      display: flex;
      justify-content: space-between;
      width: 308px;
      margin: 0 auto;
      font-size: 12px;
      .product-name {
        width: 200px;
        word-break: break-all;
      }
      .price {
        text-align: right;
        width: 90px;
        word-break: break-all;
      }
      .output-name {
        width: 175px;
        text-align: right;
      }
    }

    .bold {
      font-weight: bold;
    }

    .font-1 {
      width: 290px;
      font-size: 10px;
    }

    .font-2 {
      font-size: 12px;
    }

    .font-3 {
      font-size: 18px;
    }

    .align-left {
      text-align: left;
    }

    .align-center {
      text-align: center;
    }

    .align-right {
      text-align: right;
    }
  }
}

</style>