<script lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { useCanvasObjects } from "@/stores/canvasObjects";
import PDropdown from "primevue/dropdown";
import PButton from "primevue/button";
import ColorPicker from "primevue/colorpicker";
import ImageCropperModal from "@/components/ImageCropperModal.vue";
import { useI18n } from "vue-i18n";
import PreviewGrid from "@/components/PreviewGrid.vue";

export default {
  name: "BackgroundPage",
  components: {
    ColorPicker,
    PDropdown,
    PreviewGrid,
    PButton,
    ImageCropperModal,
  },
  setup() {
    const { t } = useI18n();

    const canvasStore = useCanvasObjects();

    const currentColor = computed(() =>
      canvasStore.backgroundColor !== "transparent"
        ? canvasStore.backgroundColor.slice(1).toLowerCase()
        : "ffffff"
    );

    const handleChangeColor = (color: string) => {
      const colorToSet = color.startsWith("#") ? color : `#${color}`;
      canvasStore.setBackgroundColor(colorToSet);
    };

    const allBackgrounds: string[] = Object.values(
      import.meta.glob("../assets/backgrounds/*.png", {
        import: "default",
        eager: true,
      })
    );

    const handleSelectBackgroundImage = (imgUrl: string) => {
      canvasStore.setBackgroundImage(imgUrl);
    };

    const backgroundOptions = [
      {
        label: t("app.transparent"),
        value: "transparent",
      },
      {
        label: t("app.color"),
        value: "color",
      },
      {
        label: t("app.picture"),
        value: "picture",
      },
    ];

    const selectedOption = ref(backgroundOptions[0].value);
    watch(selectedOption, () => {
      switch (selectedOption.value) {
        case "transparent":
        case "color":
          canvasStore.setBackgroundImage(null);
          canvasStore.setBackgroundColor("transparent");
          break;
        case "picture":
          canvasStore.setBackgroundColor("transparent");
          break;
      }
    });

    const isUploadModalOpen = ref(false);

    const handleUploadImage = () => {
      isUploadModalOpen.value = true;
    };

    return {
      t,
      selectedOption,
      backgroundOptions,
      currentColor,
      handleChangeColor,
      allBackgrounds,
      selectedBackgroundImage: toRef(canvasStore, "backgroundImage"),
      handleSelectBackgroundImage,
      isUploadModalOpen,
      handleUploadImage,
    };
  },
};
</script>
<template>
  <div class="flex flex-col items-start gap-4">
    <PDropdown
      v-model="selectedOption"
      :options="backgroundOptions"
      option-value="value"
      option-label="label"
      class="w-full"
    />
    <div v-if="selectedOption === 'color'">
      <ColorPicker
        :model-value="currentColor"
        @update:model-value="handleChangeColor"
        inline
      />
    </div>
    <div v-else-if="selectedOption === 'picture'">
      <div class="flex flex-col gap-4">
        <PButton
          class="w-full"
          icon="pi pi-upload"
          :label="t('app.upload.prompt')"
          @click="handleUploadImage"
        ></PButton>
        <PreviewGrid
          :images="allBackgrounds"
          :selected-image="selectedBackgroundImage"
          @select="handleSelectBackgroundImage"
        />
      </div>
      <ImageCropperModal v-model:is-open="isUploadModalOpen" />
    </div>
  </div>
</template>
