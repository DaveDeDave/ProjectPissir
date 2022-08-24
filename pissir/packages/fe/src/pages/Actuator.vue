<script setup>
  import { ref, reactive, onBeforeMount, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useHandleError } from '../libs/hooks';
  import axios from "axios";

  import ConfigurationForm from '../components/forms/ConfigurationForm.vue';
  const route = useRoute();
  const { t } = useI18n();
  const handleError = useHandleError();

  const jwt = localStorage.getItem("token");

  const ws = new WebSocket(`${location.protocol == "https:" ? "wss" : "ws"}://${location.host}/ws/?fieldID=${route.params.id}&topic=${route.params.topic}&authorization=${jwt}`);

  ws.onopen = () => {
    setTimeout(() => {
      forceRefresh();
    }, 100);
  }

  ws.onmessage = (message) => {
    value.value = message.data
  };

  ws.onerror = (e) => {
    handleError(e);
  };

  onBeforeMount(() => {
    axios
      .get(`/v1/mosquito/configuration/${route.params.id}/${route.params.topic}`)
      .then(res => {
        configuration.data = res.data;
      });
  });

  onUnmounted(() => {
    ws.close();
  });

  const createConfiguration = (body, loading) => {
    body.fieldID = route.params.id;
    body.actuatorTopic = route.params.topic;
    axios
      .post("/v1/mosquito/configuration", body)
      .then(_ => {
        configuration.data = body;
        hideModal();
      })
      .catch(e => handleError(e))
      .finally(() => loading.value = false);
  };

  const updateConfiguration = (body, loading) => {
    body.fieldID = route.params.id;
    body.actuatorTopic = route.params.topic;
    axios
      .put("/v1/mosquito/configuration", body)
      .then(_ => {
        configuration.data = body;
        hideModal();
      })
      .catch(e => handleError(e))
      .finally(() => loading.value = false);
  };

  const deleteConfiguration = () => {
    deleteLoading.value = true;
    axios
      .delete("/v1/mosquito/configuration", {
        data: {
          fieldID: route.params.id,
          actuatorTopic: route.params.topic
        }
      })
      .then(_ => {
        delete configuration.data;
      })
      .catch(e =>  handleError(e))
      .finally(() => deleteLoading.value = false);
  };

  const forceRefresh = () => {
    ws.send("forceRefresh");
  };

  const updateValue = () => {
    axios
      .post("/v1/mosquito/actuator/state", {
          fieldID: route.params.id,
          topic: route.params.topic,
          value: editValue.value
      })
      .catch(e => handleError(e));
  };

  const setToAuto = () => {
        axios
      .post("/v1/mosquito/actuator/state", {
          fieldID: route.params.id,
          topic: route.params.topic,
          auto: true
      })
      .catch(e => handleError(e));
  };

  const showModal = () => {
    modalVisible.value = true;
  };

  const hideModal = () => {
    modalVisible.value = false;
  };

  const configuration = reactive({});
  const modalVisible = ref(false);
  const deleteLoading = ref(false);
  const value = ref("");
  const editValue = ref("");
</script>

<template>
  <div class="d-flex flex-column bg-primary text-white h-100 p-2 gap-1">
    <div>
      <router-link :to="`/dashboard/field/${route.params.id}`"><a-button>{{ t("back") }}</a-button></router-link>
    </div>
    <div>
      <a-typography class="text-white">{{ t("form.fieldID") }} {{ route.params.id }}</a-typography>
      <a-typography class="text-white">{{ t("form.topic") }} {{ route.params.topic }}</a-typography>
    </div>
    <div class="d-flex gap-1">
      <a-button v-if="!configuration.data" @click="showModal">{{ t("form.createConfiguration") }}</a-button>
      <a-button v-if="configuration.data" @click="showModal">{{ t("form.updateConfiguration") }}</a-button>
      <a-button v-if="configuration.data" :loading="deleteLoading" @click="deleteConfiguration">{{ t("form.deleteConfiguration") }}</a-button>
    </div>
    <div class="d-flex flex-column  gap-1">
      <div class="d-flex flex-column gap-1">
        <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("actuatorState") }}</a-typography-paragraph>
        <a-input class="radius-1" readonly v-model:value="value" />
        <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("editActuatorState") }}</a-typography-paragraph>
        <a-input class="radius-1" v-model:value="editValue" />
        <a-button class="radius-1 mt-1" @click="forceRefresh">{{ t("forceRefresh") }}</a-button>
        <a-button class="radius-1 mt-1" @click="updateValue">{{ t("form.update") }}</a-button>
        <a-button class="radius-1 mt-1" @click="setToAuto">{{ t("form.auto") }}</a-button>
      </div>
    </div>
    <a-modal :destroyOnClose="true" v-model:visible="modalVisible" :title="t('form.configuration')" :footer="null">
      <ConfigurationForm v-if="!configuration.data" :fieldID="route.params.id" @createConfiguration="createConfiguration" />
      <ConfigurationForm
        v-if="configuration.data"
        :fieldID="route.params.id"
        :sensorTopic="configuration.data.sensorTopic"
        :conditionType="configuration.data.conditionType"
        :conditionValue="configuration.data.conditionValue"
        :conditionFalse="configuration.data.conditionFalse"
        :conditionTrue="configuration.data.conditionTrue"
        :startTime="configuration.data.startTime"
        :endTime="configuration.data.endTime"
        @createConfiguration="updateConfiguration"
      />
    </a-modal>
  </div>
</template>