<template>
  <!-- Popup -->
  <el-dialog v-model="popup" class="min-w-fit" :title="$t('pdf.Invoice')">
    <div class="flex items-center justify-center flex-col">
      <div v-if="store && layaway" id="pdf-component" ref="content" class="flex flex-col bg-white text-black w-[840px]" style="font-family: 'Calibri', sans-serif;">
        <!-- HEADER -->
        <header class="flex items-center bg-gray-900 h-32 text-white px-6">
          <div class="text-left leading-tight w-1/3">
            <div><b>{{store.name}}</b></div>
            <div v-if="store.address">{{store.address}}</div>
            <div v-if="store.city || store.zipcode || store.country">
              <span v-if="store.city">{{store.city}},&nbsp;</span>
              <span v-if="store.zipcode">{{store.zipcode}}</span>
              <span v-if="store.country"><span v-if="store.zipcode">,&nbsp;</span>{{store.country}}</span>
            </div>
          </div>

          <div class="w-1/3 flex items-center justify-center">
            <img class="max-w-[260px] h-[76px]" src="@/public/test.png" crossorigin="anonymous" />
          </div>

          <div class="text-right leading-tight w-1/3">
            <div v-if="store.phone || store.website || store.email"><b>Contact Information</b></div>
            <div v-if="store.phone">{{store.phone}}</div>
            <div v-if="store.website">{{store.website}}</div>
            <div v-if="store.email">{{store.email}}</div>
          </div>
        </header>
        <!-- HEADER -->

        <!-- CONTENT -->
        <div class="p-6">
          <!-- CUSTOMER -->
          <div class="flex justify-between">
            <div>
              <label class="text-gray-500 font-medium">BILL TO</label>
              <ul class="leading-5">
                <li><b>{{layaway.customer.name}}</b></li>
                <li>Account: #{{layaway.customer.id}}</li>
                <li>{{layaway.customer.email}}</li>
                <li>{{formatPhoneNumber(layaway.customer.phone)}}</li>
              </ul>

              <ul v-if="layaway.customer.address" class="leading-5 pt-2">
                <li>{{layaway.customer.address}}</li>
                <li>
                  <span v-if="layaway.customer.city">{{layaway.customer.city}},&nbsp;</span>
                  <span v-if="layaway.customer.zipcode">{{layaway.customer.zipcode}}</span>
                  <span v-if="layaway.customer.country"><span v-if="layaway.customer.zipcode">,&nbsp;</span>{{layaway.customer.country}}</span>
                </li>
              </ul>
            </div>

            <div>
              <label class="text-gray-500 font-medium">INVOICE DETAILS</label>
              <ul class="leading-5">
                <li><b>Invoice Number:&nbsp;&nbsp;</b><span v-if="layaway.id">{{layaway.id}}</span><span v-else>To be determined..</span></li>
                <li><b>Invoice Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>{{layaway.date}}</li>
                <li><b>Payment Due:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>TBD</li>
              </ul>
            </div>
          </div>
          <!-- CUSTOMER -->

          <!-- TRANSACTION -->
          <el-table class="light my-6" :data="layaway.items" table-layout="auto" border>
            <el-table-column label="Product">
              <template #default="scope">
                <div><b>{{scope.row.name}}</b></div>
                <div v-if="scope.row.discount > 0">{{`&nbsp;&nbsp;(${scope.row.qty} @ ${scope.row.price} ea) | Discount ${scope.row.discount}%`}}</div>
                <div v-else-if="scope.row.qty > 1">{{`&nbsp;&nbsp;(${scope.row.qty} @ ${scope.row.price} ea)`}}</div>
              </template>
            </el-table-column>
            <el-table-column prop="subtotal" label="Price" align="right" />
          </el-table>
          <!-- TRANSACTION -->

          <div class="flex justify-between mr-4">
            <!-- SIGNATURE -->
            <div class="text-right mt-5 text-sm">
              <div class="flex align-center gap-4 mb-9">
                <div class="w-20 font-semibold">Print Name:</div>
                <div class="w-80 border-b border-gray-900" />
              </div>

              <div class="flex align-center gap-4">
                <div class="w-20 font-semibold">Signature:</div>
                <div class="w-80 border-b border-gray-900" />
              </div>
            </div>
            <!-- SIGNATURE -->

            <!-- TOTAL -->
            <table>
              <tbody>
                <tr v-if="layaway.savings > 0">
                  <td class="w-36">DISCOUNT:</td>
                  <td class="text-right">{{layaway.savings}}</td>
                </tr>
                <tr>
                  <td>SUBTOTAL:</td>
                  <td class="text-right">{{layaway.subtotal}}</td>
                </tr>
                <tr class="border-b border-gray-300">
                  <td class="pb-1">TAX({{layaway.tax}}%):</td>
                  <td class="text-right pb-1">{{layaway.tax_total}}</td>
                </tr>
                <tr>
                  <td class="text-2xl"><b>TOTAL:</b></td>
                  <td class="text-2xl text-right">{{layaway.total}}</td>
                </tr>
              </tbody>
            </table>
            <!-- TOTAL -->
          </div>

          <!-- NOTES -->
          <div v-if="form.notes[0].text !== '' || form.notes.length > 1 || store.invoice_notes[0].text !== ''" class="mt-4">
            <b>Notes:</b>

            <p v-for="note in store.invoice_notes" :key="note" class="my-3" :class="{'font-bold': note.bold}">
              {{note.text}}
            </p>

            <div v-for="note in form.notes" :key="note" class="my-3" :class="{'font-bold': note.bold}">
              <p>{{note.text}}</p>
            </div>
          </div>
          <!-- NOTES -->
        </div>
        <!-- CONTENT -->
      </div>
    </div>

    <el-form v-if="type === 'email'" ref="formRef" :model="form" :rules="rules" @submit.prevent="generatePDF()">
      <el-form-item prop="email">
        <div class="text-base py-4 px-2">{{$t('pdf.Customer Email')}}</div>
        <el-input v-model="form.email" class="mx-4" ref="emailInput" autocomplete="off" />
      </el-form-item>
    </el-form>

    <el-form :model="form" class="my-4" label-position="top" @submit.prevent="generatePDF()">
      <div class="text-base py-4 px-2">{{$t('pdf.Additional Notes')}}</div>

      <div v-for="(note, i) in form.notes" :key="i">
        <div class="flex items-center gap-4 px-4">
          <div class="w-full" :class="{ bold: note.bold }">
            <el-form-item prop="text" :label="$t('pdf.Text')">
              <el-input v-model="note.text" ref="noteRef" />
            </el-form-item>
          </div>
          <div class="mt-3">
            <el-checkbox v-model="note.bold" :label="$t('pdf.Bold')" />
          </div>
          <div v-if="i > 0" class="mt-3">
            <el-button type="danger" circle @click="removeNote(i)">
              <Icon name="material-symbols:delete-rounded" />
            </el-button>
          </div>

          <div v-else class="mt-3">
            <el-button type="danger" circle disabled>
              <Icon name="material-symbols:delete-rounded" />
            </el-button>
          </div>

          <el-button class="mt-3" type="success" @click="addNote()">{{$t('pdf.Add')}}</el-button>
        </div>
      </div>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>

        <el-tooltip v-if="!offlineStore.getOnlineStatus() && type === 'email'" content="Feature only available online." placement="top">
          <el-button type="success" disabled>
            <span v-if="type === 'email'">{{$t(`pdf.Email Invoice`)}}</span>
            <span v-else-if="type === 'download'">{{$t(`pdf.Download Invoice`)}}</span>
            <span v-else>{{$t(`pdf.View Invoice`)}}</span>
          </el-button>
        </el-tooltip>
        <el-button v-else type="success" :loading="loading" @click="submitForm">
          <span v-if="type === 'email'">{{$t(`pdf.Email Invoice`)}}</span>
          <span v-else-if="type === 'download'">{{$t(`pdf.Download Invoice`)}}</span>
          <span v-else>{{$t(`pdf.View Invoice`)}}</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- Popup -->
