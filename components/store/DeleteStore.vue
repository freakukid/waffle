<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.delete store`)" width="300">
      <p class="text-center">{{$t(`text.the following will be deleted:`)}}</p>
      <ul class="list-disc w-44 my-4 mx-auto">
        <li>{{$t(`text.store`)}}: {{name}}</li>
        <li>{{$t(`text.worker accounts`)}}</li>
        <li>{{$t(`text.customers`)}}</li>
        <li>{{$t(`text.inventory`)}}</li>
        <li>{{$t(`text.inventory logs`)}}</li>
        <li>{{$t(`text.transaction history`)}}</li>
        <li>{{$t(`text.layaway transactions`)}}</li>
      </ul>

      <p class="text-center text-red-400"><b>{{$t(`text.this cannot be undone!`)}}</b></p>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-button type="danger" @click="openSecondPopup()">{{$t(`label.delete`)}}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog id="error-popup" v-model="secondPopup" :title="$t(`title.delete store`)" width="500">
      <div class="text-white">
        <p class="text-center text-xl"><b>{{$t(`text.Are you sure you want to delete the following?`)}}</b></p>
        <ul class="list-disc w-48 my-6 mx-auto text-lg">
          <li>{{$t(`text.store`)}}: {{name}}</li>
          <li>{{$t(`text.worker accounts`)}}</li>
          <li>{{$t(`text.customers`)}}</li>
          <li>{{$t(`text.inventory`)}}</li>
          <li>{{$t(`text.inventory logs`)}}</li>
          <li>{{$t(`text.transaction history`)}}</li>
          <li>{{$t(`text.layaway transactions`)}}</li>
        </ul>

        <p class="text-center text-3xl mb-2"><b>{{$t(`text.this cannot be undone!`)}}</b></p>
      </div>

      <template #footer>
        <div class="dialog-footer text-white">
          <el-button @click="secondPopup = false" type="danger">{{$t(`label.cancel`)}}</el-button>

          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button disabled type="danger">{{$t(`label.delete`)}}</el-button>
          </el-tooltip>
          <el-button v-else :loading="loading" type="danger" @click="deleteStore()">{{$t(`label.delete`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
const { sendNotification } = useHelpers()
const { fetch } = useUserSession()
const pinia = useStore()
const offlineStore = useOfflineStore()

const storeId = computed(pinia.getStore)
const loading = ref(false)
const popup = ref(false)
const secondPopup = ref(false)
const form = reactive({value: []})

//Component Emits,Props
const emits = defineEmits(['deleteStore'])
const props = defineProps({
  id: { default: 0 },
  name: { default: '' }
})

//Prompt
function openPopup() {
  popup.value = true
}

function openSecondPopup() {
  popup.value = false
  secondPopup.value = true
}

//Request
async function deleteStore() {
  //Setup data
  const { id } = props
  //If we are inside store then exit store
  if(id === storeId.value)
    pinia.exitStore()

  //Make Request
  loading.value = true
  const response = await useFetchApi(`/api/protected/store/delete`, {
    method: "POST",
    body: {
      id: id,
    }
  })
  await fetch()
  loading.value = false

  //Show error notification
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Close popup, notify user
  secondPopup.value = false
  sendNotification(response.message, 'success')
  emits('deleteStore', response.store_id)
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>