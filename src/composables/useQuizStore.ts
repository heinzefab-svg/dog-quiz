import { ref, computed, reactive } from 'vue'
import type { Question } from '@/data/questions'
import { questions, categories, getQuestionsByCategory, getRandomQuestions } from '@/data/questions'

export type QuizType = 'training' | 'exam' | 'timed' | 'mock'

export interface MockExamResult {
  date: string
  correct: number
  total: number
  passed: boolean
  timeSeconds: number
}

interface QuestionStats {
  correct: number
  wrong: number
  lastAnswered?: number
}

interface Stats {
  questions: { [id: number]: QuestionStats }
  totalSessions: number
  totalQuestions: number
  totalCorrect: number
  consecutiveCorrect: number
  maxConsecutiveCorrect: number
  practicedCategories: number[]
  achievements: string[]
  streakDays: string[]
  lastPracticeDate: string | null
}

// Achievement definitions
export const achievementDefs = [
  { id: 'first_quiz', name: 'Erste Schritte', desc: 'Erstes Quiz abgeschlossen', icon: '🎯' },
  { id: 'ten_quizzes', name: 'Übungsfleißig', desc: '10 Übungen absolviert', icon: '📚' },
  { id: 'fifty_quizzes', name: 'Experte', desc: '50 Übungen absolviert', icon: '🏆' },
  { id: 'hundred_questions', name: 'Hundert Fragen', desc: '100 Fragen beantwortet', icon: '💯' },
  { id: 'five_hundred_questions', name: 'Fragemeister', desc: '500 Fragen beantwortet', icon: '🌟' },
  { id: 'perfect_ten', name: 'Perfekte 10', desc: '10 richtige Antworten in Folge', icon: '✨' },
  { id: 'perfect_quiz', name: 'Fehlerfrei', desc: 'Quiz ohne Fehler bestanden', icon: '🎖️' },
  { id: 'all_categories', name: 'Allrounder', desc: 'Alle Kategorien geübt', icon: '🌈' },
  { id: 'streak_3', name: 'Dreitagestreak', desc: '3 Tage in Folge geübt', icon: '🔥' },
  { id: 'streak_7', name: 'Wochenstreak', desc: '7 Tage in Folge geübt', icon: '⚡' },
  { id: 'streak_30', name: 'Monatsstreak', desc: '30 Tage in Folge geübt', icon: '👑' },
  { id: 'mock_passed', name: 'Prüfungsreif', desc: 'Probeprüfung bestanden', icon: '📜' },
  { id: 'speed_demon', name: 'Schnelldenker', desc: 'Zeitprüfung mit >80% bestanden', icon: '⏱️' },
]

// Shared state
const stats = ref<Stats>({
  questions: {},
  totalSessions: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  consecutiveCorrect: 0,
  maxConsecutiveCorrect: 0,
  practicedCategories: [],
  achievements: [],
  streakDays: [],
  lastPracticeDate: null
})

const bookmarkedIds = ref<number[]>([])
const mockExamHistory = ref<MockExamResult[]>([])
const achievementsEnabled = ref(true)
const achievementsPreferenceSet = ref(false)
const showAchievementsPrompt = ref(false)
const showConfetti = ref(false)
const isOnline = ref(true)

// Quiz state
const quizType = ref<QuizType>('training')
const currentQuestionIndex = ref(0)
const selectedAnswers = ref<string[]>([])
const quizQuestions = ref<Question[]>([])
const results = ref<{ question: Question; selected: string[]; correct: boolean }[]>([])
const selectedCategories = ref<number[]>([])
const questionCount = ref(30)
const showFeedback = ref(false)
const currentFeedbackCorrect = ref(false)
const showHint = ref(false)

// Timer
const timerSeconds = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const examTimeLimit = ref(45 * 60)

// Modal
const modalVisible = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirm = ref(false)
const modalCallback = ref<(() => void) | null>(null)

let initialized = false

