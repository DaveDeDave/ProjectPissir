<script setup>
  import { useRouter } from "vue-router";

  const router = useRouter();

  const home = () => {
    router.push('/');
  }
</script>

<template>
  <div class="d-flex flex-row align-center p-2">
    <div class="flex-1">
      <img class="cursor-pointer" @click="home" src="/logo.png" width="75" />
    </div>
    <div class="d-flex flex-1 justify-end">
      <slot></slot>
    </div>
  </div>
</template>