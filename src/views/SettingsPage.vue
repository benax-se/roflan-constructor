<script lang="ts">
import PDropdown from "primevue/dropdown";
import { useI18n } from "vue-i18n";

export default {
  name: "SettingsPage",
  components: {
    PDropdown,
  },
  setup() {
    const { t, locale } = useI18n();

    const languageOptions = [
      {
        label: "Русский",
        value: "ru",
      },
      {
        label: "English",
        value: "rn",
      },
    ];

    return {
      t,
      locale,
      languageOptions,
    };
  },
};
</script>
<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap2">
      <span id="language">{{ t("app.language") }}</span>
      <PDropdown
        v-model="locale"
        :options="languageOptions"
        aria-labelledby="language"
        option-value="value"
        option-label="label"
        class="w-full"
      />
    </div>
    <div>Made by <a class="text-purple-600" href="https://github.com/benax-se" target="_blank">benax-se</a></div>
  </div>
</template>
