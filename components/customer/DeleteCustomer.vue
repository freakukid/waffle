<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t('label.Delete Customer')">
      <p style="text-align: center; font-size: 24px;">
        {{$t(`text.Do you wish to permanently delete the customer`, {name: name})}} <br> {{$t(`text.This cannot be undone!`)}}
      </p>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-button type="danger" @click="deleteCustomer()" :loading="loading">{{$t(`label.delete`)}}</el-button>
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