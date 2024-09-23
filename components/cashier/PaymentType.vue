<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Payment method" @opened="focusInput(payment)">
      <div class="text-blue-400 text-center text-xl mb-2"><b>Total: ${{parseFloat(total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>

      <div class="flex justify-center">
        <el-segmented :model-value="payment" :options="options" @change="$emit('update:payment', $event), focusInput($event)">
          <template #default="{ item }">
            <div class="flex flex-col items-center gap-2 p-2">
              <Icon size="28" :name="item.icon" />
              <div>{{ item.label }}</div>
            </div>
          </template>
        </el-segmented>
      </div>

      <div class="flex justify-center my-4">
        <div v-show="payment === 'cash'">
          <el-input :model-value="cash" ref="cashRef" class="w-60 text-center" placeholder="Cash Given" @input="test" />
          <div class="text-red-400 text-center text-2xl mt-2"><b v-if="cash && parseFloat(cash) > parseFloat(total)">Change Due: ${{calcChange(cash, total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>
        </div>
        <el-radio-group v-if="payment === 'card'" :model-value="card" @change="$emit('update:cash', ''), $emit('update:check', ''), $emit('update:card', $event)">
          <el-radio value="american express">American Express</el-radio>
          <el-radio value="visa">Visa</el-radio>
          <el-radio value="mastercard">Mastercard</el-radio>
          <el-radio value="discover">Discover</el-radio>
        </el-radio-group>

        <div v-show="payment === 'check'" class="w-60">
          <el-input :model-value="check" ref="checkRef" placeholder="Check Number" @input="$emit('update:cash', ''), $emit('update:card', ''), $emit('update:check', $event)" />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button :disabled="(payment === 'cash' && (!cash || parseFloat(cash) < parseFloat(total))) || (payment === 'card' && !card) || (payment === 'check' && !check)" type="success" @click="$emit('createTransaction')" :loading="loading">Submit Payment</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
//Import
const { calcChange } = useCalculations()

//Data
const popup = ref(false)

const options = [
  { label: 'Cash', value: 'cash', icon: 'mdi:cash-usd' },
  { label: 'Credit Card', value: 'card', icon: 'heroicons:credit-card-16-solid'},
  { label: 'Check', value: 'check', icon: 'material-symbols:checkbook-rounded'},
]

const props = defineProps({
  payment: { default: 'cash', required: true },
  cash: { default: '', required: true},
  card: { default: '', required: true },
  check: { default: '', required: true},
  loading: { default: false, required: true},
  total: { default: '0.00', required: true },
})

const emit = defineEmits(['update:payment', 'update:cash', 'update:card', 'update:check', 'createTransaction'])

//Focus Input
const cashRef = ref()
const checkRef = ref()

const focusInput = (value) => {
  if(value === 'cash')
    cashRef.value?.focus()
  else if(value === 'check')
    checkRef.value?.focus()
}

//Prompt
function openPopup(active) {
  popup.value = active
}

function test(val) {
  emit('update:card', '')
  emit('update:check', '')

  let sanitize = val.replace(/[^0-9.]/g, '')
  const parts = sanitize.split('.')

  if (parts.length > 2)
    sanitize = parts[0] + '.' + parts[1].slice(0, 2)

  if (parts.length === 2 && parts[1].length > 2)
    sanitize = `${parts[0]}.${parts[1].slice(0, 2)}`

  emit('update:cash', sanitize)
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>