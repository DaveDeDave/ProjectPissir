<script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { useI18n } from "vue-i18n";
  import axios from "axios";

  import LoginForm from "../components/forms/LoginForm.vue";
  import RegistrationForm from "../components/forms/RegistrationForm.vue";
  import ActivateAccountForm from "../components/forms/ActivateAccountForm.vue";

  import { useHandleError } from "../libs/hooks";
  
  const { t } = useI18n();
  const router = useRouter();
  const handleError = useHandleError();

  const tabs = [
    { component: LoginForm, title: "form.login" },
    { component: RegistrationForm, title: "form.registration" },
    { component: ActivateAccountForm, title: "form.activation" }
  ];
  const currentTab = ref(0);

  const login = (body, loading) => {
    axios
      .post("/v1/auth/login", body)
      .then(res => {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers["Authorization"] = `Bearer ${res.data.token}`;
        router.push("/dashboard/user");
      })
      .catch(e => {
        loading.value = false;
        handleError(e);
      });
  };

  const register = (body, loading) => {
    axios
      .post("/v1/auth/register", body)
      .then(res => {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers["Authorization"] = `Bearer ${res.data.token}`;
        router.push("/dashboard/user");
      })
      .catch(e => {
        loading.value = false;
        handleError(e);
      });
  };

  const activate = (body, loading) => {
    axios
      .post("/v1/auth/activate", body)
      .then(res => {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers["Authorization"] = `Bearer ${res.data.token}`;
        router.push("/dashboard/user");
      })
      .catch(e => {
        loading.value = false;
        handleError(e);
      });
  };
</script>

<template>
  <div class="d-flex flex-column justify-center h-100">
    <div class="flex-1"></div>
    <div class="d-flex flex-column flex-8">
      <div class="d-flex flex-column justify-end align-center auth-tabs">
        <a-tabs v-model:activeKey="currentTab" type="card">
          <a-tab-pane v-for="(tab, key) in tabs" :key="key" :tab="t(tab.title)" />
        </a-tabs>
      </div>
      <div class="d-flex flex-1 justify-center mx-1 mb-1 radius-1 bg-primary">
        <component @login="login" @register="register" @activate="activate" :is="tabs[currentTab].component"></component>
      </div>
    </div>
    <div class="flex-1"></div>
  </div>
</template>