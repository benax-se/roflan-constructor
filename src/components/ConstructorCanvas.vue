<script lang="ts">
import Konva from "konva";
import {
  onMounted,
  ref,
  watchEffect,
  toRefs,
  type Ref,
  computed,
  nextTick,
} from "vue";
import strokes from "@/assets/strokes/paths";
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
  const EYES_CENTER_X = 300;
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

const useStrokeConfig = (
  stageConfig: Ref<StageConfig>,
  strokeImgUrl: Ref<string>,
  fillColor: Ref<string>
) => {
  const stroke = computed(
    () => strokes[strokeImgUrl.value.split("/").pop()!.replace(".png", "")]
  );

  const strokeConfig = computed(() => {
    const { width: strokeWidth, height: strokeHeight, lineWidth } = stroke.value;
    const {
      width: stageWidth,
      height: stageHeight,
      scale: stageScale,
    } = stageConfig.value;

    const scaleXFactor = stageWidth / strokeWidth;
    const scaleYFactor = stageHeight / strokeHeight;
    const scaleFactor = Math.max(scaleXFactor, scaleYFactor);

    const scaleX = scaleFactor * 0.65 / stageScale.x
    const scaleY = scaleFactor * 0.65 / stageScale.y
    return {
      x: DIMENSION / 2 - strokeWidth* scaleX / 2,
      y: DIMENSION / 2 - strokeHeight * scaleY / 2,
      data: stroke.value.data,
      stroke: "#3D290E",
      strokeWidth: lineWidth,
      fill: fillColor.value,
      fillRule: "evenodd",
      scaleX: scaleX,
      scaleY: scaleY,
    };
  });

  return {
    strokeConfig,
  };
};

const useMouth = (stageConfig: Ref<StageConfig>, mouthImgUrl: Ref<string>) => {
  const MOUTH_DEFAULT_CENTER_X = 600;
  const MOUTH_DEFAULT_CENTER_Y = 725;

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
      const scaleFactor = Math.min(scaleXFactor, scaleYFactor);

      const mouthCenterX = MOUTH_DEFAULT_CENTER_X - mouthImg.naturalWidth / 2;
      const mouthCenterY = MOUTH_DEFAULT_CENTER_Y - mouthImg.naturalHeight / 2;

      mouthConfig.value = {
        name: "mouth",
        x: mouthCenterX,
        y: mouthCenterY,
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

const useBackgroundColorRect = (backgroundColor: Ref<string>) => {
  const backgroundColorRectConfig = computed(() => {
    return {
      x: 0,
      y: 0,
      width: DIMENSION,
      height: DIMENSION,
      fill: backgroundColor.value,
    };
  });

  return {
    backgroundColorRectConfig,
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
    const {
      backgroundImage,
      backgroundColor,
      fillColor,
      eyesImg,
      mouthImg,
      strokeImg,
    } = toRefs(canvasStore);

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

    const { strokeConfig } = useStrokeConfig(stageConfig, strokeImg, fillColor);

    const { backgroundImageConfig } = useBackgroundImage(
      stageConfig,
      backgroundImage
    );
    const { backgroundColorRectConfig } =
      useBackgroundColorRect(backgroundColor);
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
      nextTick().then(() => {
        const stageEl = stage.value!.$el.parentElement.parentElement;
        const size = Math.min(stageEl.clientWidth, stageEl.clientHeight);

        stageConfig.value = {
          width: size,
          height: size,
          scale: { x: size / DIMENSION, y: size / DIMENSION },
        };
      });
    });

    return {
      stage,
      stageConfig,
      backgroundColorRectConfig,
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
  <div class="relative shadow-xl">
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
        <v-rect :config="backgroundColorRectConfig" />
      </v-layer>
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
    <div class="flex gap-4 absolute bottom-1 -right-1">
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
