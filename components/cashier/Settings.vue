<template>
  <div id="settings-wrapper">
    <!-- Popup -->
    <el-dialog v-model="popup" title="Settings">
      <el-form v-if="!loading.startedLoading" :model="form" label-position="top" @submit.prevent="changeSettings()">
        <el-form-item label="Reciept IP (ex. 192.168.1.xxx)" prop="receipt_ip">
          <el-input v-model="form.receipt_ip" />
        </el-form-item>

        <el-form-item v-if="isBoss" label="Tax" prop="tax">
          <el-input-number v-model="form.tax" :precision="2" :step="0.1" :max="100" />%
        </el-form-item>

        <!-- HEADER -->
        <div class="text-center mb-4"><b>RECIEPT SETTINGS</b></div>

        <div v-if="isBoss" id="receipt-wrapper">
          <div>
            <label>Receipt Header</label>

            <div v-for="(header, h) in form.header" :key="header">
              <div class="input">
                <div>
                  <label>Font Size</label>
                  <el-select v-model="header.size" placeholder="Select" size="" style="width: 50px;">
                    <el-option v-for="i in [1, 2, 3]" :key="i" :label="i" :value="i" />
                  </el-select>
                </div>

                <div>
                  <label>Font Alignment</label>
                  <el-select v-model="header.align" placeholder="Select" size="" style="width: 100px;">
                    <el-option v-for="i in ['left', 'center', 'right']" :key="i" :label="i.charAt(0).toUpperCase() + i.substring(1).toLowerCase()" :value="i" />
                  </el-select>
                </div>

                <el-form-item label="Text" prop="text">
                  <el-input v-model="header.text" />
                </el-form-item> 

                <div v-if="h > 0">
                  <el-button type="danger" circle @click="removeItem(form.header, h)">
                    <Icon name="material-symbols:delete-rounded" />
                  </el-button>
                </div>
              </div>
            </div>

            <div style="text-align: center;">
              <el-button type="success" @click="addHeader()">Add</el-button>
            </div>

            <!-- FOOTER -->
            <div style="margin-top: 16px;"><label>Receipt Footer</label></div>

            <div v-for="(footer, f) in form.footer" :key="f">
              <div class="input">
                <div>
                  <label>Font Size</label>
                  <el-select v-model="footer.size" placeholder="Select" size="" style="width: 50px;">
                    <el-option v-for="i in [1, 2, 3]" :key="i" :label="i" :value="i" />
                  </el-select>
                </div>

                <div>
                  <label>Font Alignment</label>
                  <el-select v-model="footer.align" placeholder="Select" size="" style="width: 100px;">
                    <el-option v-for="i in ['left', 'center', 'right']" :key="i" :label="i.charAt(0).toUpperCase() + i.substring(1).toLowerCase()" :value="i" />
                  </el-select>
                </div>

                <el-form-item label="Text" prop="text">
                  <el-input v-model="footer.text" />
                </el-form-item>

                <div v-if="f > 0">
                  <el-button type="danger" circle @click="removeItem(form.footer, f)">
                    <Icon name="material-symbols:delete-rounded" />
                  </el-button>
                </div>
              </div>
            </div>
            <div style="text-align: center;">
              <el-button type="success" @click="addFooter()">Add</el-button>
            </div>
          </div>

          <div id="receipt">
            <img src="@/public/test.png" />

            <br/>

            <div v-for="header in form.header" :key="header" class="line" 
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
              <div class="price">479.79</div>
            </div>
            <br/>
            <div class="table-line bold">
              <div class="output-name">MASTERCARD:</div>
              <div class="price">0.00</div>
            </div>
            <br/>

            <div v-for="footer in form.footer" :key="footer" class="line" 
            :class="{'align-left': footer.align === 'left', 'align-center': footer.align === 'center', 'align-right': footer.align === 'right',
                     'font-1': footer.size === 1, 'font-2': footer.size === 2, 'font-3': footer.size === 3}">{{footer.text}}</div>
          </div>
        </div>

        <!-- PRINT TEST RECEIPT -->
        <div style="text-align: center; margin: 32px 0;">
          <el-button type="success" @click="printReceipt()">Print Sample</el-button>
        </div>

        <!-- INVOICE -->
        <div v-if="isBoss">
          <div class="text-center mb-4"><b>INVOICE NOTES</b></div>
          <div v-for="(note, i) in form.invoice_notes" :key="i">
            <div class="flex items-center justify-center gap-4">
              <div>
                <el-checkbox v-model="note.bold" label="Bold" />
              </div>
              <div class="w-80" :class="{ bold: note.bold }">
                <el-form-item label="Text" prop="text">
                  <el-input v-model="note.text" />
                </el-form-item>
              </div>
              <div v-if="i > 0">
                <el-button type="danger" circle @click="removeItem(form.invoice_notes, i)">
                  <Icon name="material-symbols:delete-rounded" />
                </el-button>
              </div>
              <div v-else class="w-6" />
            </div>
          </div>
        </div>

        <div style="text-align: center;">
          <el-button type="success" @click="addNote()">Add</el-button>
        </div>
        <!-- INVOICE -->
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>

          <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
            <el-button type="success" disabled>Save</el-button>
          </el-tooltip>
          <el-button v-else type="success" @click="changeSettings()" :loading="loading.settings" native-type="submit">Save</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