export function useQuizStore() {
  // Initialize from localStorage (only once)
  function init() {
    if (initialized) return
    initialized = true

    // Load stats
    const savedStats = localStorage.getItem('quiz-stats')
    if (savedStats) {
      const parsed = JSON.parse(savedStats)
      stats.value = {
        ...stats.value,
        ...parsed,
        consecutiveCorrect: parsed.consecutiveCorrect || 0,
        maxConsecutiveCorrect: parsed.maxConsecutiveCorrect || 0,
        practicedCategories: parsed.practicedCategories || [],
        achievements: parsed.achievements || [],
        streakDays: parsed.streakDays || [],
        lastPracticeDate: parsed.lastPracticeDate || null
      }
    }

    // Load bookmarks
    const savedBookmarks = localStorage.getItem('quiz-bookmarks')
    if (savedBookmarks) {
      bookmarkedIds.value = JSON.parse(savedBookmarks)
    }

    // Load mock exam history
    const savedHistory = localStorage.getItem('quiz-mock-history')
    if (savedHistory) {
      mockExamHistory.value = JSON.parse(savedHistory)
    }

    // Load achievements setting
    const savedAchievements = localStorage.getItem('quiz-achievements-enabled')
    if (savedAchievements !== null) {
      achievementsEnabled.value = savedAchievements === 'true'
      achievementsPreferenceSet.value = true
    } else {
      // Show prompt to ask user about achievements on first visit
      showAchievementsPrompt.value = true
    }

    // Online/offline detection
    isOnline.value = navigator.onLine
    window.addEventListener('online', () => isOnline.value = true)
    window.addEventListener('offline', () => isOnline.value = false)
  }

  // Save functions
  function saveStats() {
    localStorage.setItem('quiz-stats', JSON.stringify(stats.value))
  }

  function saveBookmarks() {
    localStorage.setItem('quiz-bookmarks', JSON.stringify(bookmarkedIds.value))
  }

  // Bookmarks
  function toggleBookmark(questionId: number) {
    const idx = bookmarkedIds.value.indexOf(questionId)
    if (idx === -1) {
      bookmarkedIds.value.push(questionId)
    } else {
      bookmarkedIds.value.splice(idx, 1)
    }
    saveBookmarks()
  }

  function isBookmarked(questionId: number) {
    return bookmarkedIds.value.includes(questionId)
  }

  // Modal
  function showModal(title: string, message: string, isConfirm = false, callback: (() => void) | null = null) {
    modalTitle.value = title
    modalMessage.value = message
    modalConfirm.value = isConfirm
    modalCallback.value = callback
    modalVisible.value = true
  }

  function closeModal(confirmed = false) {
    modalVisible.value = false
    if (confirmed && modalCallback.value) {
      modalCallback.value()
    }
    modalCallback.value = null
  }

  // Achievements
  function toggleAchievements() {
    achievementsEnabled.value = !achievementsEnabled.value
    localStorage.setItem('quiz-achievements-enabled', String(achievementsEnabled.value))
    achievementsPreferenceSet.value = true
  }

  function setAchievementsPreference(enabled: boolean) {
    achievementsEnabled.value = enabled
    localStorage.setItem('quiz-achievements-enabled', String(enabled))
    achievementsPreferenceSet.value = true
    showAchievementsPrompt.value = false
  }

  function unlockAchievement(id: string, showPopup = true) {
    if (!achievementsEnabled.value) return
    if (!stats.value.achievements.includes(id)) {
      stats.value.achievements.push(id)
      // Don't show popup during mock exams (except for mock_passed which is shown after)
      if (showPopup && quizType.value !== 'mock') {
        const achievement = achievementDefs.find(a => a.id === id)
        if (achievement) {
          showModal('Neue Errungenschaft!', `${achievement.icon} ${achievement.name}: ${achievement.desc}`)
        }
      }
    }
  }

  function checkAchievements() {
    if (stats.value.totalSessions >= 1) unlockAchievement('first_quiz')
    if (stats.value.totalSessions >= 10) unlockAchievement('ten_quizzes')
    if (stats.value.totalSessions >= 50) unlockAchievement('fifty_quizzes')
    if (stats.value.totalQuestions >= 100) unlockAchievement('hundred_questions')
    if (stats.value.totalQuestions >= 500) unlockAchievement('five_hundred_questions')
    if (stats.value.maxConsecutiveCorrect >= 10) unlockAchievement('perfect_ten')
    if (stats.value.practicedCategories.length >= categories.length) {
      unlockAchievement('all_categories')
    }
  }

  // Streak
  const currentStreak = computed(() => {
    const days = stats.value.streakDays
    if (days.length === 0) return 0

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const lastDay = days[days.length - 1]
    if (lastDay !== today && lastDay !== yesterday) return 0

    let streak = 1
    for (let i = days.length - 2; i >= 0; i--) {
      const currentDay = days[i + 1]
      const prevDay = days[i]
      if (!currentDay || !prevDay) break
      const current = new Date(currentDay)
      const prev = new Date(prevDay)
      const diff = (current.getTime() - prev.getTime()) / 86400000
      if (diff === 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  })

  function updateStreak() {
    const today = new Date().toISOString().split('T')[0] as string
    if (stats.value.lastPracticeDate !== today) {
      stats.value.lastPracticeDate = today
      if (!stats.value.streakDays.includes(today)) {
        stats.value.streakDays.push(today)
        if (stats.value.streakDays.length > 60) {
          stats.value.streakDays = stats.value.streakDays.slice(-60)
        }
      }
      checkStreakAchievements()
    }
  }

  function checkStreakAchievements() {
    const streak = currentStreak.value
    if (streak >= 3) unlockAchievement('streak_3')
    if (streak >= 7) unlockAchievement('streak_7')
    if (streak >= 30) unlockAchievement('streak_30')
  }

  // Stats update
  function updateQuestionStats(questionId: number, correct: boolean) {
    if (!stats.value.questions[questionId]) {
      stats.value.questions[questionId] = { correct: 0, wrong: 0 }
    }
    if (correct) {
      stats.value.questions[questionId].correct++
      stats.value.totalCorrect++
      stats.value.consecutiveCorrect++
      if (stats.value.consecutiveCorrect > stats.value.maxConsecutiveCorrect) {
        stats.value.maxConsecutiveCorrect = stats.value.consecutiveCorrect
      }
    } else {
      stats.value.questions[questionId].wrong++
      stats.value.consecutiveCorrect = 0
    }
    stats.value.questions[questionId].lastAnswered = Date.now()
    stats.value.totalQuestions++

    const question = questions.find(q => q.id === questionId)
    if (question && !stats.value.practicedCategories.includes(question.categoryId)) {
      stats.value.practicedCategories.push(question.categoryId)
    }

    checkAchievements()
    saveStats()
  }

  // Timer
  function startTimer() {
    timerSeconds.value = 0
    if (timerInterval.value) clearInterval(timerInterval.value)
    timerInterval.value = setInterval(() => {
      timerSeconds.value++
      if ((quizType.value === 'timed' || quizType.value === 'mock') && timerSeconds.value >= examTimeLimit.value) {
        if (timerInterval.value) clearInterval(timerInterval.value)
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remainingTime = computed(() => {
    if (quizType.value === 'timed' || quizType.value === 'mock') {
      return Math.max(0, examTimeLimit.value - timerSeconds.value)
    }
    return timerSeconds.value
  })

  // Spaced repetition
  function getSpacedRepetitionQuestions(count: number, categoryIds?: number[]): Question[] {
    const now = Date.now()
    const dayMs = 86400000

    let pool = categoryIds
      ? questions.filter(q => categoryIds.includes(q.categoryId))
      : [...questions]

    const scored = pool.map(q => {
      const s = stats.value.questions[q.id]
      let score = 50

      if (!s) {
        score += 30
      } else {
        if (s.wrong > s.correct) score += 25
        else if (s.wrong === s.correct) score += 10

        if (s.lastAnswered) {
          const daysSince = (now - s.lastAnswered) / dayMs
          score += Math.min(daysSince * 2, 20)
        }
      }

      score += Math.random() * 20

      return { question: q, score }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, count).map(s => s.question)
  }

  // Category progress
  function getCategoryProgress(categoryId: number) {
    const catQuestions = getQuestionsByCategory(categoryId)
    let mastered = 0

    catQuestions.forEach(q => {
      const s = stats.value.questions[q.id]
      if (s && s.correct > s.wrong && s.correct >= 2) {
        mastered++
      }
    })

    return {
      total: catQuestions.length,
      mastered,
      percentage: catQuestions.length > 0 ? Math.round((mastered / catQuestions.length) * 100) : 0
    }
  }

  function getCategoryStats(categoryId: number) {
    const catQuestions = getQuestionsByCategory(categoryId)
    let correct = 0
    let wrong = 0
    let answered = 0

    catQuestions.forEach(q => {
      const s = stats.value.questions[q.id]
      if (s) {
        correct += s.correct
        wrong += s.wrong
        answered++
      }
    })

    return { correct, wrong, answered, total: catQuestions.length }
  }

  // Computed
  const bookmarkedQuestions = computed(() => {
    return questions.filter(q => bookmarkedIds.value.includes(q.id))
  })

  const wrongQuestions = computed(() => {
    return questions.filter(q => {
      const s = stats.value.questions[q.id]
      return s && s.wrong > s.correct
    })
  })

  const currentQuestion = computed(() => quizQuestions.value[currentQuestionIndex.value])

  const progress = computed(() => ({
    current: currentQuestionIndex.value + 1,
    total: quizQuestions.value.length
  }))

  const correctCount = computed(() => results.value.filter(r => r.correct).length)
  const percentage = computed(() => results.value.length > 0 ? Math.round((correctCount.value / results.value.length) * 100) : 0)

  // Pass condition: 20 out of 30 correct answers
  const hasPassed = computed(() => {
    return correctCount.value >= 20
  })

  const overallPercentage = computed(() => {
    if (stats.value.totalQuestions === 0) return 0
    return Math.round((stats.value.totalCorrect / stats.value.totalQuestions) * 100)
  })

  // Quiz functions
  function toggleCategory(categoryId: number) {
    const index = selectedCategories.value.indexOf(categoryId)
    if (index === -1) {
      selectedCategories.value.push(categoryId)
    } else {
      selectedCategories.value.splice(index, 1)
    }
  }

  function selectAllCategories() {
    selectedCategories.value = categories.map(c => c.id)
  }

  function deselectAllCategories() {
    selectedCategories.value = []
  }

  function setupQuiz(type: QuizType, useWrongOnly = false, useBookmarks = false, useSpacedRepetition = false): boolean {
    quizType.value = type

    let pool: Question[]
    let count = questionCount.value

    if (type === 'mock') {
      count = 30
      examTimeLimit.value = 45 * 60
    } else if (type === 'timed') {
      examTimeLimit.value = Math.ceil(count * 1.5) * 60
    }

    if (useWrongOnly) {
      pool = wrongQuestions.value
      if (pool.length === 0) {
        showModal('Hinweis', 'Keine falsch beantworteten Fragen vorhanden.')
        return false
      }
    } else if (useBookmarks) {
      pool = bookmarkedQuestions.value
      if (pool.length === 0) {
        showModal('Hinweis', 'Keine markierten Fragen vorhanden.')
        return false
      }
    } else if (useSpacedRepetition) {
      const cats = selectedCategories.value.length > 0 ? selectedCategories.value : undefined
      pool = getSpacedRepetitionQuestions(count, cats)
    } else {
      const cats = selectedCategories.value.length > 0 ? selectedCategories.value : undefined
      pool = getRandomQuestions(count, cats)
    }

    quizQuestions.value = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length))
    currentQuestionIndex.value = 0
    selectedAnswers.value = []
    results.value = []
    showFeedback.value = false
    showHint.value = false
    stats.value.totalSessions++
    updateStreak()
    saveStats()

    if (type === 'timed' || type === 'mock') {
      startTimer()
    } else {
      stopTimer()
    }

    return true
  }

  function setupRetrainWrong(): boolean {
    const wrongOnes = results.value.filter(r => !r.correct).map(r => r.question)
    if (wrongOnes.length === 0) return false
    quizType.value = 'training' // Switch to training mode for retrain
    quizQuestions.value = wrongOnes
    currentQuestionIndex.value = 0
    selectedAnswers.value = []
    results.value = []
    showFeedback.value = false
    showHint.value = false
    stopTimer() // Stop any running timer
    return true
  }

  function toggleAnswer(answer: string) {
    if (showFeedback.value) return

    const index = selectedAnswers.value.indexOf(answer)
    if (index === -1) {
      selectedAnswers.value.push(answer)
    } else {
      selectedAnswers.value.splice(index, 1)
    }
  }

  function checkAnswer(): boolean {
    const question = currentQuestion.value
    if (!question) return false

    const correct = [...question.correctAnswers].sort()
    const selected = [...selectedAnswers.value].sort()
    const isCorrect =
      selected.length === correct.length &&
      selected.every((s, i) => s === correct[i])

    results.value.push({
      question: question,
      selected: [...selectedAnswers.value],
      correct: isCorrect
    })

    updateQuestionStats(question.id, isCorrect)

    if (quizType.value === 'training') {
      currentFeedbackCorrect.value = isCorrect
      showFeedback.value = true
      return false // Don't navigate yet
    } else {
      return goToNext() // Returns true if quiz is finished
    }
  }

  function goToNext(): boolean {
    if (currentQuestionIndex.value < quizQuestions.value.length - 1) {
      currentQuestionIndex.value++
      selectedAnswers.value = []
      showFeedback.value = false
      showHint.value = false
      return false
    } else {
      finishQuiz()
      return true
    }
  }

  function finishQuiz() {
    stopTimer()

    const allCorrect = results.value.every(r => r.correct)
    if (allCorrect && results.value.length >= 10) {
      unlockAchievement('perfect_quiz')
    }

    if (quizType.value === 'mock') {
      const passed = correctCount.value >= 20

      // Save to history
      const result: MockExamResult = {
        date: new Date().toISOString(),
        correct: correctCount.value,
        total: results.value.length,
        passed,
        timeSeconds: timerSeconds.value
      }
      mockExamHistory.value.unshift(result)
      // Keep last 20 results
      if (mockExamHistory.value.length > 20) {
        mockExamHistory.value = mockExamHistory.value.slice(0, 20)
      }
      localStorage.setItem('quiz-mock-history', JSON.stringify(mockExamHistory.value))

      if (passed) {
        unlockAchievement('mock_passed')
        // Trigger confetti
        showConfetti.value = true
        setTimeout(() => {
          showConfetti.value = false
        }, 4000)
      }
    }

    if (quizType.value === 'timed' && percentage.value >= 80) {
      unlockAchievement('speed_demon')
    }

    saveStats()
  }

  function toggleHint() {
    showHint.value = !showHint.value
  }

  function getOptionClass(key: string) {
    if (!showFeedback.value) {
      return { selected: selectedAnswers.value.includes(key) }
    }

    const question = currentQuestion.value
    if (!question) return {}

    const isCorrectAnswer = question.correctAnswers.includes(key)
    const wasSelected = selectedAnswers.value.includes(key)

    return {
      'correct-answer': isCorrectAnswer,
      'wrong-selected': wasSelected && !isCorrectAnswer,
      'selected': wasSelected
    }
  }

  function resetStats() {
    showModal('Statistiken zurücksetzen', 'Möchtest du wirklich alle Statistiken und Errungenschaften löschen?', true, () => {
      stats.value = {
        questions: {},
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        consecutiveCorrect: 0,
        maxConsecutiveCorrect: 0,
        practicedCategories: [],
        achievements: [],
        streakDays: [],
        lastPracticeDate: null
      }
      bookmarkedIds.value = []
      mockExamHistory.value = []
      saveStats()
      saveBookmarks()
      localStorage.removeItem('quiz-mock-history')
    })
  }

  function getCategoryQuestionCount(categoryId: number): number {
    return getQuestionsByCategory(categoryId).length
  }

  // Share
  async function shareResults() {
    let text = `Sachkundenachweis NRW Training\n${correctCount.value}/${results.value.length} richtig (${percentage.value}%)`
    if (quizType.value === 'mock') {
      text += `\n${hasPassed.value ? '✅ Bestanden!' : '❌ Nicht bestanden'}`
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mein Quiz-Ergebnis',
          text: text
        })
      } catch {
        copyToClipboard(text)
      }
    } else {
      copyToClipboard(text)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      showModal('Kopiert!', 'Ergebnis wurde in die Zwischenablage kopiert.')
    }).catch(() => {
      showModal('Fehler', 'Kopieren fehlgeschlagen.')
    })
  }

  return {
    // State
    stats,
    bookmarkedIds,
    mockExamHistory,
    achievementsEnabled,
    achievementsPreferenceSet,
    showAchievementsPrompt,
    showConfetti,
    isOnline,
    quizType,
    currentQuestionIndex,
    selectedAnswers,
    quizQuestions,
    results,
    selectedCategories,
    questionCount,
    showFeedback,
    currentFeedbackCorrect,
    showHint,
    timerSeconds,
    examTimeLimit,
    modalVisible,
    modalTitle,
    modalMessage,
    modalConfirm,

    // Computed
    currentStreak,
    remainingTime,
    bookmarkedQuestions,
    wrongQuestions,
    currentQuestion,
    progress,
    correctCount,
    percentage,
    hasPassed,
    overallPercentage,

    // Functions
    init,
    saveStats,
    toggleBookmark,
    isBookmarked,
    showModal,
    closeModal,
    toggleAchievements,
    setAchievementsPreference,
    unlockAchievement,
    checkAchievements,
    updateStreak,
    updateQuestionStats,
    startTimer,
    stopTimer,
    formatTime,
    getSpacedRepetitionQuestions,
    getCategoryProgress,
    getCategoryStats,
    toggleCategory,
    selectAllCategories,
    deselectAllCategories,
    setupQuiz,
    setupRetrainWrong,
    toggleAnswer,
    checkAnswer,
    goToNext,
    finishQuiz,
    toggleHint,
    getOptionClass,
    resetStats,
    getCategoryQuestionCount,
    shareResults,

    // Re-export data
    categories,
    questions,
    achievementDefs
  }
}
