<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="`${type} Store`" @opened="focusInput()">
      
      <el-form id="form" ref="formRef" :model="form" :rules="rules" label-width="auto" label-position="top" @submit.prevent>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" ref="nameRef" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Website" prop="website">
          <el-input v-model="form.website" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Phone Number" prop="phone">
          <el-input v-model="form.phone" type="text" autocomplete="off" />
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
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
            <el-button disabled>{{type}} Store</el-button>
          </el-tooltip>
          <el-button v-else :loading="loading" native-type="submit" @click="validateForm">{{type}} Store</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->

    <!-- Button -->
    <el-tooltip v-if="!offlineStore.getOnlineStatus() && type === 'Create'" content="Feature only available online." placement="top">
      <el-button id="create-btn" class="offline" type="primary" disabled>
        <div class="btn-body">
          <Icon name="mdi:store-plus" />
          <b>Create Store</b>
        </div>
      </el-button>
    </el-tooltip>

    <el-button v-else-if="type === 'Create'" id="create-btn" type="primary" @click="openPopup(true)">
      <div class="btn-body">
        <Icon name="mdi:store-plus" />
        <b>Create Store</b>
      </div>
    </el-button>
    <!-- Button -->
  </div>
</template>

<script setup>
//Import
const { validateEmail } = useValidator()
const { notify } = useNotification()
const { signOut } = useAuth()
const pinia = useStore()
const offlineStore = useOfflineStore()
//Data
const popup = ref(false)
const loading = ref(false)
const formRef = ref()
//Component
const props = defineProps({
  type: { default: 'Create' },
  id: { default: 0 },
  name: { default: '' },
  email: { default: '' },
  phone: { default: '' },
  website: { default: '' },
  //Address
  address: { default: '' },
  city: { default: '' },
  zipcode: { default: '' },
  state: { default: '' },
  country: { default: '' }
})
const emits = defineEmits(['addStore', 'editStore'])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  website: '',
  //Address
  address: '',
  city: '',
  zipcode: '',
  state: '',
  country: ''
})

const rules = reactive({
  name: [{ min: 2, message: 'Length must be 2 or more', trigger: ['blur', 'change'] }],
  email: [{ type: 'email', message: 'Invalid email format', trigger: ['blur', 'change']}],
  phone: [{ pattern: /^\d{10}$/, message: 'Invalid phone number format', trigger: ['blur', 'change']}],
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
    const { name, email, phone, website, address, city, zipcode, state, country } = props

    form.name = name
    form.email = email
    form.phone = phone
    form.website = website
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
      createStore()
    else if (props.type === 'Edit' && valid)
      editStore()
  })
}

async function createStore() {
  //Setup data
  const { name, email, phone, website, address, city, zipcode, state, country } = form

  //Make request to create transaction
  loading.value = true
  const response = await useFetchApi(`/api/protected/store/create`, {
    method: "POST",
    body: {
      name: name,
      email: email,
      phone: phone,
      website: website,
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
  emits('addStore', response.store)
  popup.value = false
  pinia.exitStore()
  // signOut({ callbackUrl: '/login' })
}

async function editStore() {
  //Setup data
  const { name, email, phone, website, address, city, zipcode, state, country } = form
  const { id } = props

  //Make request to create transaction
  loading.value = true
  const response = await useFetchApi(`/api/protected/store/edit`, {
    method: "POST",
    body: {
      id: id,
      name: name,
      email: email,
      phone: phone,
      website: website,
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
  emits('editStore', response.store)
  popup.value = false
}

//Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>

<style lang="scss" scoped>
#create-btn {
  height: 300px;
  width: 300px;
  background: #1c1c1c;
  border: 2px dashed #67c23a;
  color: #67c23a;
  font-size: 32px;
  transition: all 200ms ease-in-out;
  &:hover {
    border-color: #54ff00;
    color: #54ff00;
  }
  &.offline {
    border-color: #797979;
    color: #797979;
  }
  .btn-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    svg {
      font-size: 150px;
    }
  }
}
</style>