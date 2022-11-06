<script lang="ts">
import { ref } from "vue";
import { Cropper } from "vue-advanced-cropper";
import PDialog from "primevue/dialog";
import PButton from "primevue/button";
import FileUpload from "primevue/fileupload";
import "vue-advanced-cropper/dist/style.css";
import { useVModel } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { useCanvasObjects } from "@/stores/canvasObjects";

export default {
  components: {
    Cropper,
    PDialog,
    FileUpload,
    PButton,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  emits: {
    "update:isOpen"(val: boolean) {
      return typeof val === "boolean";
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const innerIsOpen = useVModel(props, "isOpen", emit);

    const image = ref<{ src: string; type: string } | null>(null);
    const onUploadImage = (event: { files: FileList }) => {
      const { files } = event;
      if (files && files[0]) {
        if (image.value) {
          URL.revokeObjectURL(image.value.src);
        }

        const blob = URL.createObjectURL(files[0]);

        image.value = {
          src: blob,
          type: files[0].type,
        };
      }
    };

    const croppedImage = ref<string | null>(null);
    const onCropChange = ({ canvas }: { canvas: HTMLCanvasElement }) => {
      croppedImage.value = canvas.toDataURL();
    };

    const canvasObjects = useCanvasObjects();

    const onSelectImage = () => {
      canvasObjects.setBackgroundImage(croppedImage.value);
      innerIsOpen.value = false;
    };

    return {
      t,
      innerIsOpen,
      image,
      onCropChange,
      onUploadImage,
      onSelectImage,
    };
  },
};
</script>
<template>
  <PDialog
    class="max-w-[90vw]"
    v-model:visible="innerIsOpen"
    :draggable="false"
    modal
    dismissableMask
  >
    <template #header><h3>{{ t("app.upload.progress") }}</h3></template>
    <template #default>
      <div>
        <Cropper
          v-if="image"
          class="cropper"
          :auto-zoom="true"
          :transitions="true"
          :src="image.src"
          :stencil-props="{
            aspectRatio: 1 / 1,
          }"
          @change="onCropChange"
        />
      </div>
    </template>
    <template #footer>
      <div class="pt-2 flex justify-end gap-2">
        <FileUpload
          accept="image/*"
          mode="basic"
          auto
          custom-upload
          @uploader="onUploadImage($event as any)"
          :chooseLabel="t('app.browse')"
        />
        <PButton
          :label="t('app.confirm')"
          :disabled="!image"
          @click="onSelectImage"
        />
      </div>
    </template>
  </PDialog>
</template>
<style lang="scss" scoped>
.cropper {
  max-height: 400px;
  background: #ddd;
  overflow: hidden;
}
</style>
