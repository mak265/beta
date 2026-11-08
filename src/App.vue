<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <AdminPage v-if="isAdmin" />
      <AuraBetaPage v-else />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import AuraBetaPage from '../AuraBetaPage.vue'
import AdminPage from './AdminPage.vue'

const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'
</script>
