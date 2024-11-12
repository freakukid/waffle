<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t('label.Feature Disabled')" :show-close="false" @close="ok()">
      <p style="text-align: center; font-size: 24px;">
        <b>{{$t('text.The cashier feature is not yet activated, please wait for the manager to enable it')}}</b>
      </p>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="ok()">{{$t('label.Return to Dashboard')}}</el-button>
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