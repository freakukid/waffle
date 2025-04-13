<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t('label.Discount')">
      <div class="text-blue-400 text-center text-xl mb-2">
        <b>{{ $t('label.Price') }}: <span :class="{'line-through': (type === 'amount' && parseFloat(amount) > 0 || type === 'percent' && parseFloat(percent) > 0)}">${{ price }}</span> <span v-if="(type === 'amount' && parseFloat(amount) > 0 || type === 'percent' && parseFloat(percent) > 0)">{{newPrice}}</span></b>
      </div>

      <div class="flex justify-center">
        <el-segmented v-model="type" :options="options" @change="type = $event, focusInput($event)">
          <template #default="{ item }">
            <div class="flex flex-col items-center gap-2 p-2">
              <Icon size="28" :name="item.icon" />
              <div>{{ $t(`label.${item.label}`) }}</div>
            </div>
          </template>
        </el-segmented>
      </div>

      <div class="flex justify-center my-4">
        <div v-show="type === 'amount'">
          <el-input v-model="amount" ref="fixedRef" class="w-60 text-center" placeholder="Amount" @input="sanitizeCash($event), calcNewPrice()">
            <template #prefix>
              <span>$</span>
            </template>
          </el-input>
          <div class="text-red-400 text-center mt-2"><b v-if="parseFloat(amount) < 0">{{ $t('text.The amount cannot be negative') }}</b></div>
          <div class="text-red-400 text-center mt-2"><b v-if="parseFloat(amount) > parseFloat(price)">{{ $t('text.The amount cannot be greater than the original price') }}</b></div>
        </div>
        <div v-show="type === 'percent'">
          <el-input v-model="percent" ref="percentRef" class="w-20 text-center" placeholder="Percent" @input="sanitizeNum($event), calcNewPrice()">
            <template #suffix>
              <span>%</span>
            </template>
          </el-input>
          <div class="text-red-400 text-center mt-2"><b v-if="percent < 0">{{ $t('text.The percent cannot be negative') }}</b></div>
          <div class="text-red-400 text-center mt-2"><b v-if="percent > 100">{{ $t('text.The percent cannot be greater than 100') }}</b></div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="updateDiscount()" :loading="loading"
            :disabled="(type === 'amount' && (parseFloat(amount) < 0 || parseFloat(amount) > parseFloat(price))) || (type === 'percent' && (percent < 0 || percent > 100))">
            {{ $t('label.Submit Discount') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
//Import
const { calcDiscount } = useCalculations()

//Data
const popup = ref(false)
const amount = ref('0.00')
const percent = ref(0)
const product = ref(null)
const price = ref(0)
const newPrice = ref('0.00')
const type = ref('percent')

const options = [
  { label: 'Percent Off', value: 'percent', icon: 'mdi:ticket-percent-outline' },
  { label: 'Amount Off', value: 'amount', icon: 'majesticons:money-minus-line' }
]

const emit = defineEmits(['update'])

//Focus Input
const fixedRef = ref()
const percentRef = ref()

const focusInput = (value) => {
  if (value === 'amount')
    fixedRef.value?.select()
  else if (value === 'percent')
    percentRef.value?.focus()
}

//Reset
const $reset = () => {
  amount.value = '0.00'
  percent.value = 0
  product.value = null
  price.value = 0
  newPrice.value = ref('0.00')
  type.value = 'percent'
}

//Prompt
function openPopup(active, item) {
  popup.value = active
  product.value = item
  type.value = item.__discount_type
  price.value = item.__price

  if(item.__discount_type === 'percent') {
    percent.value = item.__discount
  } else if(item.__discount_type === 'amount') {
    amount.value = item.__discount
  }

  calcNewPrice()
}

function sanitizeNum(val) {
  let sanitize = val.replace(/[^0-9.]/g, '')

  percent.value = sanitize
}

function sanitizeCash(val) {
  let sanitize = val.replace(/[^0-9.]/g, '')
  const parts = sanitize.split('.')

  if (parts.length > 2) sanitize = parts[0] + '.' + parts[1].slice(0, 2)

  if (parts.length === 2 && parts[1].length > 2) sanitize = `${parts[0]}.${parts[1].slice(0, 2)}`

  amount.value = sanitize
}

function calcNewPrice() {
  if(type.value === 'percent' && percent.value > 0 && percent.value <= 100) {
    newPrice.value = calcDiscount(price.value, percent.value, type.value)
  } else if(type.value === 'amount' && parseFloat(amount.value) > 0 && parseFloat(amount.value) <= parseFloat(price.value)) {
    newPrice.value = calcDiscount(price.value, amount.value, type.value)
  } else {
    newPrice.value = '0.00'
  }
}

function updateDiscount() {
  calcNewPrice()

  //update product values
  product.value.__discount_type = type.value
  product.value.__discount = type.value === 'percent' ? percent.value : amount.value
  product.value.__new_price = newPrice.value

  emit('update', product.value, 'Discount Added!')

  //reset
  $reset()

  //close popup
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>
