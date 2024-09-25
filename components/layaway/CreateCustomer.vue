<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Register Customer" @opened="focusInput()">
      

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button :loading="loading">Register Customer</el-button>
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
//Data
const popup = ref(false)
const loading = ref(false)

//Focus Input
const nameRef = ref()

const focusInput = () => {
  nameRef.value?.focus()
}

//Prompt
function openPopup(active) {
  popup.value = active
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>