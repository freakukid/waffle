<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Feature disabled" :show-close="false" @close="ok()">
      <p style="text-align: center; font-size: 24px;">
        <b>Cashier has not been setup yet. Please wait for the boss to activate this feature.</b>
      </p>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="ok()">Return to Dashboard</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const popup = ref(false)

//Prompt
function openPopup() {
  popup.value = true
}

//Redirect to dashboard
async function ok() {
  navigateTo('/dashboard')
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>