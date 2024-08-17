<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Settings" fullscreen>
      <el-form :model="form" label-position="top" @submit.prevent="changeSettings()">
        <label>Tax: </label>
        <el-input-number v-model="form.tax" :precision="2" :step="0.1" :max="100" />
        <span> % </span>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button type="warning" @click="changeSettings()" :loading="loading.settings">Submit</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
    
    <!-- Settings Btn -->
    <el-button @click="openPopup()" type="success">Settings</el-button>
    <!-- Settings Btn -->
  </div>
</template>

<script setup>
const { notify } = useNotification()

const loading = reactive({ settings: false })
const popup = ref(false)
const form = reactive({
  tax: 0
})

//Component Emits,Props
const emits = defineEmits(['setStore'])
const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})

//Prompt
function openPopup() {
  form.tax = props.store.tax
  popup.value = true
}

//Request
async function changeSettings() {
  //Check if tax is withing 0 to 100%
  if(form.tax < 0 || form.tax > 100) {
    notify({ title: 'Error', text: 'Tax percentage cannot be under 0% or above 100%', type: 'error'})
    return
  }

  //Request
  loading.settings = true
  const response = await useFetchApi(`/api/protected/store/edit-settings`, {
    method: "POST",
    body: {
      id: props.store.id,
      tax: form.tax,
    }
  })
  loading.settings = false

  //Display error
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  //Emit to parent component
  if(response.store)
    emits('setStore', response.store)

  //Close popup, Show success message
  popup.value = false
  notify({ title: 'Success', text: response.message, type: 'success'})
}
</script>