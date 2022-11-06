<script lang="ts">
import Konva from "konva";
import { onMounted, ref, watchEffect, toRefs, type Ref, computed } from "vue";
import PButton from "primevue/button";
import { useToast } from "primevue/usetoast";
import { useCanvasObjects } from "@/stores/canvasObjects";
import { accessoriesEventBus } from "@/buses/accessoriesBus";
import dayjs from "dayjs";
import { dataURLtoBlob } from "@/utils/file";
import { useI18n } from "vue-i18n";

interface StageConfig {
  width: number;
  height: number;
  scale: { x: number; y: number };
}

interface BaseImageConfig {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  image: HTMLImageElement;
}

interface BaseDraggableImageConfig extends BaseImageConfig {
  draggable: true;
}

interface EyesConfig extends BaseDraggableImageConfig {
  name: "eyes";
  x: number;
  y: number;
}

interface MouthConfig extends BaseDraggableImageConfig {
  name: "mouth";
  x: number;
  y: number;
}

interface AccessoryConfig extends BaseDraggableImageConfig {
  name: "accessory";
}

type SelectionRectangle =
  | {
      visible: false;
    }
  | {
      x: number;
      y: number;
      width: number;
      height: number;
      visible: true;
    };

const DIMENSION = 1100;

const useEye = (stageConfig: Ref<StageConfig>, eyeImgUrl: Ref<string>) => {
  const EYES_CENTER_X = 330;
  const EYES_CENTER_Y = 240;

  const eyesConfig = ref<EyesConfig | null>(null);

  const setEyes = () => {
    const eyeImg = new Image();
    eyeImg.src = eyeImgUrl.value;
    eyeImg.onload = () => {
      const {
        width: stageWidth,
        height: stageHeight,
        scale: stageScale,
      } = stageConfig.value;
      const scaleXFactor = stageWidth / eyeImg.naturalWidth;
      const scaleYFactor = stageHeight / eyeImg.naturalHeight;
      const scaleFactor = (scaleXFactor + scaleYFactor) / 2;

      eyesConfig.value = {
        name: "eyes",
        x: EYES_CENTER_X,
        y: EYES_CENTER_Y,
        scaleX: (scaleFactor * 0.3) / stageScale.x,
        scaleY: (scaleFactor * 0.3) / stageScale.y,
        image: eyeImg,
        draggable: true,
      };
    };
  };

  watchEffect(() => {
    setEyes();
  });

  return {
    eyesConfig,
  };
};

const useMouth = (stageConfig: Ref<StageConfig>, mouthImgUrl: Ref<string>) => {
  const MOUTH_CENTER_X = 330;
  const MOUTH_CENTER_Y = 500;

  const mouthConfig = ref<MouthConfig | null>(null);

  const setMouth = () => {
    const mouthImg = new Image();
    mouthImg.src = mouthImgUrl.value;

    mouthImg.onload = () => {
      const {
        width: stageWidth,
        height: stageHeight,
        scale: stageScale,
      } = stageConfig.value;
      const scaleXFactor = stageWidth / mouthImg.naturalWidth;
      const scaleYFactor = stageHeight / mouthImg.naturalHeight;
      const scaleFactor = (scaleXFactor + scaleYFactor) / 2;

      mouthConfig.value = {
        name: "mouth",
        x: MOUTH_CENTER_X,
        y: MOUTH_CENTER_Y,
        scaleX: (scaleFactor * 0.4) / stageScale.x,
        scaleY: (scaleFactor * 0.4) / stageScale.y,
        image: mouthImg,
        draggable: true,
      };
    };
  };

  watchEffect(() => {
    setMouth();
  });

  return {
    mouthConfig,
  };
};

