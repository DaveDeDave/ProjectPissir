<script setup>
  import { useI18n } from "vue-i18n";
  const { t, locale } = useI18n();
  
  const updateLocale = (value) => {
    if (value == "system") {
      locale.value = navigator.language.slice(0, 2);
      localStorage.removeItem("locale");
    } else {
      localStorage.setItem("locale", value);
    }
  };
  
  const countryToFlag = (country) => {
    return country
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
  }
</script>

<template>
  <div>
    <a-select v-model:value="locale" @change="updateLocale">
      <a-select-option value="system">⚙️ {{ t('system') }}</a-select-option>
      <a-select-option value="it">{{ countryToFlag("it") }} {{ t("italian") }}</a-select-option>
      <a-select-option value="en">{{ countryToFlag("us") }} {{ t('english') }}</a-select-option>
    </a-select>
  </div>
</template>