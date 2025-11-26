<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/composables/useQuizStore'

const router = useRouter()
const store = useQuizStore()

onMounted(() => {
  store.init()
})

function startQuiz(type: 'training' | 'exam' | 'timed' | 'mock', useWrongOnly = false, useBookmarks = false, useSpacedRepetition = false) {
  if (store.setupQuiz(type, useWrongOnly, useBookmarks, useSpacedRepetition)) {
    router.push('/quiz')
  }
}
</script>

<template>
  <div class="container">
    <div class="hero">
      <h1>Hundehalter-Prüfung Training</h1>
      <p>Bereite dich optimal auf den Sachkundenachweis vor</p>
      <div v-if="store.currentStreak.value > 0" class="streak-badge">
        🔥 {{ store.currentStreak.value }} Tage Streak
      </div>
    </div>

    <!-- Quick Stats -->
    <div v-if="store.stats.value.totalQuestions > 0" class="stats-bar">
      <div class="stat-box">
        <span class="stat-num">{{ store.stats.value.totalSessions }}</span>
        <span class="stat-txt">Übungen</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">{{ store.stats.value.totalQuestions }}</span>
        <span class="stat-txt">Fragen</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">{{ store.overallPercentage.value }}%</span>
        <span class="stat-txt">Richtig</span>
      </div>
    </div>

    <!-- Settings -->
    <div class="card">
      <div class="form-group">
        <label class="label">Anzahl Fragen</label>
        <select v-model="store.questionCount.value" class="select">
          <option :value="10">10 Fragen</option>
          <option :value="20">20 Fragen</option>
          <option :value="30">30 Fragen</option>
          <option :value="50">50 Fragen</option>
          <option :value="store.questions.length">Alle ({{ store.questions.length }})</option>
        </select>
      </div>

      <div class="form-group">
        <div class="label-row">
          <label class="label">Kategorien</label>
          <div class="label-actions">
            <button @click="store.selectAllCategories" class="link-btn">Alle</button>
            <span>|</span>
            <button @click="store.deselectAllCategories" class="link-btn">Keine</button>
          </div>
        </div>
        <p class="hint">Keine Auswahl = alle Kategorien</p>
        <div class="chips">
          <label
            v-for="cat in store.categories"
            :key="cat.id"
            class="chip"
            :class="{ active: store.selectedCategories.value.includes(cat.id) }"
          >
            <input
              type="checkbox"
              :checked="store.selectedCategories.value.includes(cat.id)"
              @change="store.toggleCategory(cat.id)"
            />
            {{ cat.shortName }} ({{ store.getCategoryQuestionCount(cat.id) }})
          </label>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="actions">
      <button @click="startQuiz('training')" class="btn btn-primary btn-lg">
        <strong>Training starten</strong>
        <small>Sofortiges Feedback</small>
      </button>
      <button @click="startQuiz('training', false, false, true)" class="btn btn-secondary btn-lg">
        <strong>Smart Training</strong>
        <small>Optimierte Wiederholung</small>
      </button>
    </div>

    <div class="actions">
      <button @click="startQuiz('exam')" class="btn btn-outline btn-lg">
        <strong>Prüfungsmodus</strong>
        <small>Auswertung am Ende</small>
      </button>
      <button @click="startQuiz('timed')" class="btn btn-outline btn-lg">
        <strong>Zeitprüfung</strong>
        <small>Mit Countdown</small>
      </button>
    </div>

    <!-- Mock Exam -->
    <div class="card card-highlight">
      <h3>🎓 Probeprüfung</h3>
      <p>Simuliere die echte Prüfung: 30 Fragen, 45 Minuten Zeit, mind. 20 richtige Antworten zum Bestehen.</p>
      <button @click="startQuiz('mock')" class="btn btn-primary">
        Probeprüfung starten
      </button>
    </div>

    <!-- Special Training Options -->
    <div class="training-options">
      <div v-if="store.wrongQuestions.value.length > 0" class="training-option" @click="startQuiz('training', true)">
        <span class="training-icon">❌</span>
        <div>
          <strong>Schwierige Fragen</strong>
          <small>{{ store.wrongQuestions.value.length }} Fragen üben</small>
        </div>
      </div>
      <div v-if="store.bookmarkedQuestions.value.length > 0" class="training-option" @click="startQuiz('training', false, true)">
        <span class="training-icon">⭐</span>
        <div>
          <strong>Markierte Fragen</strong>
          <small>{{ store.bookmarkedQuestions.value.length }} gespeichert</small>
        </div>
      </div>
    </div>
  </div>
</template>
