<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/composables/useQuizStore'

const router = useRouter()
const store = useQuizStore()
const imageZoomed = ref(false)

function openImageZoom() {
  imageZoomed.value = true
}

function closeImageZoom() {
  imageZoomed.value = false
}

onMounted(() => {
  store.init()
  // If no quiz is active, go back to home
  if (store.quizQuestions.value.length === 0) {
    router.replace('/')
  }
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e: KeyboardEvent) {
  if (imageZoomed.value) {
    if (e.key === 'Escape') {
      closeImageZoom()
    }
    return
  }

  if (store.modalVisible.value) {
    if (e.key === 'Enter') {
      store.closeModal(true)
    } else if (e.key === 'Escape') {
      store.closeModal(false)
    }
    return
  }

  if (!store.currentQuestion.value) return

  const optionKeys = Object.keys(store.currentQuestion.value.options)
  const key = e.key.toUpperCase()

  if (optionKeys.includes(key) && !store.showFeedback.value) {
    store.toggleAnswer(key)
  } else if (e.key === 'Enter' && store.selectedAnswers.value.length > 0) {
    if (store.showFeedback.value) {
      onGoToNext()
    } else {
      onCheckAnswer()
    }
  } else if (e.key === ' ' && store.showFeedback.value) {
    e.preventDefault()
    onGoToNext()
  }
}

function onCheckAnswer() {
  const finished = store.checkAnswer()
  if (finished) {
    router.push('/result')
  }
}

function onGoToNext() {
  const finished = store.goToNext()
  if (finished) {
    router.push('/result')
  }
}

function goBack() {
  store.showModal('Quiz beenden?', 'Möchtest du das Quiz wirklich abbrechen? Dein Fortschritt geht verloren.', true, () => {
    store.stopTimer()
    router.push('/')
  })
}
</script>

<template>
  <div v-if="store.currentQuestion.value" class="container container-narrow">
    <div class="quiz-header">
      <div class="progress">
        <div class="progress-bar" :style="{ width: `${(store.progress.value.current / store.progress.value.total) * 100}%` }"></div>
      </div>
      <div class="progress-info">
        <span>Frage {{ store.progress.value.current }} / {{ store.progress.value.total }}</span>
        <div class="progress-right">
          <span v-if="store.quizType.value === 'timed' || store.quizType.value === 'mock'" class="timer" :class="{ 'timer-warning': store.remainingTime.value < 300 }">
            ⏱️ {{ store.formatTime(store.remainingTime.value) }}
          </span>
          <span class="badge" :class="store.quizType.value">
            {{ store.quizType.value === 'training' ? 'Training' : store.quizType.value === 'mock' ? 'Probeprüfung' : store.quizType.value === 'timed' ? 'Zeitprüfung' : 'Prüfung' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Running Score -->
    <div v-if="store.quizType.value === 'training' && store.results.value.length > 0" class="score-row">
      <span class="score-good">{{ store.results.value.filter(r => r.correct).length }} richtig</span>
      <span class="score-bad">{{ store.results.value.filter(r => !r.correct).length }} falsch</span>
    </div>

    <!-- Question Card -->
    <div class="card">
      <div class="q-meta">
        <span class="q-category">{{ store.currentQuestion.value.category }}</span>
        <button
          @click="store.toggleBookmark(store.currentQuestion.value.id)"
          class="bookmark-btn"
          :class="{ active: store.isBookmarked(store.currentQuestion.value.id) }"
          :aria-label="store.isBookmarked(store.currentQuestion.value.id) ? 'Lesezeichen entfernen' : 'Lesezeichen hinzufügen'"
        >
          {{ store.isBookmarked(store.currentQuestion.value.id) ? '⭐' : '☆' }}
        </button>
      </div>

      <h2 class="q-text">{{ store.currentQuestion.value.text }}</h2>

      <div v-if="store.currentQuestion.value.image" class="q-image" @click="openImageZoom">
        <img
          :src="`data:${store.currentQuestion.value.image.mediaType};base64,${store.currentQuestion.value.image.data}`"
          :alt="store.currentQuestion.value.text"
          loading="lazy"
        />
        <span class="q-image-zoom-hint">Zum Vergrößern tippen</span>
      </div>

      <div class="options">
        <button
          v-for="(text, key) in store.currentQuestion.value.options"
          :key="key"
          class="option"
          :class="store.getOptionClass(String(key))"
          @click="store.toggleAnswer(String(key))"
          :disabled="store.showFeedback.value"
        >
          <span class="option-key">{{ key }}</span>
          <span class="option-text">{{ text }}</span>
          <span v-if="store.showFeedback.value && store.currentQuestion.value.correctAnswers.includes(String(key))" class="option-check">✓</span>
        </button>
      </div>

      <!-- Feedback -->
      <div v-if="store.showFeedback.value" class="feedback" :class="store.currentFeedbackCorrect.value ? 'feedback-correct' : 'feedback-wrong'">
        <span class="feedback-icon">{{ store.currentFeedbackCorrect.value ? '✓' : '✗' }}</span>
        <div>
          <strong>{{ store.currentFeedbackCorrect.value ? 'Richtig!' : 'Leider falsch' }}</strong>
          <p v-if="!store.currentFeedbackCorrect.value">
            Richtig: <strong>{{ store.currentQuestion.value.correctAnswers.join(', ') }}</strong>
          </p>
        </div>
      </div>

      <!-- Hint -->
      <div v-if="store.quizType.value === 'training' && !store.showFeedback.value && store.showHint.value" class="hint-box">
        Diese Frage hat <strong>{{ store.currentQuestion.value.correctAnswers.length }}</strong> richtige Antwort{{ store.currentQuestion.value.correctAnswers.length > 1 ? 'en' : '' }}.
      </div>

      <!-- Actions -->
      <div class="q-actions">
        <button
          v-if="store.quizType.value === 'training' && !store.showFeedback.value"
          @click="store.toggleHint"
          class="btn btn-ghost"
        >
          {{ store.showHint.value ? 'Hinweis ausblenden' : 'Hinweis' }}
        </button>
        <button
          v-if="!store.showFeedback.value"
          @click="onCheckAnswer"
          class="btn btn-primary"
          :disabled="store.selectedAnswers.value.length === 0"
        >
          {{ store.quizType.value === 'training' ? 'Prüfen' : (store.currentQuestionIndex.value === store.quizQuestions.value.length - 1 ? 'Auswertung' : 'Weiter') }}
        </button>
        <button
          v-else
          @click="onGoToNext"
          class="btn btn-primary"
        >
          {{ store.currentQuestionIndex.value === store.quizQuestions.value.length - 1 ? 'Zur Auswertung' : 'Weiter' }}
        </button>
      </div>
    </div>

    <!-- Image Zoom Modal -->
    <div v-if="imageZoomed && store.currentQuestion.value?.image" class="image-zoom-overlay" @click="closeImageZoom">
      <button class="image-zoom-close" @click="closeImageZoom" aria-label="Schließen">&times;</button>
      <img
        :src="`data:${store.currentQuestion.value.image.mediaType};base64,${store.currentQuestion.value.image.data}`"
        :alt="store.currentQuestion.value.text"
        class="image-zoom-img"
        @click.stop
      />
    </div>
  </div>
</template>
