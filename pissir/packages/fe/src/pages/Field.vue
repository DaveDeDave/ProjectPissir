<script setup>
  import { ref, reactive, onBeforeMount } from "vue";
  import { useRoute } from "vue-router";
  import axios from "axios";
  import { useHandleError } from "../libs/hooks";
  import { useI18n } from "vue-i18n";

  import Topic from "../components/Topic.vue";
  import { getData } from "../libs/jwt";

  const { t } = useI18n();
  const route = useRoute();
  const handleError = useHandleError();

  const jwt = localStorage.getItem("token");
  const data = getData(jwt);

  onBeforeMount(() => {
    axios
      .get(`/v1/field/${route.params.id}`)
      .then(res => {
        field.id = res.data.id;
        field.name = res.data.name;
        field.outdoor = res.data.outdoor;
        field.address = res.data.address;
        field.companyID = res.data.companyID;
      })
      .catch(e => {
        handleError(e);
      });
  });

  const field = reactive({});
</script>

<template>
  <div class="d-flex flex-column justify-center align-center bg-primary text-white h-100 p-2 gap-1">
    <a-typography-title :level="2" class="text-white">{{ t("fieldData") }}</a-typography-title>
    <div>
      <a-typography-paragraph class="text-white">{{ t("form.id") }}: {{ field.id }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.name") }}: {{ field.name }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.outdoor") }}: {{ field.outdoor }}</a-typography-paragraph>
      <a-typography-paragraph class="text-white">{{ t("form.address") }}: {{ field.address }}</a-typography-paragraph>
      <a-typography-paragraph v-if="field.companyID" class="text-white">{{ t("form.companyID") }}: {{ field.companyID }}</a-typography-paragraph>
    </div>
    <Topic topic="sensor" />
    <Topic topic="actuator" />
  </div>
</template>