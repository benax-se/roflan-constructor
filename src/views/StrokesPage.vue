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
    const allStrokes: string[] = Object.values(
      import.meta.glob("../assets/strokes/previews/*.png", {
        import: "default",
        eager: true,
      })
    );

    const canvasStore = useCanvasObjects();

    const handleSelect = (eyeImgUrl: string) => {
      canvasStore.setStrokeImg(eyeImgUrl);
    };

    return {
      allStrokes,
      selectedEyes: toRef(canvasStore, "strokeImg"),
      handleSelect,
    };
  },
});
</script>
<template>
    <PreviewGrid
      :images="allStrokes"
      :selected-image="selectedEyes"
      @select="handleSelect"
    />
</template>
