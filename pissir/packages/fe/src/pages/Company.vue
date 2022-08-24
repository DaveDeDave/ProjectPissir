<script setup>
  import { reactive, onBeforeMount } from "vue";
  import { useRoute } from "vue-router";
  import axios from "axios";
  import { useHandleError } from "../libs/hooks";
  import { useI18n } from "vue-i18n";

  const { t } = useI18n();
  const route = useRoute();
  const handleError = useHandleError();

  onBeforeMount(() => {
    axios
      .get(`/v1/admin/company/${route.params.id}`)
      .then(res => {
        company.id = res.data.id;
        company.name = res.data.name;
        company.address = res.data.address;
      })
      .catch(e => {
        handleError(e);
      });
  });

  const company = reactive({});
</script>

<template>
  <div class="d-flex flex-column justify-center align-center bg-primary text-white h-100 p-2">
    <a-typography-title :level="2" class="text-white">{{ t("companyData") }}</a-typography-title>
    <div>
      <a-typography-paragraph class="text-white">{{ t("form.id") }}: {{ company.id }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.name") }}: {{ company.name }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.address") }}: {{ company.address }}</a-typography-paragraph>
    </div>
  </div>
</template>