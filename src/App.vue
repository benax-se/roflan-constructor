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
    class="max-h-full h-full grid md:grid-cols-2 md:gap-4 grid-cols-1 grid-rows-auto w-full auto-rows-fr overflow-hidden"
  >
    <div class="relative p-4 col-span-1 self-center">
      <ConstructorCanvas />
    </div>
    <div class="col-span-1 flex flex-col">
      <TabsPanel />
      <div class="p-4 h-full overflow-y-auto">
        <router-view />
      </div>
    </div>
    <DynamicDialog />
  </div>
</template>

<style scoped></style>
