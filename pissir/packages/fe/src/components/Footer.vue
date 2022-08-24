<script setup>
  import { useI18n } from "vue-i18n";
  const { t } = useI18n();
</script>

<template>
  <div class="d-flex flex-row justify-center align-center p-1">
    <div class="flex-1"></div>
    <div class="d-flex flex-1 justify-center">
      {{ t("project") }}
    </div>
    <div class="d-flex flex-1 justify-end">
      <slot></slot>
    </div>
  </div>
</template>