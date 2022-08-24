<script setup>
  import { ref } from "vue";
  import { useRoute } from 'vue-router';
  import { useI18n } from "vue-i18n";
  import axios from "axios";

  import Table from './tables/Table.vue';
  import TopicForm from "./forms/TopicForm.vue";
  import { useHandleError } from "../libs/hooks";

  import {
    DeleteOutlined
  } from "@ant-design/icons-vue";
  
  const props = defineProps({
    topic: {
      type: String,
      required: true
    }
  });

  const route = useRoute();
  const handleError = useHandleError();
  const { t } = useI18n();

  const addTopic = (body, loading, fetch) => {
    body.fieldID = route.params.id;
    axios
      .post(`/v1/mosquito/${props.topic}`, body)
      .then(_ => {
        fetch();
        hideCreateModal();
      })
      .catch(e => handleError(e))
      .finally(() => loading.value = false);
  };

  const removeTopic = (key, topic, fieldID, fetch) => {
    deleteLoading.value = key;
    axios
      .delete(`/v1/mosquito/${props.topic}`, {
        data: {
          topic,
          fieldID
        }
      })
      .then(_ => {
        fetch();
      })
      .catch((e) => {
        handleError(e);
      })
      .finally(() => {
        deleteLoading.value = -1;
      });
  };

  const showCreateModal = () => {
    createModalVisible.value = true;
  };

  const hideCreateModal = () => {
    createModalVisible.value = false;
  };

  const createModalVisible = ref(false);
  const deleteLoading = ref(-1);
</script>

<template>
  <div class="d-flex flex-column gap-1 w-100">
    <Table
      :fetchUrl="`/v1/mosquito/${props.topic}/${route.params.id}/all`"
      :topicUrl="`/dashboard/field/${route.params.id}/${props.topic}`"
      :actions="true"
    >
      <template #buttons>
        <a-button @click="showCreateModal">{{ props.topic == "sensor" ? t("form.addSensor") : t("form.addActuator") }}</a-button>
      </template>
      <template #actions="{ fetch, record }">
        <a-button :loading="deleteLoading == record.key" @click="() => { removeTopic(record.key, record.topic, record.fieldID, fetch) }" class="mr-1"><delete-outlined /></a-button>
      </template>
      <template #modals="{ fetch }">
        <a-modal :destroyOnClose="true" v-model:visible="createModalVisible" :title="props.topic == 'sensor' ? t('form.addSensor') : t('form.addActuator')" :footer="null">
          <TopicForm @addTopic="(body, loading) => { addTopic(body, loading, fetch); }" />
        </a-modal>
      </template>
    </Table>
  </div>
</template>