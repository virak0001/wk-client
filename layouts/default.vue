<script setup lang="ts">
const menus = [
  {
    link: "/users",
    title: "User",
  },
  {
    link: "/books",
    title: "Book",
  },
  {
    link: "/borrow-records",
    title: "Borrow Record",
  },
];
</script>
<template>
  <div class="bg-slate-200 h-full">
    <div
      class="bg-white h-16 flex justify-center items-center gap-10 text-slate-800 mb-5"
    >
      <UIcon class="text-2xl text-blue-800" name="i-heroicons-book-open" />
      <NuxtLink
        v-for="(menu, index) in menus"
        :to="menu.link"
        :key="index"
        class="hover:text-blue-600"
        >{{ menu.title }}</NuxtLink
      >
    </div>
    <UContainer class="pa-10">
        <slot />
    </UContainer>
  </div>
</template>
