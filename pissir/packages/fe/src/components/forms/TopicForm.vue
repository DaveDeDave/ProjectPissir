<script setup>
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import * as yup from "yup";

  const emit = defineEmits(["addTopic"]);

  const schema = yup.object().shape({
    topic: yup.string().required({ key: "topic", error: "form.error.topicRequired" })
  });

  const { t } = useI18n();

  const emitAddTopic = () => {
    loading.value = true;
    schema
      .validate({
        topic: topic.value
      }, { abortEarly: false })
      .then((body) => {
        Object.keys(errors).forEach(key => delete errors[key]);
        emit('addTopic', body, loading);
      })
      .catch((e) => {
        loading.value = false;
        Object.keys(errors).forEach(key => delete errors[key]);
        e.errors.forEach(({ key, error }) => errors[key] = error);
      });
  }

  const topic = ref("");
  const loading = ref(false);
  const errors = reactive({});
</script>

<template>
  <div class="d-flex flex-column gap-1">
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.topic") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="topic" :placeholder="t('form.topic')" />
    <a-typography-paragraph v-if="errors.topic" class="m-0 text-fourth" :content="t(errors.topic)" />
    <a-button class="radius-1 mt-1" :loading="loading" @click="emitAddTopic">{{ t("form.add") }}</a-button>
  </div>
</template>