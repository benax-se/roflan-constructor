<script lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import TabMenu from "primevue/tabmenu";
import EyesPage from "@/views/EyesPage.vue";
import MouthPage from "@/views/MouthPage.vue";
import ColorPage from "@/views/ColorPage.vue";
import AccessoriesPage from "@/views/AccessoriesPage.vue";
import BackgroundPage from "@/views/BackgroundPage.vue";
import SettingsPage from "@/views/SettingsPage.vue";
import StrokesPage from "@/views/StrokesPage.vue";

export default {
  name: "TabsPanel",
  components: {
    TabMenu,
    EyesPage,
    MouthPage,
    ColorPage,
    AccessoriesPage,
    BackgroundPage,
    SettingsPage,
    StrokesPage,
  },
  setup() {
    const { t } = useI18n();

    const active = ref(0);
    const tabs = computed(() => [
      {
        label: t("app.stroke"),
        icon: "pi pi-user",
        component: "StrokesPage",
      },
      {
        label: t("app.eyes"),
        icon: "pi pi-eye",
        component: "EyesPage",
      },
      {
        label: t("app.mouth"),
        icon: "pi pi-user-minus",
        component: "MouthPage",
      },
      {
        label: t("app.color"),
        icon: "pi pi-palette",
        component: "ColorPage",
      },
      {
        label: t("app.accessories"),
        icon: "pi pi-shopping-bag",
        component: "AccessoriesPage",
      },
      {
        label: t("app.background"),
        icon: "pi pi-image",
        component: "BackgroundPage",
      },
      {
        label: t("app.settings"),
        icon: "pi pi-cog",
        component: "SettingsPage",
      },
    ]);

    const activeComponent = computed(() => tabs.value[active.value].component);

    return {
      active,
      tabs,
      activeComponent,
    };
  },
};
</script>

<template>
  <div class="h-full flex flex-col">
    <div>
      <TabMenu v-model:active-index="active" :model="tabs" />
    </div>
    <div class="p-4 h-full overflow-y-auto">
      <component :is="activeComponent" />
    </div>
  </div>
</template>