const useAccessories = (stageConfig: Ref<StageConfig>) => {
  const ACCESSORY_CENTER_X = 350;
  const ACCESSORY_CENTER_Y = 400;

  const accessoriesConfigs = ref<AccessoryConfig[]>([]);

  const addAccessory = (accessoryImgUrl: string) => {
    const accessoryImg = new Image();
    accessoryImg.src = accessoryImgUrl!;

    accessoryImg.onload = () => {
      const {
        width: stageWidth,
        height: stageHeight,
        scale: stageScale,
      } = stageConfig.value;
      const scaleXFactor = stageWidth / accessoryImg.naturalWidth;
      const scaleYFactor = stageHeight / accessoryImg.naturalHeight;
      const scaleFactor = (scaleXFactor + scaleYFactor) / 2;

      accessoriesConfigs.value = [
        ...accessoriesConfigs.value,
        {
          name: "accessory",
          x: ACCESSORY_CENTER_X,
          y: ACCESSORY_CENTER_Y,
          scaleX: (scaleFactor * 0.2) / stageScale.x,
          scaleY: (scaleFactor * 0.2) / stageScale.y,
          image: accessoryImg,
          draggable: true,
        },
      ];
    };
  };

  return {
    accessoriesConfigs,
    addAccessory,
  };
};

const useTransformation = (
  stageRef: Ref<{ getStage: () => Konva.Stage }>,
  transformerRef: Ref<{ getStage: () => Konva.Transformer }>
) => {
  const DRAGGABLE_NAMES = ["eyes", "mouth", "accessory"];

  const selectionRectangleConfig = ref<SelectionRectangle>({
    visible: false,
  });

  const selectedAccessoryNodes = ref<Konva.Node[]>([]);

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (
      DRAGGABLE_NAMES.includes(e.target.name()) ||
      e.target.hasName("_anchor") ||
      e.target.hasName("draggableChild")
    ) {
      return;
    }

    e.evt.preventDefault();

    const stage = stageRef.value.getStage();

    const pointerX = stage.getRelativePointerPosition().x;
    const pointerY = stage.getRelativePointerPosition().y;

    selectionRectangleConfig.value = {
      x: pointerX,
      y: pointerY,
      width: 0,
      height: 0,
      visible: true,
    };
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selectionRectangleConfig.value.visible) {
      return;
    }

    e.evt.preventDefault();

    const stage = stageRef.value.getStage();

    const pointerX = stage.getRelativePointerPosition().x;
    const pointerY = stage.getRelativePointerPosition().y;

    const { x, y } = selectionRectangleConfig.value;

    selectionRectangleConfig.value = {
      ...selectionRectangleConfig.value,
      width: pointerX - x,
      height: pointerY - y,
    };
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const selectionRectangle = selectionRectangleConfig.value;
    if (!selectionRectangle.visible) {
      return;
    }
    e.evt.preventDefault();

    const shapes = stageRef.value
      .getStage()
      .find((node: Konva.Node) => DRAGGABLE_NAMES.includes(node.name()));

    const selectionBox = stageRef.value
      .getStage()
      .findOne(".selection-rectangle")
      .getClientRect();
    const selectedNodes = shapes.filter((shape) =>
      Konva.Util.haveIntersection(selectionBox, shape.getClientRect())
    );

    const newSelectedAccessoryNodes = selectedNodes.filter(
      (node) => node.name() === "accessory"
    );
    selectedAccessoryNodes.value = newSelectedAccessoryNodes;

    transformerRef.value.getStage().nodes(selectedNodes);

    selectionRectangleConfig.value = { visible: false };
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectionRectangleConfig.value.visible) {
      return;
    }
    let element = e.target;

    const transformer = transformerRef.value.getStage();

    if (element === stageRef.value.getStage()) {
      transformer.nodes([]);
      return;
    }

    if (
      !DRAGGABLE_NAMES.includes(element.name()) &&
      !element.hasName("draggableChild")
    ) {
      return;
    }

    const activeElement: Konva.Node = element.hasName("draggableChild")
      ? element.parent!
      : element;

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = transformer.nodes().indexOf(activeElement) >= 0;

    let selectedNodes: Konva.Node[] = [];

    if (!metaPressed && !isSelected) {
      selectedNodes = [activeElement];
    } else if (metaPressed && isSelected) {
      const nodes = transformer.nodes().slice();
      selectedNodes = nodes.splice(nodes.indexOf(activeElement), 1);
    } else if (metaPressed && !isSelected) {
      selectedNodes = transformer.nodes().concat([activeElement]);
    }

    const newSelectedAccessoryNodes = selectedNodes.filter(
      (node) => node.name() === "accessory"
    );
    selectedAccessoryNodes.value = newSelectedAccessoryNodes;

    transformer.nodes(selectedNodes);
  };

  const deleteSelectedNodes = () => {
    selectedAccessoryNodes.value.forEach((node) => {
      node.destroy();
    });

    transformerRef.value.getStage().nodes([]);
    selectedAccessoryNodes.value = [];
  };

  return {
    selectionRectangleConfig,
    selectedAccessoryNodes,
    deleteSelectedNodes,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleStageClick,
  };
};

