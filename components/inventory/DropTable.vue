<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.delete table`)" width="300">
      <p class="text-center">{{$t(`text.the following will be deleted:`)}}</p>
      <ul class="list-disc w-44 my-4 mx-auto">
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

    <el-dialog id="error-popup" v-model="secondPopup" :title="$t(`title.delete table`)" width="500">
      <div class="text-white">
        <p class="text-center text-xl"><b>{{$t(`text.Are you sure you want to delete the following?`)}}</b></p>
        <ul class="list-disc w-fit p-4 my-2 mx-auto text-lg">
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
          <el-button v-else :loading="loading.dropTable" type="danger" @click="dropTable()">{{$t(`label.delete`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
const offlineStore = useOfflineStore()

const loading = reactive({ dropTable: false })
const popup = ref(false)
const secondPopup = ref(false)
const form = reactive({value: []})

//Component Emits,Props
const emits = defineEmits(['setInventory'])
const props = defineProps({
  storeId: {
    type: Number,
  }
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
async function dropTable() {
  //Make inventory request
  loading.dropTable = true
  let inventory = await handleInventoryRequest({
    path: 'drop-table',
    data: { store_id: props.storeId },
  })

  //Emit to parent component
  if(inventory) {
    emits('setInventory', inventory)
  }

  //Loading complete, Close popup
  loading.dropTable = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>