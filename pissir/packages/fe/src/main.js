import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import messages from "@intlify/vite-plugin-vue-i18n/messages";

import App from "./App.vue";
import { router } from "./router";
import 'ant-design-vue/dist/antd.css';
import "./style.css";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages
});

createApp(App)
  .use(router)
  .use(i18n)
  .mount('#app');