const useBackgroundImage = (
  stageConfig: Ref<StageConfig>,
  backgroundImageUrl: Ref<string | null>
) => {
  const backgroundImageConfig = ref<BaseImageConfig | null>(null);

  // const cropBack = (src: string) => {
  //   return new Promise<string>((resolve) => {
  //     const canvas = document.createElement("canvas");
  //     canvas.height = DIMENSION;
  //     canvas.width = DIMENSION;
  //     const ctx = canvas.getContext("2d")!;
  //     ctx.fillStyle = "white";
  //     ctx.fillRect(0, 0, canvas.width, canvas.height);
  //     const img = new Image();
  //     img.onload = cropBack;
  //     img.src = src;
  //     function cropBack() {
  //       ctx.drawImage(img, 0, 0, DIMENSION, DIMENSION);
  //       resolve(canvas.toDataURL());
  //     }
  //   });
  // };

  watchEffect(() => {
    const imageUrl = backgroundImageUrl.value;

    if (imageUrl === null) {
      backgroundImageConfig.value = null;
      return;
    }

    const backImg = new Image();

    backImg.onload = () => {
      const {
        width: stageWidth,
        height: stageHeight,
        scale: stageScale,
      } = stageConfig.value;
      const scaleXFactor = stageWidth / backImg.naturalWidth;
      const scaleYFactor = stageHeight / backImg.naturalHeight;
      const scaleFactor = (scaleXFactor + scaleYFactor) / 2;

      backgroundImageConfig.value = {
        x: 0,
        y: 0,
        scaleX: scaleFactor / stageScale.x,
        scaleY: scaleFactor / stageScale.y,
        image: backImg,
      };
    };

    backImg.src = imageUrl;
  });

  return { backgroundImageConfig };
};

