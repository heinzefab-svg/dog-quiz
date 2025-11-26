<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuizStore } from '@/composables/useQuizStore'

const store = useQuizStore()

onMounted(() => {
  store.init()
})
</script>

<template>
  <div class="container container-narrow">
    <h1 class="page-title">Einstellungen</h1>

    <div class="card">
      <h3>Spielfunktionen</h3>
      <div class="setting-row">
        <div class="setting-info">
          <strong>Errungenschaften</strong>
          <small>Achievements und Benachrichtigungen anzeigen</small>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" :checked="store.achievementsEnabled.value" @change="store.toggleAchievements">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="card">
      <h3>Daten verwalten</h3>
      <p class="hint">Vorsicht: Das Zurücksetzen kann nicht rückgängig gemacht werden.</p>
      <button @click="store.resetStats" class="btn btn-danger-outline">
        Alle Statistiken zurücksetzen
      </button>
    </div>

    <div class="actions actions-center">
      <router-link to="/" class="btn btn-outline">Zum Menü</router-link>
    </div>
  </div>
</template>
