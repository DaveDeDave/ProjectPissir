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
      .get(`/v1/admin/employee/${route.params.id}`)
      .then(res => {
        employee.id = res.data.id;
        employee.email = res.data.email;
        employee.name = res.data.name;
        employee.surname = res.data.surname;
        employee.birthDate = res.data.birthDate;
        employee.type = res.data.type;
        employee.active = res.data.active;
        employee.companyID = res.data.companyID
      })
      .catch(e => {
        handleError(e);
      });
  });

  const employee = reactive({});
</script>

<template>
  <div class="d-flex flex-column justify-center align-center bg-primary text-white h-100 p-2">
    <a-typography-title :level="2" class="text-white">{{ t("employeeData") }}</a-typography-title>
    <div>
      <a-typography-paragraph class="text-white">{{ t("form.id") }}: {{ employee.id }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.email") }}: {{ employee.email }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.name") }}: {{ employee.name }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.surname") }}: {{ employee.surname }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.birthDate") }}: {{ employee.birthDate }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.type") }}: {{ t(`user.${employee.type}`) }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.active") }}: {{ t(employee.active ? "yes" : "no") }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.companyID") }}: {{ employee.companyID }}</a-typography-paragraph>
    </div>
  </div>
</template>