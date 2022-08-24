import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      include: "src/locales/**",
    }),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    Icons({ autoInstall: true, compiler: "vue3" })
  ],
  server: {
    proxy: {
      "/v1": {
        target:"https://localhost:8443",
        secure: false,
        changeOrigin: true
      },
      "/ws/": {
        target:"https://localhost:8443",
        ws: true,
        secure: false,
        changeOrigin: true
      }
    }
  },
  publicDir: "src/assets"
});