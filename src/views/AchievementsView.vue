<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuizStore } from '@/composables/useQuizStore'

const store = useQuizStore()

onMounted(() => {
  store.init()
})
</script>

<template>
  <div class="container">
    <h1 class="page-title">Errungenschaften</h1>
    <p class="page-subtitle">{{ store.stats.value.achievements.length }} / {{ store.achievementDefs.length }} freigeschaltet</p>

    <div class="achievements-grid">
      <div
        v-for="achievement in store.achievementDefs"
        :key="achievement.id"
        class="achievement-card"
        :class="{ unlocked: store.stats.value.achievements.includes(achievement.id) }"
      >
        <span class="achievement-icon">{{ achievement.icon }}</span>
        <div class="achievement-info">
          <strong>{{ achievement.name }}</strong>
          <small>{{ achievement.desc }}</small>
        </div>
        <span v-if="store.stats.value.achievements.includes(achievement.id)" class="achievement-check">✓</span>
      </div>
    </div>

    <div class="actions actions-center">
      <router-link to="/" class="btn btn-outline">Zum Menü</router-link>
    </div>
  </div>
</template>
