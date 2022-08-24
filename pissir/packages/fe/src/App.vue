<script setup>
  import { ref, onBeforeMount } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRoute, useRouter } from "vue-router";
  import axios from "axios";

  import Header from "./components/Header.vue";
  import Footer from "./components/Footer.vue";
  import LocaleChanger from "./components/LocaleChanger.vue";
  import Sider from "./components/Sider.vue";

  import {
    MenuUnfoldOutlined
  } from "@ant-design/icons-vue";

  const { t, locale } = useI18n();
  const router = useRouter();
  const route = useRoute();

  onBeforeMount(() => {
    const lang = localStorage.getItem("locale");
    if (lang) locale.value = lang;
    else locale.value = navigator.language.slice(0, 2);
    const jwt = localStorage.getItem("token");
    if (jwt) axios.defaults.headers["Authorization"] = `Bearer ${jwt}`;
  });

  const logout = () => {
    axios.defaults.headers["Authorization"] = "";
    localStorage.removeItem("token");
    router.push("/");
  };

  const openDrawer = () => {
    drawerVisible.value = true;
  };

  const closeDrawer = () => {
    drawerVisible.value = false;
  };

  const drawerVisible = ref(false);
</script>

<template>
  <div class="d-flex flex-column h-100">
    <Header>
      <div v-if="route.path.startsWith('/dashboard') && route.name != '404'">
        <a-button class="d-none d-block-md" @click="logout">{{ t("logout") }}</a-button>
        <a-button class="d-block d-none-md" @click="openDrawer"><menu-unfold-outlined /></a-button>
      </div>
    </Header>
    <div class="d-flex flex-row flex-1">
      <Sider v-if="route.path.startsWith('/dashboard') && route.name != '404'" @closeDrawer="closeDrawer" :drawerVisible="drawerVisible" />
      <a-layout class="bg-white overflow-x-auto">
        <a-layout-content>
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </div>
    <Footer>
      <LocaleChanger />
    </Footer>
  </div>
</template>