<script setup>
  import { useI18n } from "vue-i18n";
  import { useRouter } from "vue-router";

  const { t } = useI18n();
  const router = useRouter();

  const navigateHome = () => {
    router.push("/");
  }
</script>

<template>
  <div class="d-flex justify-center align-center h-100">
    <a-result status="404" title="404" :sub-title="t('notFound')">
      <template #extra>
        <a-button @click="navigateHome">{{ t("backHome") }}</a-button>
      </template>
    </a-result>
  </div>
</template>