</template>


<script setup>
//Import
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'
const { sendNotification } = useHelpers()
const { formatPhoneNumber } = useFormatter()
const offlineStore = useOfflineStore()

//Data
const store = ref(null)
const layaway = ref(null)
const type = ref('view') //view, download, email
const pdfBlob = ref(null)
const loading = ref(false)

//Form
const popup = ref(false)
const form = reactive({
  email: '',
  notes: [{text: '', bold: false}]
})

const rules = reactive({
  email: [{
    required: true,
    type: 'email',
    message: 'Invalid email format',
    trigger: ['blur', 'change']
  }],
})

//Reference
const content = ref(null)
const formRef = ref(null)
const emailInput = ref()
const noteRef = ref()

//Prompt
async function openPopup(action, storeData, layawayData) {
  //Setup data
  store.value = storeData
  layaway.value = layawayData
  type.value = action
  form.email = layawayData.customer.email
  //Open Popup
  popup.value = true

  await new Promise(resolve => setTimeout(resolve, 200))

  if(type.value === 'email')
    emailInput.value.focus()
  else
    noteRef.value[0]?.focus()
}

//Generate pdf
async function generatePDF() {
  //Setup data
  loading.value = true
  await document.fonts.ready

  //Setup pdf data
  const contentElement = content.value
  const imgData = await toPng(contentElement, { bgcolor: '#FFFFFF' })
  const pdf = new jsPDF()
  const imgWidth = 211 // A4 width in mm
  const pageHeight = pdf.internal.pageSize.height
  const imgHeight = (contentElement.offsetHeight * imgWidth) / contentElement.offsetWidth
  let heightLeft = imgHeight
  let position = 0

  // Add image to the PDF
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  // Check if we need to add another page
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  // Create a Blob from the PDF output
  pdfBlob.value = pdf.output('blob')

  //View pdf only
  if(type.value === 'view')
    viewPDF()
  else if(type.value === 'download')
    downloadPDF()
  else if(type.value === 'email')
    await sendEmailPDF(form.email)
  
  loading.value = false
  popup.value = false

  form.notes = [{text: '', bold: false}]
  form.email = ''
}

