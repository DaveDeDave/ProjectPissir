<script setup>
  import { ref, reactive, onBeforeMount } from "vue";
  import axios from "axios";
  import { useI18n } from "vue-i18n";
  import * as yup from "yup";
  import it from 'ant-design-vue/es/date-picker/locale/it_IT';
  import en from 'ant-design-vue/es/date-picker/locale/en_US';
  import { useHandleError } from "../../libs/hooks";

  const emit = defineEmits(["createEmployee"]);

  const schema = yup.object().shape({
    companyID: yup.string().required({ key: "companyID", error: "form.error.companyIDRequired" }),
    email: yup.string().required({ key: "email", error: "form.error.emailFormat" }).email({ key: "email", error: "form.error.emailFormat" }),
    name: yup.string().required({ key: "name", error: "form.error.nameRequired" }),
    surname: yup.string().required({ key: "surname", error: "form.error.surnameRequired" }),
    birthDate: yup.string().test(
      "date check",
      { key: "birthDate", error: "form.error.birthDateInvalid" },
      (birthDate) => {
        const inputDate = new Date(birthDate);
        if (inputDate == "Invalid Date") return false;
        let maxYear = new Date();
        maxYear.setFullYear(maxYear.getFullYear() - 18);
        return inputDate <= maxYear;
      }
    ).required({ key: "birthDate", error: "form.error.birthDateRequired" })
  });

  const { t, locale } = useI18n();
  const handleError = useHandleError();

  const emitCreateEmployee = () => {
    loading.value = true;
    schema
      .validate({
        companyID: companyID.value,
        email: email.value,
        name: name.value,
        surname: surname.value,
        birthDate: birthDate.value
      }, { abortEarly: false })
      .then((body) => {
        Object.keys(errors).forEach(key => delete errors[key]);
        body.birthDate = new Date(body.birthDate).toISOString().slice(0, 10);
        delete body.passwordCheck;
        body.type = type.value;
        emit('createEmployee', body, loading);
      })
      .catch((e) => {
        loading.value = false;
        Object.keys(errors).forEach(key => delete errors[key]);
        e.errors.forEach(({ key, error }) => errors[key] = error);
      });
  };

  onBeforeMount(() => {
    axios
      .get("/v1/admin/company/all?page=1&quantity=100")
      .then(res => {
        companies.push(...res.data.result);
      })
      .catch(e => {
        handleError(e);
      });
  });

  const companies = reactive([]);

  const type = ref("farmer");
  const companyID = ref("");
  const email = ref("");
  const name = ref("");
  const surname = ref("");
  const birthDate = ref("");
  const loading = ref(false);
  const errors = reactive({});
</script>

<template>
  <div class="d-flex flex-column gap-1">
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.type") }}</a-typography-paragraph>
    <a-select v-model:value="type">
      <a-select-option value="farmer">{{ t("user.farmer") }}</a-select-option>
      <a-select-option value="collaborator">{{ t("user.collaborator") }}</a-select-option>
    </a-select>
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.company") }}</a-typography-paragraph>
    <a-select v-model:value="companyID">
      <a-select-option v-for="company in companies" :value="company.id" >{{ company.name }} ({{ company.id }})</a-select-option>
    </a-select>
    <a-typography-paragraph v-if="errors.companyID" class="m-0 text-fourth" :content="t(errors.companyID)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.email") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="email" :placeholder="t('form.email')" />
    <a-typography-paragraph v-if="errors.email" class="m-0 text-fourth" :content="t(errors.email)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.name") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="name" :placeholder="t('form.name')" />
    <a-typography-paragraph v-if="errors.name" class="m-0 text-fourth" :content="t(errors.name)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.surname") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="surname" :placeholder="t('form.surname')" />
    <a-typography-paragraph v-if="errors.surname" class="m-0 text-fourth" :content="t(errors.surname)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.birthDate") }}</a-typography-paragraph>
    <a-date-picker v-model:value="birthDate" :locale="locale == 'it' ? it : en" />
    <a-typography-paragraph v-if="errors.birthDate" class="m-0 text-fourth" :content="t(errors.birthDate)" />
    <a-button class="radius-1 mt-1" :loading="loading" @click="emitCreateEmployee">{{ t("form.create") }}</a-button>
  </div>
</template>