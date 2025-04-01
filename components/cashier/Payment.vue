<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t('label.Payment Method')" @opened="focusInput(payment)">
      <div class="flex justify-end mb-4">
        <el-segmented v-model="isSinglePayment" :options="[{label: 'Single Payment', value: true}, {label: 'Multi Payment', value: false}]" @change="calcMoneyDue(), $reset()" />
      </div>

      <div class="text-blue-400 text-center text-2xl mb-2"><b>{{$t('label.Total')}}: ${{parseFloat(total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>

      <div v-if="!isSinglePayment && parseFloat(paymentDue) !== 0" class="text-yellow-400 text-center text-2xl mb-2"><b>{{$t('label.Payment Due')}}: ${{parseFloat(paymentDue).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>

      <div v-if="isSinglePayment">
        <div class="flex justify-center">
          <el-segmented v-model="payment" :options="options" @change="payment = $event, focusInput($event)">
            <template #default="{ item }">
              <div class="flex flex-col items-center gap-2 p-2">
                <Icon size="28" :name="item.icon" />
                <div>{{ $t(`label.${item.label}`) }}</div>
              </div>
            </template>
          </el-segmented>
        </div>

        <div class="flex justify-center my-4">
          <div v-show="payment === 'cash'">
            <el-input v-model="form.cash" ref="cashRef" class="w-60 text-center" placeholder="Cash Given" @input="sanitizeCash($event, 'cash'), form.card = '0.00', form.check = '0.00', form.checkNumber = '', form.cardType = ''" />
            <div class="text-red-400 text-center text-2xl mt-2"><b v-if="form.cash && parseFloat(form.cash) > parseFloat(total)">{{$t('label.Change Due')}}: ${{calcChange(form.cash, total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>
          </div>
          <el-radio-group v-if="payment === 'card'" v-model="form.cardType" @change="form.cash = '0.00', form.check = '0.00', form.checkNumber = ''">
            <el-radio value="american express">American Express</el-radio>
            <el-radio value="visa">Visa</el-radio>
            <el-radio value="mastercard">Mastercard</el-radio>
            <el-radio value="discover">Discover</el-radio>
          </el-radio-group>

          <div v-show="payment === 'check'" class="w-60">
            <el-input v-model="form.checkNumber" ref="checkRef" :placeholder="$t('label.Check Number')" @input="form.cash = '0.00', form.card = '0.00', form.cardType = ''" />
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-4">
        <!-- CASH -->
        <div>
          <div class="text-xl flex items-center justify-center gap-1 mb-2"><Icon size="28" class="text-green-400" name="mdi:cash-usd" /> Cash</div>
          <div class="flex flex-col">
            <el-input v-model="form.cash" class="!w-60 mx-auto text-center" placeholder="Cash Given" @input="sanitizeCash($event, 'cash'), calcMoneyDue()" />
          </div>
        </div>
        <!-- CASH -->
        <!-- CARD -->
        <div>
          <div class="text-xl flex items-center justify-center gap-1 mb-2"><Icon size="28" class="text-yellow-400" name="heroicons:credit-card-16-solid" /> Card</div>
          <div class="flex flex-col gap-2">
            <el-radio-group v-model="form.cardType" class="mx-auto">
              <el-radio value="american express">American Express</el-radio>
              <el-radio value="visa">Visa</el-radio>
              <el-radio value="mastercard">Mastercard</el-radio>
              <el-radio value="discover">Discover</el-radio>
            </el-radio-group>
            <el-input v-model="form.card" class="!w-60 mx-auto text-center" placeholder="Credit Value" @input="sanitizeCash($event, 'card'), calcMoneyDue()" />
          </div>
        </div>
        <!-- CARD -->
        <!-- CHECK -->
        <div>
          <div class="text-xl flex items-center justify-center gap-1 mb-2"><Icon size="28" name="material-symbols:checkbook-rounded" /> Check</div>
          <div class="flex flex-col gap-4">
            <el-input v-model="form.checkNumber" class="!w-80 mx-auto" :placeholder="$t('label.Check Number')" />
            <el-input v-model="form.check" class="!w-60 mx-auto text-center" placeholder="Check Value" @input="sanitizeCash($event, 'check'), calcMoneyDue()" />
          </div>
        </div>
        <!-- CHECK -->
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="isSinglePayment" :disabled="(payment === 'cash' && (!form.cash || parseFloat(form.cash) < parseFloat(total))) || (payment === 'card' && !form.cardType) || (payment === 'check' && !form.checkNumber)" type="success" @click="createTransaction" :loading="loading">{{$t('label.Submit Payment')}}</el-button>
          <el-button v-else :disabled="checkValidMultiPayment()" type="success" @click="createTransaction" :loading="loading">{{$t('label.Submit Payment')}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
//Import
import { Decimal } from 'decimal.js'
const { calcChange } = useCalculations()

//Data
const popup = ref(false)
const isSinglePayment = ref(true)
const payment = ref('cash')
const paymentDue = ref('0.00')

//Focus Input
const cashRef = ref()
const checkRef = ref()

//Form
const form = reactive({
  cash: '0.00',
  card: '0.00',
  check: '0.00',
  cardType: '',
  checkNumber: ''
})

//Reset
const $reset = () => {
  payment.value = 'cash'
  form.cash = '0.00'
  form.card = '0.00'
  form.check = '0.00'
  form.cardType = ''
  form.checkNumber = ''
}

const options = [
  { label: 'Cash', value: 'cash', icon: 'mdi:cash-usd' },
  { label: 'Credit Card', value: 'card', icon: 'heroicons:credit-card-16-solid'},
  { label: 'Check', value: 'check', icon: 'material-symbols:checkbook-rounded'},
]

const props = defineProps({
  loading: { default: false, required: true },
  total: { default: '0.00', required: true },
})

const emit = defineEmits(['createTransaction'])

const focusInput = (value) => {
  if(value === 'cash')
    cashRef.value?.select()
  else if(value === 'check')
    checkRef.value?.focus()
}

//Create Transaction
function createTransaction() {
  if(isSinglePayment.value) {
    if(form.cardType) {
      form.card = props.total
    } else if(form.checkNumber) {
      form.check = props.total
    }
  } else {
    if(parseFloat(form.card) === 0) {
      form.cardType = ''
    } else if(parseFloat(form.check) === 0) {
      form.checkNumber = ''
    }
  }

  emit('createTransaction', form)
}

//Prompt
function openPopup(form) {
  isSinglePayment.value = true
  $reset()

  popup.value = true
  paymentDue.value = props.total

  if(form) {
    const { cash, card, check, cardType, checkNumber } = form
    form.cash = cash
    form.card = card
    form.check = check
    form.cardType = cardType
    form.checkNumber = checkNumber
  }
}

function closePopup() {
  popup.value = false
}

function sanitizeCash(val, type) {
  let sanitize = val.replace(/[^0-9.]/g, '')
  const parts = sanitize.split('.')

  if (parts.length > 2)
    sanitize = parts[0] + '.' + parts[1].slice(0, 2)

  if (parts.length === 2 && parts[1].length > 2)
    sanitize = `${parts[0]}.${parts[1].slice(0, 2)}`
  
  if(type === 'cash')
    form.cash = sanitize
  else if(type === 'card')
    form.card = sanitize
  else if(type === 'check')
    form.check = sanitize
}

function calcMoneyDue() {
  const totalDue = new Decimal(props.total)
  const cashValue = new Decimal(form.cash ? form.cash : 0)
  const cardValue = new Decimal(form.card ? form.card : 0)
  const checkValue = new Decimal(form.check ? form.check : 0)
  
  paymentDue.value = totalDue.minus(cardValue).minus(cashValue).minus(checkValue)
}

function checkValidMultiPayment() {
  const { card, check, cardType, checkNumber } = form

  if(parseFloat(paymentDue.value) !== 0) {
    return true
  } else if(parseFloat(card) > 0 && !cardType) {
    return true
  } else if(parseFloat(check) > 0 && !checkNumber) {
    return true
  }
    
  return false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup,
  closePopup
})
</script>