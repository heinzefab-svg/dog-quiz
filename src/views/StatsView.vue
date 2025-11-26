<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/composables/useQuizStore'

const router = useRouter()
const store = useQuizStore()

onMounted(() => {
  store.init()
})

function startWrongTraining() {
  if (store.setupQuiz('training', true)) {
    router.push('/quiz')
  }
}
</script>

<template>
  <div class="container">
    <h1 class="page-title">Deine Statistiken</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card-num">{{ store.stats.value.totalSessions }}</span>
        <span class="stat-card-label">Übungseinheiten</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-num">{{ store.stats.value.totalQuestions }}</span>
        <span class="stat-card-label">Beantwortete Fragen</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-num">{{ store.currentStreak.value }}</span>
        <span class="stat-card-label">🔥 Tage Streak</span>
      </div>
      <div class="stat-card stat-card-highlight">
        <span class="stat-card-num">{{ store.overallPercentage.value }}%</span>
        <span class="stat-card-label">Erfolgsquote</span>
      </div>
    </div>

    <div v-if="store.wrongQuestions.value.length > 0" class="alert alert-warning">
      <h3>Schwierige Fragen ({{ store.wrongQuestions.value.length }})</h3>
      <p>Diese Fragen wurden häufiger falsch beantwortet</p>
      <button @click="startWrongTraining" class="btn btn-warning">Jetzt trainieren</button>
    </div>

    <div v-if="store.mockExamHistory.value.length > 0" class="card">
      <h3>Probeprüfungen</h3>
      <div class="exam-history">
        <div
          v-for="(exam, idx) in store.mockExamHistory.value"
          :key="idx"
          class="exam-history-item"
          :class="{ passed: exam.passed }"
        >
          <div class="exam-history-date">
            {{ new Date(exam.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
          </div>
          <div class="exam-history-result">
            <strong>{{ exam.correct }}/{{ exam.total }}</strong>
            <span class="exam-history-status">{{ exam.passed ? 'Bestanden' : 'Nicht bestanden' }}</span>
          </div>
          <div class="exam-history-time">{{ store.formatTime(exam.timeSeconds) }}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Fortschritt nach Kategorien</h3>
      <p class="hint">Beherrschung: mind. 2x richtig beantwortet und mehr richtig als falsch</p>
      <div class="cat-stats">
        <div v-for="cat in store.categories" :key="cat.id" class="cat-stat">
          <div class="cat-stat-head">
            <span>{{ cat.name }}</span>
            <span class="cat-stat-count">{{ store.getCategoryProgress(cat.id).mastered }} / {{ store.getCategoryProgress(cat.id).total }} beherrscht</span>
          </div>
          <div class="cat-stat-bar">
            <div
              class="cat-stat-fill"
              :style="{ width: `${store.getCategoryProgress(cat.id).percentage}%` }"
            ></div>
          </div>
          <span class="cat-stat-pct">{{ store.getCategoryProgress(cat.id).percentage }}%</span>
        </div>
      </div>
    </div>

    <div class="actions actions-center">
      <button @click="store.resetStats" class="btn btn-danger-outline">Statistiken zurücksetzen</button>
      <router-link to="/" class="btn btn-outline">Zum Menü</router-link>
    </div>
  </div>
</template>
