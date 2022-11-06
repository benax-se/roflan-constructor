<script lang="ts">
import PreviewGrid from "@/components/PreviewGrid.vue";
import { accessoriesEventBus } from "@/buses/accessoriesBus";

export default {
  name: "AccessoriesPage",
  components: {
    PreviewGrid,
  },
  setup() {
    const accessories: string[] = Object.values(
      import.meta.glob("../assets/accessories/*.png", {
        import: "default",
        eager: true,
      })
    );

    const handleSelect = (eyeImgUrl: string) => {
      accessoriesEventBus.emit("add", eyeImgUrl);
    };

    return { accessories, handleSelect };
  },
};
</script>
<template>
  <PreviewGrid :images="accessories" @select="handleSelect" />
</template>
