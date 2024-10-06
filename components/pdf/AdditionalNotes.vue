<template>
  <!-- Popup -->
  <el-dialog v-model="popup" title="Send Invoice" width="420px">
    <el-form v-if="type === 'email'" ref="formRef" :model="form" :rules="rules" @submit.prevent="generatePDF()">
      <el-form-item prop="email" class="w-96">
        <div>Customer Email</div>
        <el-input v-model="form.email" ref="emailInput" autocomplete="off" />
      </el-form-item>
    </el-form>

    <el-form :model="form" class="my-4" label-position="top" @submit.prevent="generatePDF()">
      <div class="mb-4"><b>ADDITIONAL NOTES (optional)</b></div>
      <div v-for="(note, i) in form.notes" :key="i">
        <div class="flex items-center gap-4">
          <div>
            <el-checkbox v-model="note.bold" label="Bold" />
          </div>
          <div class="w-80" :class="{ bold: note.bold }">
            <el-form-item label="Text" prop="text">
              <el-input v-model="note.text" ref="noteRef" />
            </el-form-item>
          </div>
          <div v-if="i > 0">
            <el-button type="danger" circle @click="removeNote(i)">
              <Icon name="material-symbols:delete-rounded" />
            </el-button>
          </div>
          <div v-else class="w-6" />
        </div>
      </div>

      <div class="ml-44">
        <el-button type="success" @click="addNote()">Add</el-button>
      </div>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="popup = false">Cancel</el-button>
        <el-button type="success" :loading="loading" @click="generatePDF">Send Invoice</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- Popup -->
</template>

<script setup>
const popup = ref(false)
const formRef = ref(null)
const form = reactive({
  email: '',
  notes: [{text: '', bold: false}]
})

const rules = reactive({
  email: [{
    required: true,
    type: 'email',
    message: 'Invalid email format',
    trigger: ['blur', 'change']
  }],
})

//Focus Input
const emailInput = ref()
const noteRef = ref()

//Component Emits, Props
const props = defineProps({
  type: {default: ''},
  loading: {default: false} 
})
const emits = defineEmits(['generatePDF'])

//Prompt
async function openPopup(active, action, email = '') {
  form.notes = [{text: '', bold: false}]
  popup.value = active

  await new Promise(resolve => setTimeout(resolve, 200))
  if(action === 'email') {
    form.email = email
    //Focus Input
    emailInput.value?.focus()
  } else {
    //Focus Input
    noteRef.value[0]?.focus()
  }
}

function addNote() {
  form.notes.push({text: '', bold: false})
}

function removeNote(i) {
  form.notes.splice(i, 1)
}

function validateForm() {
  formRef.value.validate((valid) => {
    if (valid)
      emits('generatePDF', form.notes, form.email)
  })
}

function generatePDF() {
  if(props.type === 'email')
    validateForm()
  else
    emits('generatePDF', form.notes)
}

// Expose the methods to parent
defineExpose({
  openPopup
})
</script>