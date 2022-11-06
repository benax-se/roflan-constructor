<script lang="ts">
import { toRef } from "vue";
import PreviewGrid from "@/components/PreviewGrid.vue";
import { useCanvasObjects } from "@/stores/canvasObjects";

export default {
  name: "MouthPage",
  components: {
    PreviewGrid,
  },
  setup() {
    const allMouths: string[] = Object.values(
      import.meta.glob("../assets/mouths/*.png", {
        import: "default",
        eager: true,
      })
    );

    const canvasStore = useCanvasObjects();

    const handleSelect = (mouthImgUrl: string) => {
      canvasStore.setMouthImg(mouthImgUrl);
    };

    return {
      allMouths,
      selectedMouth: toRef(canvasStore, "mouthImg"),
      handleSelect,
    };
  },
};
</script>
<template>
  <PreviewGrid
    :images="allMouths"
    :selected-image="selectedMouth"
    @select="handleSelect"
  />
</template>
