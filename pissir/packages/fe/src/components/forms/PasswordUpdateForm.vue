<script setup>
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import * as yup from "yup";

  const { t } = useI18n();

  const emit = defineEmits(["updatePassword"]);

  const schema = yup.object().shape({
    oldPassword: yup.string().required({ key: "oldPassword", error: "form.error.passwordRequired" }),
    newPassword: yup.string().test(
      "length check",
      { key: "newPassword", error: "form.error.passwordLength" },
      (password) => password.length >= 6
    ).required({ key: "newPassword", error: "form.error.passwordLength" }),
    newPasswordCheck: yup.string().when(
      ["newPassword"],
      (newPassword, schema) => {
        return schema.test({
          test: (newPasswordCheck) => newPassword == newPasswordCheck,
          message: { key: "newPasswordCheck", error: "form.error.passwordCheck" }
        });
      }
    )
  });

  const emitUpdatePassword = () => {
    loading.value = true;
    schema.validate({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
      newPasswordCheck: newPasswordCheck.value
    }, { abortEarly: false })
    .then((body) => {
      Object.keys(errors).forEach(key => delete errors[key]);
      emit('updatePassword', body, loading);
    })
    .catch((e) => {
      loading.value = false;
      Object.keys(errors).forEach(key => delete errors[key]);
      e.errors.forEach(({ key, error }) => errors[key] = error);
    });
  }

  const oldPassword = ref("");
  const newPassword = ref("");
  const newPasswordCheck = ref("");
  const loading = ref(false);
  const errors = reactive({});
</script>

<template>
  <div class="d-flex flex-column justify-center gap-1 p-2 w-100 w-50-md">
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.oldPassword") }}</a-typography-paragraph>
    <a-input-password class="radius-1" v-model:value="oldPassword" :placeholder="t('form.oldPassword')" />
    <a-typography-paragraph v-if="errors.oldPassword" class="m-0 text-fourth" :content="t(errors.oldPassword)" />
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.newPassword") }}</a-typography-paragraph>
    <a-input-password class="radius-1" v-model:value="newPassword" :placeholder="t('form.newPassword')" />
    <a-typography-paragraph v-if="errors.newPassword" class="m-0 text-fourth" :content="t(errors.newPassword)" />
    <a-typography-paragraph class="m-0 text-white font-weight-500">{{ t("form.newPasswordCheck") }}</a-typography-paragraph>
    <a-input-password class="radius-1" v-model:value="newPasswordCheck" :placeholder="t('form.newPasswordCheck')" />
    <a-typography-paragraph v-if="errors.newPasswordCheck" class="m-0 text-fourth" :content="t(errors.newPasswordCheck)" />
    <a-button class="radius-1 mt-1" :loading="loading" @click="emitUpdatePassword">{{ t("form.updatePassword") }}</a-button>
  </div>
</template>