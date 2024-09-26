<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Register Customer" fullscreen @opened="focusInput()">
      
      <el-form id="form" ref="formRef" :model="form" :rules="rules" label-width="auto" label-position="top" @submit.prevent>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" ref="nameRef" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Phone Number" prop="phone">
          <el-input v-model="form.phone" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Company Name" prop="company">
          <el-input v-model="form.company" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Address" prop="address">
          <el-input v-model="form.address" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="City" prop="city">
          <el-input v-model="form.city" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Zip Code" prop="zipcode">
          <el-input v-model="form.zipcode" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="State" prop="state">
          <el-input v-model="form.state" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Country" prop="country">
          <el-input v-model="form.country" type="text" autocomplete="off" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button :loading="loading" native-type="submit" @click="validateForm">Register Customer</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->

    <!-- Customer Btn -->
    <el-button @click="openPopup(true)" type="success">Create Customer</el-button>
    <!-- Customer Btn -->
  </div>
</template>

<script setup>
//Import
const { validateEmail } = useValidator()
const { notify } = useNotification()
//Data
const popup = ref(false)
const loading = ref(false)
const formRef = ref()
//Component
const props = defineProps({ storeId: { required: true } })
const emits = defineEmits(['addCustomer'])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  //Address
  address: '',
  city: '',
  zipcode: '',
  state: '',
  country: ''
})

const rules = reactive({
  name: [{
    required: true,
    message: `Please enter the customer's name`,
    trigger: 'blur'
  }],
  email: [{
    type: 'email',
    message: 'Invalid email format',
    trigger: ['blur', 'change']
  }],
  phone: [{
    pattern: /^\d{10}$/,
    message: 'Invalid phone number format',
    trigger: ['blur', 'change']
  }],
})

//Focus Input
const nameRef = ref()
const focusInput = () => {
  nameRef.value?.focus()
}

//Prompt
function openPopup(active) {
  popup.value = active
}

function validateForm() {
  formRef.value.validate((valid) => {
    if (valid)
      createCustomer()
  })
}

async function createCustomer() {
  //Setup data
  const { name, email, phone, company, address, city, zipcode, state, country } = form

  //Make request to create transaction
  loading.value = true
  const response = await useFetchApi(`/api/protected/customer/create`, {
    method: "POST",
    body: {
      store_id: props.storeId,
      name: name,
      email: email,
      phone: phone,
      company: company,
      address: address,
      city: city,
      zipcode: zipcode,
      state: state,
      country: country
    }
  })
  loading.value = false

  //Display error
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  //show success message
  notify({ title: 'Success', text: response.message, type: 'success'})

  //emit value to parent component, close popup
  emits('addCustomer', response.customer)
  popup.value = false
}

//Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>