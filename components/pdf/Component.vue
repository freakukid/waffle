<template>
  <div id="pdf-component" class="flex items-center justify-center flex-col fixed left-[-1000px]">
    <div v-if="store && layaway" ref="content" class="flex flex-col bg-white text-black w-[840px]" style="font-family: 'Calibri', sans-serif;">
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
          <img class="max-w-[260px] h-[76px]" :src="imageSrc" crossorigin="anonymous" />
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
              <li><b>Invoice Number:&nbsp;&nbsp;</b>{{layaway.id}}</li>
              <li><b>Invoice Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>{{layaway.date}}</li>
              <li><b>Payment Due:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>TBD</li>
            </ul>
          </div>
        </div>
        <!-- CUSTOMER -->

        <!-- TRANSACTION -->
        <el-table class="light my-4" :data="layaway.items" table-layout="auto" stripe>
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
        <div v-if="additionalNotes.length || store.invoice_notes" class="mt-4">
          <b>Notes:</b>

          <div v-for="note in additionalNotes" :key="note" class="my-3" :class="{'font-bold': note.bold}">
            <p>{{note.text}}</p>
          </div>

          <p v-for="note in store.invoice_notes" :key="note" class="my-3" :class="{'font-bold': note.bold}">
            {{note.text}}
          </p>
        </div>
        <!-- NOTES -->
      </div>
      <!-- CONTENT -->
    </div>
  </div>

  <PdfAdditionalNotes ref="additionalNotesRef" :type="type" :loading="loading" @generatePDF="generatePDF" />
</template>

<script setup>
//Import
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
const { notify } = useNotification()
const { formatPhoneNumber } = useFormatter()
const imageSrc = `${window.location.origin}/test.png`

//Data
const store = ref(null)
const layaway = ref(null)
const type = ref('view') //view, download, email
const pdfBlob = ref(null)
const loading = ref(false)
const additionalNotes = ref([])

//Reference
const content = ref(null)
const additionalNotesRef = ref(null)

function openNotesPopup(action, storeData, layawayData) {
  //Setup data
  store.value = storeData
  layaway.value = layawayData
  type.value = action
  //Open Popup
  additionalNotesRef.value.openPopup(true, action, layawayData.customer.email)
}

//Generate pdf
async function generatePDF(notes, email = '') {
  //Setup data
  loading.value = true
  await document.fonts.ready
  
  if(notes[0].text.trim() === '')
    notes = notes.slice(1)

  additionalNotes.value = notes

  //Delay before taking an img of the component
  await new Promise(resolve => setTimeout(resolve, 500))

  //Setup pdf data
  const canvas = await html2canvas(content.value, { useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF()
  const imgWidth = 211
  const pageHeight = pdf.internal.pageSize.height
  const imgHeight = (canvas.height * imgWidth) / canvas.width
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
    await sendEmailPDF(email)
  
  loading.value = false
  additionalNotesRef.value.openPopup(false)
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
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  //show success message
  notify({ title: 'Success', text: response.message, type: 'success'})

  store.value = null
  layaway.value = null
}

// Expose the methods to parent
defineExpose({
  generatePDF,
  openNotesPopup,
})
</script>

<style lang="scss">
#pdf-component {
  .el-table th.el-table__cell {
    background: #fbfbfb;
  }

  .light {
    --el-color-white: #ffffff; /* White color */
    --el-color-black: #000000; /* Black color */
    --el-color-primary: #409eff; /* Primary color */
    --el-color-primary-light-3: #79bbff; /* Lighter primary */
    --el-color-primary-light-5: #a0cfff; /* Lighter primary */
    --el-color-primary-light-7: #c6e2ff; /* Even lighter primary */
    --el-color-primary-light-8: #d9ecff; /* Very light primary */
    --el-color-primary-light-9: #ecf5ff; /* Near white primary */
    --el-color-primary-dark-2: #337ecc; /* Darker primary */
    
    --el-color-success: #67c23a; /* Success color */
    --el-color-success-light-3: #95d475; 
    --el-color-success-light-5: #b3e19d; 
    --el-color-success-light-7: #d1edc4; 
    --el-color-success-light-8: #e1f3d8; 
    --el-color-success-light-9: #f0f9eb; 
    --el-color-success-dark-2: #529b2e; 
    
    --el-color-warning: #e6a23c; /* Warning color */
    --el-color-warning-light-3: #eebe77; 
    --el-color-warning-light-5: #f3d19e; 
    --el-color-warning-light-7: #f8e3c5; 
    --el-color-warning-light-8: #faecd8; 
    --el-color-warning-light-9: #fdf6ec; 
    --el-color-warning-dark-2: #b88230; 
    
    --el-color-danger: #f56c6c; /* Danger color */
    --el-color-danger-light-3: #f89898; 
    --el-color-danger-light-5: #fab6b6; 
    --el-color-danger-light-7: #fcd3d3; 
    --el-color-danger-light-8: #fde2e2; 
    --el-color-danger-light-9: #fef0f0; 
    --el-color-danger-dark-2: #c45656; 
    
    --el-color-error: #f56c6c; /* Error color (same as danger) */
    --el-color-error-light-3: #f89898; 
    --el-color-error-light-5: #fab6b6; 
    --el-color-error-light-7: #fcd3d3; 
    --el-color-error-light-8: #fde2e2; 
    --el-color-error-light-9: #fef0f0; 
    --el-color-error-dark-2: #c45656; 
    
    --el-color-info: #909399; /* Info color */
    --el-color-info-light-3: #b1b3b8; 
    --el-color-info-light-5: #c8c9cc; 
    --el-color-info-light-7: #dedfe0; 
    --el-color-info-light-8: #e9e9eb; 
    --el-color-info-light-9: #f4f4f5; 
    --el-color-info-dark-2: #73767a; 

    /* Background Colors */
    --el-bg-color: #ffffff; /* Main background */
    --el-bg-color-page: #f2f3f5; /* Page background */
    --el-bg-color-overlay: #ffffff; /* Overlay background */

    /* Text Colors */
    --el-text-color-primary: #303133; /* Primary text */
    --el-text-color-regular: #606266; /* Regular text */
    --el-text-color-secondary: #000; /* Secondary text */
    --el-text-color-placeholder: #a8abb2; /* Placeholder text */
    --el-text-color-disabled: #c0c4cc; /* Disabled text */

    /* Border Colors */
    --el-border-color: #dcdfe6; /* Default border */
    --el-border-color-light: #e4e7ed; /* Light border */
    --el-border-color-lighter: #ebeef5; /* Lighter border */
    --el-border-color-extra-light: #f2f6fc; /* Extra light border */
    --el-border-color-dark: #d4d7de; /* Dark border */
    --el-border-color-darker: #cdd0d6; /* Darker border */

    /* Fill Colors */
    --el-fill-color: #f0f2f5; /* Fill color */
    --el-fill-color-light: #f5f7fa; /* Light fill */
    --el-fill-color-lighter: #f4f4f4; /* Lighter fill */
    --el-fill-color-extra-light: #fafcff; /* Extra light fill */
    --el-fill-color-dark: #ebedf0; /* Dark fill */
    --el-fill-color-darker: #e6e8eb; /* Darker fill */
    --el-fill-color-blank: #ffffff; /* Blank fill */
  }
}
</style>