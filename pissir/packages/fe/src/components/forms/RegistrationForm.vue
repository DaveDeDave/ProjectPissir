<script setup>
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import * as yup from "yup";
  import it from 'ant-design-vue/es/date-picker/locale/it_IT';
  import en from 'ant-design-vue/es/date-picker/locale/en_US';
  import { passwordRegex } from "../../libs/regex";

  const { t, locale } = useI18n();

  const emit = defineEmits(["register"]);

  const schema = yup.object().shape({
    email: yup.string().required({ key: "email", error: "form.error.emailFormat" }).email({ key: "email", error: "form.error.emailFormat" }),
    password: yup.string().test(
      "length check",
      { key: "password", error: "form.error.passwordComplexity" },
      (password) => passwordRegex.test(password)
    ).required({ key: "password", error: "form.error.passwordComplexity" }),
    passwordCheck: yup.string().when(
      ["password"],
      (password, schema) => {
        return schema.test({
          test: (passwordCheck) => password == passwordCheck,
          message: { key: "passwordCheck", error: "form.error.passwordCheck" }
        });
      }
    ),
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

  const emitRegister = () => {
    schema
      .validate({
        email: email.value,
        password: password.value,
        passwordCheck: passwordCheck.value,
        name: name.value,
        surname: surname.value,
        birthDate: birthDate.value
      }, { abortEarly: false })
      .then((body) => {
        Object.keys(errors).forEach(key => delete errors[key]);
        body.birthDate = new Date(body.birthDate).toISOString().slice(0, 10);
        delete body.passwordCheck;
        emit('register', body, loading);
      })
      .catch((e) => {
        loading.value = false;
        Object.keys(errors).forEach(key => delete errors[key]);
        e.errors.forEach(({ key, error }) => errors[key] = error);
      });
  };

  const email = ref("");
  const password = ref("");
  const passwordCheck = ref("");
  const name = ref("");
  const surname = ref("");
  const birthDate = ref("");
  const loading = ref(false);
  const errors = reactive({});
</script>

<template>
  <div class="d-flex flex-column justify-center gap-1 p-2 w-100 w-50-md">
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.email") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="email" :placeholder="t('form.email')" />
    <a-typography-paragraph v-if="errors.email" class="m-0 text-fourth" :content="t(errors.email)" />
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.password") }}</a-typography-paragraph>
    <a-input-password class="radius-1" v-model:value="password" :placeholder="t('form.password')" />
    <a-typography-paragraph v-if="errors.password" class="m-0 text-fourth" :content="t(errors.password)" />
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.passwordCheck") }}</a-typography-paragraph>
    <a-input-password class="radius-1" v-model:value="passwordCheck" :placeholder="t('form.passwordCheck')" />
    <a-typography-paragraph v-if="errors.passwordCheck" class="m-0 text-fourth" :content="t(errors.passwordCheck)" />
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.name") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="name" :placeholder="t('form.name')" />
    <a-typography-paragraph v-if="errors.name" class="m-0 text-fourth" :content="t(errors.name)" />
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.surname") }}</a-typography-paragraph>
    <a-input class="radius-1" v-model:value="surname" :placeholder="t('form.surname')" />
    <a-typography-paragraph v-if="errors.surname" class="m-0 text-fourth" :content="t(errors.surname)" />
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.birthDate") }}</a-typography-paragraph>
    <a-date-picker v-model:value="birthDate" :locale="locale == 'it' ? it : en" />
    <a-typography-paragraph v-if="errors.birthDate" class="m-0 text-fourth" :content="t(errors.birthDate)" />
    <a-button class="radius-1 mt-1" :loading="loading" @click="emitRegister">{{ t("form.register") }}</a-button>
  </div>
</template>