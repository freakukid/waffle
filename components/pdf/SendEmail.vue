<template>
  <!-- Popup -->
  <el-dialog v-model="popup" title="Send Invoice" width="300px" @opened="focusInput">
    <el-form ref="formRef" class="w-80" :model="form" :rules="rules" @submit.prevent="validateForm">
      <el-form-item prop="email">
        <div>Customer Email</div>
        <el-input v-model="form.email" ref="emailInput" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="popup = false">Cancel</el-button>
        <el-button type="success" :loading="loading" @click="validateForm">Send Invoice</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- Popup -->
</template>

<script setup>
const popup = ref(false)
const formRef = ref(null)
const form = reactive({ email: '' })

//Component Emits, Props
const props = defineProps({ loading: {default: false} })
const emits = defineEmits(['sendEmailPDF'])

//Focus Input
const emailInput = ref()
const focusInput = () => {
  emailInput.value?.focus()
}

const rules = reactive({
  email: [{
    required: true,
    type: 'email',
    message: 'Invalid email format',
    trigger: ['blur', 'change']
  }],
})

//Prompt
function openPopup(active, email) {
  form.email = email
  popup.value = active
}

function validateForm() {
  formRef.value.validate((valid) => {
    if (valid)
      emits('sendEmailPDF', form.email)
  })
}

// Expose the methods to parent
defineExpose({
  openPopup
})
</script>