<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t('label.Discount')">
      <div class="text-blue-400 text-center text-xl mb-2">
        <b>{{ $t('label.Total') }}: <span :class="{'line-through': newPrice !== '0.00'}">${{ total }}</span> <span v-if="newPrice !== '0.00'">{{newPrice}}</span></b>
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
          <div class="text-red-400 text-center mt-2"><b v-if="parseFloat(amount) < 0">{{ $t('text.The amount cannot be negative.') }}</b></div>
          <div class="text-red-400 text-center mt-2"><b v-if="parseFloat(amount) > parseFloat(total)">{{ $t('text.The amount cannot be greater than the original price.') }}</b></div>
        </div>
        <div v-show="type === 'percent'">
          <el-input v-model="percent" ref="percentRef" class="w-20 text-center" placeholder="Percent" @input="sanitizeNum($event), calcNewPrice()">
            <template #suffix>
              <span>%</span>
            </template>
          </el-input>
          <div class="text-red-400 text-center mt-2"><b v-if="percent < 0">{{ $t('text.The percent cannot be negative.') }}</b></div>
          <div class="text-red-400 text-center mt-2"><b v-if="percent > 100">{{ $t('text.The percent cannot be greater than 100.') }}</b></div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="updateDiscount()" :loading="loading"
            :disabled="(type === 'amount' && (parseFloat(amount) < 0 || parseFloat(amount) > parseFloat(total))) || (type === 'percent' && (percent < 0 || percent > 100))">
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
const total = ref(0)
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
  if (value === 'fixed')
    fixedRef.value?.select()
  else if (value === 'percent')
    percentRef.value?.focus()
}

//Reset
const $reset = () => {
  amount.value = '0.00'
  percent.value = 0
  total.value = 0
  newPrice.value = ref('0.00')
  type.value = 'percent'
}

//Prompt
function openPopup(subtotal, discount, discountType) {
  popup.value = true
  type.value = discountType
  total.value = subtotal

  if(discountType === 'percent') {
    percent.value = discount
  } else if(discountType === 'amount') {
    amount.value = discount
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
    newPrice.value = calcDiscount(total.value, percent.value, type.value)
  } else if(type.value === 'amount' && parseFloat(amount.value) > 0 && parseFloat(amount.value) <= parseFloat(total.value)) {
    newPrice.value = calcDiscount(total.value, amount.value, type.value)
  } else {
    newPrice.value = '0.00'
  }
}

function updateDiscount() {
  calcNewPrice()

  emit('update', type.value === 'percent' ? percent.value : amount.value, type.value)

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