//Views pdf
function viewPDF() {
  // Create a URL for the Blob and open it in a new tab
  const url = URL.createObjectURL(pdfBlob.value)
  window.open(url, '_blank')

  // Optional: Revoke the object URL after a timeout to avoid memory leaks
  setTimeout(() => URL.revokeObjectURL(url), 100)

  store.value = null
  layaway.value = null
}

//Download pdf
function downloadPDF() {
  // Create a link element
  const link = document.createElement('a')
  const url = URL.createObjectURL(pdfBlob.value)

  link.href = url
  link.download = `Invoice-${layaway.value.id}.pdf` // Specify the filename for download

  // Append the link to the body (not displayed)
  document.body.appendChild(link)
  
  // Programmatically trigger a click event on the link to start the download
  link.click()

  // Remove the link from the document
  document.body.removeChild(link)
  
  // Optional: Revoke the object URL after a timeout to avoid memory leaks
  setTimeout(() => URL.revokeObjectURL(url), 100)

  store.value = null
  layaway.value = null
}

//Send email
async function sendEmailPDF(email) {
  // Create a FormData object
  const formData = new FormData()
  
  // Append the Blob to the FormData
  formData.append('pdf', pdfBlob.value, `Invoice-${layaway.value.id}.pdf`)
  formData.append('store_id', store.value.id)
  formData.append('store_name', store.value.name)
  formData.append('invoice_id', layaway.value.id)
  formData.append('email', email)

  //Send request
  loading.value = true
  const response = await useFetchApi(`/api/protected/layaway/send-pdf-email`, {
    method: "POST",
    body: formData
  })
  loading.value = false

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //show success message
  sendNotification(response.message, 'success')

  store.value = null
  layaway.value = null
}

function addNote() {
  form.notes.push({text: '', bold: false})
}

function removeNote(i) {
  form.notes.splice(i, 1)
}

function validateForm() {
  formRef.value.validate((valid) => {
    if (valid)
      generatePDF()
  })
}

function submitForm() {
  if(type.value === 'email')
    validateForm()
  else
    generatePDF()
}

// Expose the methods to parent
defineExpose({
  openPopup,
})
</script>

<style lang="scss">
#pdf-component {
  .el-table__body {
    thead th {
      color: #fff;
      background-color: #333;
    }
    .el-table__row {
      background-color: #eee !important;
      color: #000;
      cursor: default;
      &:hover {
        color: #fff;
      }
    }
  }
}
</style>