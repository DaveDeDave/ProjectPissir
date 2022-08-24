<script setup>
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import * as yup from "yup";

  const emit = defineEmits(["createAdminField"]);
  const props = defineProps({
    companies: {
      type: Object,
      default: []
    }
  });

  const schema = yup.object().shape({
    companyID: yup.string().required({ key: "companyID", error: "form.error.companyIDRequired" }),
    name: yup.string().required({ key: "name", error: "form.error.nameRequired" })
  });

  const { t } = useI18n();

  const emitCreateAdminField = () => {
    loading.value = true;
    schema
      .validate({
        name: name.value,
        companyID: companyID.value
      }, { abortEarly: false })
      .then((body) => {
        Object.keys(errors).forEach(key => delete errors[key]);
        body.outdoor = outdoor.value;
        body.address = address.value;
        emit('createAdminField', body, loading);
      })
      .catch((e) => {
        loading.value = false;
        Object.keys(errors).forEach(key => delete errors[key]);
        e.errors.forEach(({ key, error }) => errors[key] = error);
      });
  };

  const companyID = ref("");
  const name = ref("");
  const address = ref("");
  const outdoor = ref(false);
  const loading = ref(false);
  const errors = reactive({});
</script>

<template>
  <div class="d-flex flex-column gap-1">
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.company") }}</a-typography-paragraph>
    <a-select v-model:value="companyID">
      <a-select-option v-for="company in props.companies" :value="company.id">{{ company.name }}</a-select-option>
    </a-select>
    <a-typography-paragraph v-if="errors.companyID" class="m-0 text-fourth" :content="t(errors.companyID)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.name") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="name" :placeholder="t('form.name')" />
    <a-typography-paragraph v-if="errors.name" class="m-0 text-fourth" :content="t(errors.name)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.address") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="address" :placeholder="t('form.address')" />
    <a-checkbox v-model:checked="outdoor">{{ t("form.outdoor") }}</a-checkbox>
    <a-button class="radius-1 mt-1" :loading="loading" @click="emitCreateAdminField">{{ t("form.create") }}</a-button>
  </div>
</template>