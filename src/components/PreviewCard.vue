<script lang="ts">
import Card from "primevue/card";
import Badge from "primevue/badge";

export default {
  name: "PreviewCard",
  components: {
    Card,
    Badge,
  },
  props: {
    isSelected: {
      type: Boolean,
      required: false,
      default: false,
    },
    image: {
      type: String,
      required: true,
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
  <div class="relative" @click="$emit('select', image)">
    <Card
      class="card aspect-square cursor-pointer h-full w-full p-ripple"
      v-ripple
    >
      <template #content>
        <div class="h-full w-full flex items-center justify-center">
          <img
            class="image pointer-events-none select-none max-h-full max-w-full"
            :src="image"
          />
        </div>
      </template>
    </Card>
    <Badge v-if="isSelected" class="absolute top-1 right-1" value="✓" />
  </div>
</template>
<style scoped lang="scss">
::v-deep(.card) {
  .p-ink {
    background: rgba(#4f46e5, 0.3);
  }
  .p-card-body {
    @apply p-0 h-full w-full;
  }

  .p-card-content {
    @apply p-0 h-full w-full;
  }
}
.card {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
</style>
