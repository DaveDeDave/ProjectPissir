<script setup>
  import { ref, computed, onBeforeMount } from "vue";
  import { useI18n } from "vue-i18n";
  import { message } from "ant-design-vue";
  import axios from "axios";
  import * as yup from "yup";

  import { getData } from "../../libs/jwt";
  import { useHandleError } from "../../libs/hooks";

  const { t } = useI18n();
  const handleError = useHandleError();

  const emit = defineEmits(["updateUser", "deleteUser"]);

  onBeforeMount(() => {
    axios
      .get("/v1/user")
      .then(res => {
        name.value = res.data.name;
        surname.value = res.data.surname;
        birthDate.value = res.data.birthDate.slice(0, 10);
        show.value = true;
      })
      .catch(e => {
        handleError(e);
      })
  });

  const schema = yup.object().shape({
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

  const emitUpdateUser = () => {
    loading.value = true;
    schema
      .validate({
        name: name.value,
        surname: surname.value,
        birthDate: birthDate.value
      })
      .then((body) => {
        body.birthDate = new Date(body.birthDate).toISOString().slice(0, 10);
        emit("updateUser", body, loading);
      })
      .catch(((e) => {
        loading.value = false;
        message.error(t(e.errors[0].error));
      }))
  };

  const emitDeleteUser = () => {
    modalLoading.value = true;
    emit("deleteUser", modalLoading)
  };

  const showModal = () => {
    modalVisible.value = true;
  };

  const resetInput = () => {
    confirmCode.value = "";
  }

  const jwt = localStorage.getItem("token");
  const data = getData(jwt);

  const name = ref();
  const surname = ref();
  const birthDate = ref();
  const loading = ref(false);
  const show = ref(false);
  const modalVisible = ref(false);
  const modalLoading = ref(false);
  const confirmCode = ref("");
  const deleteButtonEnabled = computed(() => {
    return confirmCode.value != data.id;
  });
</script>

<template>
  <div v-if="show" class="d-flex flex-column justify-center p-2">
    <a-typography-paragraph class="text-white">{{ t("form.email") }}: {{ data.email }}</a-typography-paragraph>
    <a-typography-paragraph class="text-white">{{ t("form.type") }}: {{ t(`user.${data.type}`) }}</a-typography-paragraph>
    <a-typography-paragraph class="text-white">
      {{ t("form.name") }}: <a-typography-paragraph class="d-inline text-white" v-model:content="name" editable />
    </a-typography-paragraph>
    <a-typography-paragraph class="text-white">
      {{ t("form.surname") }}: <a-typography-paragraph class="d-inline text-white" v-model:content="surname" editable />
    </a-typography-paragraph>
    <a-typography-paragraph class="text-white">
      {{ t("form.birthDate") }}: <a-typography-paragraph class="d-inline text-white" v-model:content="birthDate" editable />
    </a-typography-paragraph>
    <div class="d-flex flex-row gap-1">
      <a-button @click="emitUpdateUser" :loading="loading">{{ t("form.update") }}</a-button>
      <a-button @click="showModal">{{ t("form.deleteAccount") }}</a-button>
    </div>
    <a-modal v-model:visible="modalVisible" @cancel="resetInput" :title="t('form.deleteAccount')" :footer="null">
      <a-typography-paragraph>{{ t("form.digitCodeConfirm", { code: data.id }) }}</a-typography-paragraph>
      <a-input class="radius-1 mb-2" v-model:value="confirmCode" />
      <a-button :disabled="deleteButtonEnabled" @click="emitDeleteUser">{{ t("form.confirm") }}</a-button>
    </a-modal>
  </div>
</template>