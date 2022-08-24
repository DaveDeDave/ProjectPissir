<script setup>
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import * as yup from "yup";

  const { t } = useI18n();

  const emit = defineEmits(["login"]);

  const schema = yup.object().shape({
    email: yup.string().required({ key: "email", error: "form.error.emailFormat" }).email({ key: "email", error: "form.error.emailFormat" }),
    password: yup.string().required({ key: "password", error: "form.error.passwordRequired" })
  });

  const emitLogin = () => {
    loading.value = true;
    schema
      .validate({ email: email.value, password: password.value }, { abortEarly: false })
      .then((body) => {
        Object.keys(errors).forEach(key => delete errors[key]);
        emit('login', body, loading);
      })
      .catch((e) => {
        loading.value = false;
        Object.keys(errors).forEach(key => delete errors[key]);
        e.errors.forEach(({ key, error }) => errors[key] = error);
      });
  };

  const email = ref("");
  const password = ref("");
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
    <a-button class="radius-1 mt-1" :loading="loading" @click="emitLogin">{{ t("form.login") }}</a-button>
  </div>
</template>