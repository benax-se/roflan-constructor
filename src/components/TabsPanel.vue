<script lang="ts">
import { computed, ref } from "vue";
import TabMenu from "primevue/tabmenu";
import { useI18n } from "vue-i18n";
export default {
  name: "TabsPanel",
  components: {
    TabMenu,
  },
  setup() {
    const { t } = useI18n();

    const active = ref(1);
    const items = computed(() =>[
      {
        label: t("app.eyes"),
        to: "/",
        icon: "pi pi-eye",
      },
      {
        label: t("app.color"),
        to: "/color",
        icon: "pi pi-palette",
      },
      {
        label: t("app.mouth"),
        to: "/mouth",
        icon: "pi pi-user-minus",
      },
      {
        label: t("app.accessories"),
        to: "/accessories",
        icon: "pi pi-shopping-bag",
      },
      {
        label: t("app.background"),
        to: "/background",
        icon: "pi pi-image",
      },
      {
        label: t("app.settings"),
        to: "/settings",
        icon: "pi pi-cog",
      },
    ]);

    return {
      active,
      items,
    };
  },
};
</script>

<template>
  <div>
    <TabMenu v-model:active-index="active" :model="items" />
  </div>
</template>
