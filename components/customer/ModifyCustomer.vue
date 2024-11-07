<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="`${type} Customer`" @opened="focusInput()">
      
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
          <el-button :loading="loading" native-type="submit" @click="validateForm">{{type}} Customer</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->

    <!-- Customer Btn -->
    <!-- <el-button v-if="type === 'Create'" @click="openPopup(true)" type="success">Create Customer</el-button>
    <el-button v-else @click="openPopup(true)" type="warning">Edit Customer</el-button> -->
    <!-- Customer Btn -->
  </div>
</template>

<script setup>
//Import
const offlineStore = useOfflineStore()
const { validateEmail } = useValidator()
import { ElNotification } from 'element-plus'
const { handleCustomerRequest } = useHandleRequests()
const { getRandomString } = useFormatter()
//Data
const popup = ref(false)
const loading = ref(false)
const formRef = ref()
//Component
const props = defineProps({
  type: { default: 'Create' },
  id: { default: 0 },
  storeId: { default: 0, required: true },
  name: { default: '' },
  email: { default: '' },
  phone: { default: '' },
  company: { default: '' },
  //Address
  address: { default: '' },
  city: { default: '' },
  zipcode: { default: '' },
  state: { default: '' },
  country: { default: '' }
})
const emits = defineEmits(['addCustomer', 'editCustomer'])

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
    trigger: 'change'
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

  if(active && props.type === 'Edit') {
    const { name, email, phone, company, address, city, zipcode, state, country } = props

    form.name = name
    form.email = email
    form.phone = phone
    form.company = company
    form.address = address
    form.city = city
    form.zipcode = zipcode
    form.state = state
    form.country = country
  }
}

function validateForm() {
  formRef.value.validate((valid) => {
    if (props.type === 'Create' && valid)
      createCustomer()
    else if (props.type === 'Edit' && valid)
      editCustomer()
  })
}

async function createCustomer() {
  //Setup data
  const { name, email, phone, company, address, city, zipcode, state, country } = form

  //Make request to create customer
  loading.value = true
  const postData = { store_id: props.storeId, name: name, email: email, phone: phone, company: company, address: address, city: city, zipcode: zipcode, state: state, country: country }
  const isUserOnline = await offlineStore.tryPingingServer()
  if(isUserOnline) {
    const response = await handleCustomerRequest(postData)
    emits('addCustomer', response.customer)
  } else {
    postData.offline_id = getRandomString(postData.name)
    offlineStore.addCustomerRequests(postData, { customer: postData })
    ElNotification({ title: 'Offline Success', message: `Added to the offline queue. Changes will take effect when you're back online.`, type: 'success'})
  }
  loading.value = false

  //emit value to parent component, close popup
  popup.value = false
}

async function editCustomer() {
  //Setup data
  const { name, email, phone, company, address, city, zipcode, state, country } = form
  const { id } = props

  //Make request to create transaction
  loading.value = true
  const response = await useFetchApi(`/api/protected/customer/edit`, {
    method: "POST",
    body: {
      id: id,
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
    ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
    return
  }

  //show success message
  ElNotification({ title: 'Success', message: response.message, type: 'success'})

  //emit value to parent component, close popup
  emits('editCustomer', response.customer)
  popup.value = false
}

//Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>