export default {
  name: "ConstructorCanvas",
  components: {
    PButton,
  },
  setup() {
    const { t } = useI18n();

    const canvasStore = useCanvasObjects();
    const { backgroundImage, backgroundColor, fillColor, eyesImg, mouthImg } =
      toRefs(canvasStore);

    const stage = ref<any>(null);
    const stageConfig = ref<StageConfig>({
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        x: 1,
        y: 1,
      },
    });

    const transformer = ref<any>(null);
    const {
      selectedAccessoryNodes,
      selectionRectangleConfig,
      deleteSelectedNodes,
      handleStageMouseDown,
      handleStageMouseMove,
      handleStageMouseUp,
      handleStageClick,
    } = useTransformation(stage, transformer);

    const hasItemsToDelete = computed(
      () => selectedAccessoryNodes.value.length > 0
    );

    const strokeConfig = computed(() => ({
      x: 250,
      y: 175,
      data: "M137.412 41.3783L137.413 41.3784C137.758 41.592 138.198 41.6842 138.583 41.4517C138.957 41.2254 139.094 40.8009 139.094 40.3971L139.094 40.3963C139.093 40.3829 139.079 40.2248 139.698 39.7847C140.315 39.347 141.421 38.7232 143.373 37.7445C147.263 35.793 154.4 32.4847 167.388 26.5134C187.497 17.2675 205.075 11.574 226.19 7.46687C236.734 5.41634 267.105 1.89731 282.125 0.988153C288.722 0.589284 296.573 0.395984 299.568 0.556351C302.596 0.718551 311.017 1.08867 318.281 1.37867C347.159 2.53235 393.208 11.9063 426.431 23.4016C462.542 35.8959 494.946 58.737 531.577 97.5662C582.207 151.236 606.046 182.591 617.602 210.616C628.774 237.711 635.278 263.045 639.25 294.965C640.173 302.379 640.563 316.373 640.461 330.52C640.36 344.666 639.766 358.915 638.732 366.838C636.819 381.497 632.118 405.547 629.27 415.262C628.22 418.84 624.186 433.018 620.304 446.767C599.079 521.947 581.7 569.286 557.8 617.036C537.272 658.05 529.113 670.332 502.863 699.754C486.763 717.8 477.195 726.554 467.693 731.991C449.377 742.471 430.607 747.694 394.229 752.385C387.307 753.278 368.4 753.809 348.76 753.912C329.129 754.016 308.829 753.692 299.136 752.885C269.422 750.41 258.935 748.296 231.25 739.203C202.491 729.757 190.646 724.936 166.63 712.907C118.409 688.754 85.6182 654.51 58.2507 599.68C26.8269 536.723 8.77222 471.073 1.92731 394.858C0.291588 376.639 0.149488 346.709 1.05605 318.862C1.50924 304.941 2.22423 291.549 3.14459 280.411C4.06596 269.26 5.19064 260.402 6.45528 255.529C7.81447 250.291 10.8035 237.007 13.0988 226.005C15.3928 215.01 18.7502 201.532 20.5552 196.06C24.6607 183.611 39.4747 148.273 45.8882 135.629L45.4423 135.403L45.8882 135.629C60.4696 106.88 79.4347 82.9666 102.1 64.7357C107.093 60.7195 113.286 56.1132 118.23 52.6386C120.703 50.9008 122.857 49.4505 124.389 48.4998C125.158 48.0224 125.756 47.6801 126.154 47.4895C126.235 47.4512 126.301 47.4217 126.355 47.3995C126.392 47.4231 126.431 47.4419 126.471 47.4559C126.659 47.523 126.835 47.4756 126.911 47.4523C127.094 47.396 127.303 47.2749 127.504 47.141C127.925 46.8603 128.484 46.4036 129.086 45.8429L128.745 45.4771L129.086 45.8429C129.649 45.3185 130.243 44.9065 130.736 44.6635C130.983 44.5413 131.188 44.4707 131.338 44.4429C131.44 44.424 131.487 44.4301 131.498 44.4317C131.858 44.6475 132.306 44.6878 132.664 44.3921C132.981 44.1299 133.094 43.7044 133.094 43.2951C133.094 43.2653 133.095 43.2374 133.096 43.2113C133.251 43.287 133.417 43.3141 133.57 43.3138C133.803 43.3134 134.043 43.2512 134.268 43.16C134.72 42.9767 135.21 42.6377 135.648 42.1996C136.005 41.8429 136.414 41.5832 136.772 41.4488C137.162 41.3026 137.363 41.3476 137.412 41.3783ZM126.534 47.3398C126.533 47.34 126.53 47.3406 126.525 47.3411C126.531 47.3398 126.534 47.3395 126.534 47.3398ZM132.594 43.2951C132.594 43.9691 132.212 44.2851 131.745 43.9971L137.675 40.9531C137.169 40.6401 136.098 41.0421 135.294 41.8461C134.49 42.6501 133.554 43.0291 133.213 42.6891C132.873 42.3481 132.594 42.6211 132.594 43.2951Z",
      stroke: "#3D290E",
      strokeWidth: 11,
      fill: fillColor.value,
      width: 12,
      height: 8,
    }));

    const { backgroundImageConfig } = useBackgroundImage(
      stageConfig,
      backgroundImage
    );
    const { eyesConfig } = useEye(stageConfig, eyesImg);
    const { mouthConfig } = useMouth(stageConfig, mouthImg);
    const { accessoriesConfigs, addAccessory } = useAccessories(stageConfig);

    accessoriesEventBus.on((event, payload) => {
      if (event === "add") {
        addAccessory(payload!);
      }
    });

    const toastService = useToast();
    const shareImage = async () => {
      const dataURL = stage.value.getNode().toDataURL({ pixelRatio: 3 });

      const blob = dataURLtoBlob(dataURL);
      const files = [new File([blob], "image.png", { type: blob.type })];
      const shareData = {
        title: "roflanSticker",
        files,
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(() => {});
      } else {
        navigator.clipboard
          // eslint-disable-next-line no-undef
          .write([new ClipboardItem({ [blob.type]: blob })])
          .then(() => {
            toastService.add({
              severity: "success",
              summary: t("app.success"),
              detail: t("app.share.copied"),
              life: 3000,
            });
          })
          .catch(() =>
            toastService.add({
              severity: "error",
              summary: t("app.error"),
              detail: t("app.share.unable"),
              life: 3000,
            })
          );
      }
    };

    const downloadImage = async () => {
      const dataURL = stage.value.getNode().toDataURL({ pixelRatio: 3 });

      const link = document.createElement("a");
      link.download = `sticker_${dayjs().format("YYYY_MM_DDTHH_mm_ss")}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      link.remove();
    };

    onMounted(() => {
      const stageEl = stage.value!.$el.parentElement.parentElement;
      const size = Math.min(stageEl.clientWidth, stageEl.clientHeight);

      stageConfig.value = {
        width: size,
        height: size,
        scale: { x: size / DIMENSION, y: size / DIMENSION },
      };

      watchEffect(() => {
        stage.value.getStage().container().style.backgroundColor =
          backgroundColor.value;
      });
    });

    return {
      stage,
      stageConfig,
      backgroundImageConfig,
      strokeConfig,
      eyesConfig,
      mouthConfig,
      transformer,
      hasItemsToDelete,
      selectionRectangleConfig,
      accessoriesConfigs,
      handleStageMouseDown,
      handleStageMouseMove,
      handleStageMouseUp,
      handleStageClick,
      deleteSelectedNodes,
      shareImage,
      downloadImage,
    };
  },
};
</script>

<template>
  <div class="relative shadow-lg relative">
    <v-stage
      class=""
      ref="stage"
      :config="stageConfig"
      @mousedown="handleStageMouseDown"
      @touchstart="handleStageMouseDown"
      @mousemove="handleStageMouseMove"
      @touchmove="handleStageMouseMove"
      @mouseup="handleStageMouseUp"
      @touchend="handleStageMouseUp"
      @click="handleStageClick"
      @tap="handleStageClick"
    >
      <v-layer>
        <v-image v-if="backgroundImageConfig" :config="backgroundImageConfig" />
      </v-layer>
      <v-layer ref="strokeLayer">
        <v-path :config="strokeConfig" />
      </v-layer>
      <v-layer ref="mainLayer">
        <v-image :config="eyesConfig" />
        <v-image :config="mouthConfig" />
        <v-image
          v-for="(accessoryConfig, idx) of accessoriesConfigs"
          :config="accessoryConfig"
          :key="idx"
        />
        <v-rect
          :config="{
            ...selectionRectangleConfig,
            fill: 'rgba(100,85,236,0.35)',
            name: 'selection-rectangle',
          }"
        />
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
    <PButton
      v-if="hasItemsToDelete"
      icon="pi pi-trash"
      class="absolute bottom-2 left-2 p-button-rounded p-button-danger"
      @click="deleteSelectedNodes"
    />
    <div class="flex gap-4 absolute bottom-2 right-2">
      <PButton
        icon="pi pi-download"
        class="p-button-rounded"
        @click="downloadImage"
      />
      <PButton
        icon="pi pi-share-alt"
        class="right-2 p-button-rounded"
        @click="shareImage"
      />
    </div>
  </div>
</template>
<style>
.canvas-container {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
}

.textarea {
  width: 100% !important;
  height: 100% !important;
  margin: 0;
  padding: 20px;
  position: absolute;
  top: 0;
  left: 0;
  border: none;
  resize: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: medium;
}
</style>
