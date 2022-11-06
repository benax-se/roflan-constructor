<script lang="ts">
import { defineComponent, toRef } from "vue";
import PreviewGrid from "@/components/PreviewGrid.vue";
import { useCanvasObjects } from "@/stores/canvasObjects";

export default defineComponent({
  name: "EyesPage",
  components: {
    PreviewGrid,
  },
  setup() {
    const allEyes: string[] = Object.values(
      import.meta.glob("../assets/eyes/*.png", {
        import: "default",
        eager: true,
      })
    );

    const canvasStore = useCanvasObjects();

    const handleSelect = (eyeImgUrl: string) => {
      canvasStore.setEyesImg(eyeImgUrl);
    };

    return {
      allEyes,
      selectedEyes: toRef(canvasStore, "eyesImg"),
      handleSelect,
    };
  },
});
</script>
<template>
    <PreviewGrid
      :images="allEyes"
      :selected-image="selectedEyes"
      @select="handleSelect"
    />
</template>
