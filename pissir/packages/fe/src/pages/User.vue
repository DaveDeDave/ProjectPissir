<script setup>
  import axios from "axios";
  import { useI18n } from "vue-i18n";
  import { message } from "ant-design-vue";

  import UserUpdateForm from "../components/forms/UserUpdateForm.vue";
  import PasswordUpdateForm from "../components/forms/PasswordUpdateForm.vue";
  import { useHandleError } from "../libs/hooks";
  import { useRouter } from "vue-router";

  const { t } = useI18n();
  const handleError = useHandleError();
  const router = useRouter();

  const updateUser = (body, loading) => {
    axios
      .patch("/v1/user", body)
      .then(_ => {
        loading.value = false;
        message.success(t("success"));
      })
      .catch(e => {
        loading.value = false;
        handleError(e);
      });
  };

  const updatePassword = (body, loading) => {
    axios
      .patch("/v1/user/password", body)
      .then(_ => {
        loading.value = false;
        message.success(t("success"));
      })
      .catch(e => {
        loading.value = false;
        handleError(e);
      })
  }

  const deleteUser = (loading) => {
    axios
      .delete("/v1/user")
      .then(_ => {
        axios.defaults.headers["Authorization"] = "";
        localStorage.removeItem("token");
        router.push("/");
      })
      .catch(e => {
        loading.value = false;
        handleError(e);
      })
  };
</script>

<template>
  <div class="d-flex flex-column flex-row-lg gap-1 justify-center bg-primary text-white p-2 h-100">
    <div class="d-flex flex-column justify-center align-center flex-1">
      <a-typography-paragraph class="text-white font-weight-500">{{ t("form.updateUserData") }}</a-typography-paragraph>
      <UserUpdateForm @updateUser="updateUser" @deleteUser="deleteUser" />
    </div>
    <div class="d-flex flex-column justify-center align-center flex-1">
      <a-typography-paragraph class="text-white font-weight-500">{{ t("form.updatePassword") }}</a-typography-paragraph>
      <PasswordUpdateForm @updatePassword="updatePassword" />
    </div>
  </div>
</template>