<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.${type} store`)" @opened="focusInput()">
      
      <el-form id="form" ref="formRef" :model="form" :rules="rules" label-width="auto" label-position="top" @submit.prevent>
        <el-form-item :label="$t(`label.name`)" prop="name">
          <el-input v-model="form.name" ref="nameRef" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t(`label.email`)" prop="email">
          <el-input v-model="form.email" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t(`label.website`)" prop="website">
          <el-input v-model="form.website" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t(`label.phone number`)" prop="phone">
          <el-input v-model="form.phone" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t(`label.address`)" prop="address">
          <el-input v-model="form.address" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t(`label.city`)" prop="city">
          <el-input v-model="form.city" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t(`label.zip code`)" prop="zipcode">
          <el-input v-model="form.zipcode" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t(`label.state`)" prop="state">
          <el-input v-model="form.state" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t(`label.country`)" prop="country">
          <el-input v-model="form.country" type="text" autocomplete="off" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button disabled>{{$t(`label.${type}`)}}</el-button>
          </el-tooltip>
          <el-button v-else :loading="loading" native-type="submit" @click="validateForm">{{$t(`label.${type}`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->

    <!-- Button -->
    <el-tooltip v-if="!offlineStore.getOnlineStatus() && type === 'create'" :content="$t(`tippy.feature only available online`)" placement="top">
      <el-button id="create-btn" class="offline" disabled>
        <div class="btn-body">
          <Icon name="mdi:store-plus" />
          <b>{{$t(`title.create store`)}}</b>
        </div>
      </el-button>
    </el-tooltip>

    <el-button v-else-if="type === 'create'" id="create-btn" @click="openPopup(true)">
      <div class="btn-body">
        <Icon name="mdi:store-plus" />
        <b>{{$t(`title.create store`)}}</b>
      </div>
    </el-button>
    <!-- Button -->
  </div>
</template>

<script setup>
//Import
const { $t } = useNuxtApp()
const { validateEmail } = useValidator()
const { sendNotification } = useHelpers()
const { fetch } = useUserSession()
const pinia = useStore()
const offlineStore = useOfflineStore()
//Data
const popup = ref(false)
const loading = ref(false)
const formRef = ref()
//Component
const props = defineProps({
  type: { default: 'create' },
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
  name: [{ min: 2, message: $t('invalid.The name must consist of at least 2 characters'), trigger: ['blur', 'change'] }],
  email: [{ type: 'email', message: $t('invalid.Invalid email format'), trigger: ['blur', 'change']}],
  phone: [{ pattern: /^\d{10}$/, message: $t('invalid.Invalid phone number format'), trigger: ['blur', 'change']}],
})

//Focus Input
const nameRef = ref()
const focusInput = () => {
  nameRef.value?.focus()
}

//Prompt
function openPopup(active) {
  popup.value = active

  if(active && props.type === 'edit') {
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
    if (props.type === 'create' && valid)
      createStore()
    else if (props.type === 'edit' && valid)
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
  await fetch()
  loading.value = false

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //show success message
  sendNotification(response.message, 'success')

  //emit value to parent component, close popup
  emits('addStore', response.store)
  popup.value = false
  pinia.exitStore()
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
    sendNotification(response.statusMessage, 'error')
    return
  }

  //show success message
  sendNotification(response.message, 'success')

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