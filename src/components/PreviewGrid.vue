<script lang="ts">
import type { PropType } from "vue";
import PreviewCard from "@/components/PreviewCard.vue";

export default {
  name: "PreviewGrid",
  components: {
    PreviewCard,
  },
  props: {
    images: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    selectedImage: {
      type: [String, Object] as PropType<string | null>,
      required: false,
      default: null,
    },
  },
  emits: {
    select(image: string) {
      return typeof image === "string";
    },
  },
};
</script>
<template>
  <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
    <PreviewCard
      v-for="(image, index) in images"
      :key="index"
      :image="(image as string)"
      :is-selected="image === selectedImage"
      @select="$emit('select', $event)"
    />
  </div>
</template>
