<script setup>
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import * as yup from "yup";

  const emit = defineEmits(["updateField"]);
  const props = defineProps({
    name: { type: String },
    address: { type: String },
    outdoor: { type: Boolean }
  });

  const schema = yup.object().shape({
    name: yup.string().required({ key: "name", error: "form.error.nameRequired" })
  });

  const { t } = useI18n();

  const emitUpdateField = () => {
    loading.value = true;
    schema
      .validate({
        name: name.value,
      }, { abortEarly: false })
      .then((body) => {
        Object.keys(errors).forEach(key => delete errors[key]);
        body.outdoor = outdoor.value;
        body.address = address.value;
        emit('updateField', body, loading);
      })
      .catch((e) => {
        loading.value = false;
        Object.keys(errors).forEach(key => delete errors[key]);
        e.errors.forEach(({ key, error }) => errors[key] = error);
      });
  };

  const name = ref(props.name);
  const address = ref(props.address);
  const outdoor = ref(props.outdoor);
  const loading = ref(false);
  const errors = reactive({});
</script>

<template>
  <div class="d-flex flex-column gap-1">
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.name") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="name" :placeholder="t('form.name')" />
    <a-typography-paragraph v-if="errors.name" class="m-0 text-fourth" :content="t(errors.name)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.address") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="address" :placeholder="t('form.address')" />
    <a-checkbox v-model:checked="outdoor">{{ t("form.outdoor") }}</a-checkbox>
    <a-button class="radius-1 mt-1" :loading="loading" @click="emitUpdateField">{{ t("form.update") }}</a-button>
  </div>
</template>