//Import
const { sendNotification, sendFrontendNotification } = useHelpers()
const offlineStore = useOfflineStore()
//Data
const loading = reactive({ startedLoading: true, settings: false })
const popup = ref(false)
const settings = ref(null)
//Form
const form = reactive({
  tax: 0,
  receipt_ip: '',
  header: [{text: '', align: 'left', size: 1}],
  footer: [{text: '', align: 'left', size: 1}],
  invoice_notes: [{text: '', bold: false}],
})
const items = ref([{name: 'Product Name', qty: 1, price: '100.00', discount: 0, total: '100.00'}, {name: 'Product Name', qty: 3, price: '50.00', discount: 0, total: '150.00'}, {name: 'Product Name', qty: 10, price: '25.00', discount: 10, total: '225.00'}])

//Component Emits,Props
const emits = defineEmits(['setStore'])
const props = defineProps({ store: { required: true }, isBoss: { required: true } })

//Mount
onBeforeMount(async () => {
  await getUserSettings()
  loading.startedLoading = false
})
//Mount

//Prompt
function openPopup() {
  form.tax = props.store.tax

  if(props.store.header)
    form.header = props.store.header

  if(props.store.footer)
    form.footer = props.store.footer

  if(props.store.invoice_notes)
    form.invoice_notes = props.store.invoice_notes

  popup.value = true
}

function addNote() {
  form.invoice_notes.push({text: '', bold: false})
}

function removeItem(array, i) {
  array.splice(i, 1)
}

function addHeader() {
  form.header.push({text: '', align: 'left', size: 1})
}

function addFooter() {
  form.footer.push({text: '', align: 'left', size: 1})
}

//Print Test Receipt
async function printReceipt() {
  //Check if tax is withing 0 to 100%
  if(form.tax < 0 || form.tax > 100) {
    sendFrontendNotification('The tax percentage must be between 0% and 100%', 'error')
    return
  }

  //Save settings before printing receipt
  await useFetchApi(`/api/protected/settings/edit`, {
    method: "POST",
    body: {
      store_id: props.store.id,
      tax: form.tax,
      receipt_ip: form.receipt_ip,
      header: form.header,
      footer: form.footer,
      invoice_notes: form.invoice_notes,
    }
  })

  //Then print test receipt
  const response = await useFetchApi(`/api/protected/transaction/print`, {
    method: "POST",
    body: {
      store_id: props.store.id,
      items: items.value,
      tax: '10.00',
      subtotal: '475.00',
      tax_total: '4.75',
      total: '479.75',
      savings: '25.00',
      payment: 'card',
      card: 'mastercard'
    }
  })

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Display Success
  sendNotification(response.message, 'success')
}

//Request to get settings
async function getUserSettings() {
  settings.value = await useFetchApi(`/api/protected/settings/user-settings`)
  form.receipt_ip = settings.value.settings.ip
}

//Change settings
async function changeSettings() {
  //Check if tax is withing 0 to 100%
  if(form.tax < 0 || form.tax > 100) {
    sendFrontendNotification('The tax percentage must be between 0% and 100%', 'error')
    return
  }

  //Request
  loading.settings = true
  const response = await useFetchApi(`/api/protected/settings/edit`, {
    method: "POST",
    body: {
      store_id: props.store.id,
      tax: form.tax,
      receipt_ip: form.receipt_ip,
      header: form.header,
      footer: form.footer,
      invoice_notes: form.invoice_notes,
    }
  })
  loading.settings = false

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Emit to parent component
  if(response.store)
    emits('setStore', response.store)

  //Close popup, Show success message
  popup.value = false
  sendNotification(response.message, 'success')
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>

<style lang="scss">
#settings-wrapper {
  .input {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    div {
      margin-bottom: 2px;
    }
    label {
      display: block;
      padding-bottom: 12px;
    }
  }

  .bold {
    input {
      font-weight: bold !important;
    }
  }

  #receipt-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 10px;
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
}
</style>