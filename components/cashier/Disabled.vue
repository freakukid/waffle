<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t('label.Feature Disabled')" width="500" :show-close="false" @close="ok()">
      <p class="text-center text-base">
        <b v-if="isBoss">{{$t('text.To enable the cashier feature, the name and price columns must be linked in the settings')}}</b>
        <b v-else>{{$t('text.The cashier feature is not yet activated, please wait for the manager to enable it')}}</b>
      </p>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="isBoss" type="success" @click="ok()">{{$t('label.View Settings')}}</el-button>
          <el-button v-else type="success" @click="ok()">{{$t('label.Return to Dashboard')}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const props = defineProps({ isBoss: { required: true } })
const popup = ref(false)

//Prompt
function openPopup() {
  popup.value = true
}

//Redirect to dashboard
async function ok() {
  if(props.isBoss)
    navigateTo('/settings#columns')
  else
    navigateTo('/dashboard')
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>