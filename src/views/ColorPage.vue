<script lang="ts">
import { computed, ref } from "vue";
import { useCanvasObjects } from "@/stores/canvasObjects";
import PButton from "primevue/button";
import ColorPicker from "primevue/colorpicker";
import { useI18n } from "vue-i18n";
import { FILL_COLORS } from "@/constants/colors";

export default {
  name: "ColorPage",
  components: { ColorPicker, PButton },
  setup() {
    const { t } = useI18n();
    const canvasStore = useCanvasObjects();

    const currentColor = computed(() =>
      canvasStore.fillColor.slice(1).toLowerCase()
    );

    const resetKey = ref(false);

    const handleChangeColor = (color: string) => {
      const colorToSet = color.startsWith("#") ? color : `#${color}`;
      canvasStore.setFillColor(colorToSet);
    };
    const setDefaultColor = (color: string) => {
      handleChangeColor(color);
      resetKey.value = !resetKey.value;
    };

    return {
      currentColor,
      resetKey,
      handleChangeColor,
      setDefaultColor,
      t,
      defaultColors: FILL_COLORS,
    };
  },
};
</script>
<template>
  <div class="flex flex-col items-start gap-4">
    <div class="flex gap-3">
      <PButton
        @click="setDefaultColor(defaultColors.red)"
        class="red w-14 h-14"
      />
      <PButton
        @click="setDefaultColor(defaultColors.yellow)"
        class="yellow w-14 h-14 bg-[#fabf05]"
      />
      <PButton
        @click="setDefaultColor(defaultColors.green)"
        class="green w-14 h-14"
      />
    </div>
    <ColorPicker
      :model-value="currentColor"
      @update:model-value="handleChangeColor"
      inline
      :key="resetKey.toString()"
    />
  </div>
</template>
<style scoped lang="scss">
::v-deep(.red) {
  background-color: #e40004 !important;
  border-color: #e40004 !important;
} 

::v-deep(.yellow) {
  background-color: #fabf05 !important;
  border-color: #fabf05 !important;
} 

::v-deep(.green) {
  background-color: #2ea32c !important;
  border-color: #2ea32c !important;
} 
</style>