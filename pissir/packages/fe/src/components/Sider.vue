<script setup>
  import { ref, onBeforeMount } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRoute, useRouter } from "vue-router";
  import axios from "axios";

  import {
    UserOutlined,
    ShopOutlined,
    TeamOutlined,
    PictureOutlined,
    MenuFoldOutlined
  } from "@ant-design/icons-vue";
  import Icon from "@ant-design/icons-vue";

  import Header from "../components/Header.vue";

  import { getData } from '../libs/jwt';
  
  const emit = defineEmits(["closeDrawer"]);
  const props = defineProps({
    drawerVisible: {
      type: Boolean
    }
  });

  onBeforeMount(() => {
    const route = useRoute();
    if (route.path == "/dashboard/user") {
      currentTab.value[0] = 0; 
    } else if (route.path.startsWith("/dashboard/company")) {
      currentTab.value[0] = 1;
    } else if (route.path.startsWith("/dashboard/employee")) {
      currentTab.value[0] = 2;
    } else if (route.path.startsWith("/dashboard/field")) {
      currentTab.value[0] = 3;
    }
  });

  const { t } = useI18n();
  const router = useRouter();

  const emitCloseDrawer = () => {
    emit("closeDrawer");
  };

  const handleSelect = ({ key }) => {
    if (key == 0) {
      router.push("/dashboard/user");
    } else if (key == 1) {
      router.push("/dashboard/company");
    } else if (key == 2) {
      router.push("/dashboard/employee");
    } else if (key == 3) {
      router.push("/dashboard/field");
    }
    emitCloseDrawer();
  }

  const currentTab = ref([0]);
  const items = [
    {
      icon: UserOutlined,
      title: "menu.myUser"
    },
    {
      icon: ShopOutlined,
      title: "menu.myCompanies",
      admin: true
    },
    {
      icon: TeamOutlined,
      title: "menu.myEmployees",
      admin: true
    },
    {
      icon: PictureOutlined,
      title: "menu.myFields"
    },
  ];

  const logout = () => {
    axios.defaults.headers["Authorization"] = "";
    localStorage.removeItem("token");
    emitCloseDrawer();
    router.push("/");
  };

  const jwt = localStorage.getItem("token");
  const data = getData(jwt);
</script>

<template>
  <a-layout-sider class="d-none d-block-md" collapsible>
    <a-menu v-model:selectedKeys="currentTab" @click="handleSelect">
      <template v-for="(item, key) in items">
        <a-menu-item v-if="data.type == 'admin' || !item.admin" :key="key" >
          <Icon :component="item.icon" />
          <span>{{ t(item.title) }}</span>
        </a-menu-item>
      </template>
    </a-menu>
  </a-layout-sider>
  <a-drawer
    :visible="props.drawerVisible"
    class="d-block d-none-md"
    :bodyStyle="{ padding: 0 }"
    width="100%"
    :closable="false"
    placement="left"
  >
    <Header>
      <a-button @click="emitCloseDrawer"><menu-fold-outlined /></a-button>
    </Header>
    <div class="d-flex flex-column gap-1 p-2">
      <a-menu v-model:selectedKeys="currentTab" @click="handleSelect">
        <template v-for="(item, key) in items">
          <a-menu-item v-if="data.type == 'admin' || !item.admin" :key="key" >
            <Icon :component="item.icon" />
            <span>{{ t(item.title) }}</span>
          </a-menu-item>
        </template>
      </a-menu>
      <a-button @click="logout">{{ t("logout") }}</a-button>
    </div>
  </a-drawer>
</template>