<script lang="ts">
import { defineComponent } from "vue";
import TabsPanel from "./components/TabsPanel.vue";
import ConstructorCanvas from "./components/ConstructorCanvas.vue";
import DynamicDialog from "primevue/dynamicdialog";
import Toast from "primevue/toast";

export default defineComponent({
  name: "App",
  components: {
    TabsPanel,
    ConstructorCanvas,
    DynamicDialog,
    Toast,
  },
});
</script>

<template>
  <Toast class="max-w-[90vw]" />
  <div
    class="max-h-full h-full grid gap-2 grid-cols-1 md:grid-cols-2 grid-rows-auto w-full auto-rows-fr overflow-hidden"
  >
    <div class="h-full col-span-1 self-center p-2 margin-auto">
      <div class="h-full flex items-center justify-center">
        <ConstructorCanvas />
      </div>
    </div>
    <div class="col-span-1 flex flex-col h-full">
      <TabsPanel />
    </div>
    <DynamicDialog />
  </div>
</template>
<style lang="scss">
.p-toast-message {
  @apply rounded;
}
.p-toast-message-content {
  @apply border-none;
}
</style>
