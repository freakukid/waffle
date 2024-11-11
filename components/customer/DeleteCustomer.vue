<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Delete Customer">
      <p style="text-align: center; font-size: 24px;">
        Are you sure you want to delete customer: <b class="text-red-500">{{name}}</b>? <br> THIS CANNOT BE UNDONE.
      </p>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button type="danger" @click="deleteCustomer()" :loading="loading">Delete</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
//Import
const { sendNotification } = useHelpers()

//Data
const loading = ref(false)
const popup = ref(false)

//Component Emits,Props
const emits = defineEmits(['deleteCustomer'])
const props = defineProps({ id: { default: 0 }, storeId: { default: 0 }, name: { default: '' } })

//Prompt
function openPopup(active) {
  popup.value = active
}

//Request
async function deleteCustomer() {
  //Setup data
  const { id, storeId, name } = props

  //Make request to create transaction
  loading.value = true
  const response = await useFetchApi(`/api/protected/customer/delete`, {
    method: "POST",
    body: {
      id: id,
      store_id: storeId,
      name: name,
    }
  })
  loading.value = false

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    popup.value = false
    return
  }

  //show success message
  sendNotification(response.message, 'success')

  //emit value to parent component, close popup
  emits('deleteCustomer', id)
  popup.value = false
}

//Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>