<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/composables/useQuizStore'

const router = useRouter()
const store = useQuizStore()

onMounted(() => {
  store.init()
  // If no results, go back to home
  if (store.results.value.length === 0) {
    router.replace('/')
  }
})

function startNewQuiz() {
  store.setupQuiz('training')
  router.push('/quiz')
}

function retrainWrong() {
  if (store.setupRetrainWrong()) {
    router.push('/quiz')
  }
}
</script>

<template>
  <div class="container container-narrow">
    <div class="result-box" :class="{ passed: store.quizType.value === 'mock' ? store.hasPassed.value : true }">
      <div class="result-score">{{ store.percentage.value }}%</div>
      <div class="result-info">
        <p>{{ store.correctCount.value }} von {{ store.results.value.length }} richtig</p>
        <template v-if="store.quizType.value === 'mock'">
          <h2>{{ store.hasPassed.value ? 'Bestanden!' : 'Nicht bestanden' }}</h2>
          <p v-if="!store.hasPassed.value" class="result-hint">
            Mindestens 20 richtige Antworten erforderlich
          </p>
        </template>
        <h2 v-else>Abgeschlossen!</h2>
        <p v-if="store.quizType.value === 'timed' || store.quizType.value === 'mock'" class="result-time">
          Zeit: {{ store.formatTime(store.timerSeconds.value) }}
        </p>
      </div>
    </div>

    <div class="actions">
      <button @click="startNewQuiz" class="btn btn-primary">Nochmal üben</button>
      <button
        v-if="store.results.value.filter(r => !r.correct).length > 0"
        @click="retrainWrong"
        class="btn btn-warning"
      >
        Fehler wiederholen ({{ store.results.value.filter(r => !r.correct).length }})
      </button>
      <button @click="store.shareResults" class="btn btn-outline">
        📤 Teilen
      </button>
      <router-link to="/" class="btn btn-outline">Zum Menü</router-link>
    </div>

    <div class="card">
      <h3>Alle Antworten</h3>
      <div class="result-list">
        <div
          v-for="(r, idx) in store.results.value"
          :key="idx"
          class="result-item"
          :class="r.correct ? 'result-correct' : 'result-wrong'"
        >
          <div class="result-item-head">
            <span>#{{ idx + 1 }}</span>
            <span>{{ r.correct ? '✓' : '✗' }}</span>
          </div>
          <p class="result-item-q">{{ r.question.text }}</p>
          <p class="result-item-a">
            Deine Antwort: <span :class="{ wrong: !r.correct }">{{ r.selected.length > 0 ? r.selected.join(', ') : 'Keine' }}</span>
          </p>
          <p v-if="!r.correct" class="result-item-a">
            Richtig: <span class="correct">{{ r.question.correctAnswers.join(', ') }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
