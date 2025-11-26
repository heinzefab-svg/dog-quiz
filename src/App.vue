<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '@/composables/useQuizStore'

const route = useRoute()
const router = useRouter()
const store = useQuizStore()
const mobileMenuOpen = ref(false)

onMounted(() => {
  store.init()
})

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

function goBack() {
  if (route.path === '/quiz') {
    store.showModal('Quiz beenden?', 'Möchtest du das Quiz wirklich abbrechen? Dein Fortschritt geht verloren.', true, () => {
      store.stopTimer()
      router.push('/')
    })
  } else {
    router.push('/')
  }
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <div class="page">
    <!-- Offline indicator -->
    <div v-if="!store.isOnline.value" class="offline-banner">
      Offline - Daten werden lokal gespeichert
    </div>

    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <button v-if="route.path !== '/'" @click="goBack" class="back-btn" aria-label="Zurück">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <router-link to="/" class="logo">
          <span class="logo-text">Sachkundenachweis NRW</span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="nav nav-desktop">
          <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }">
            Home
          </router-link>
          <router-link to="/stats" class="nav-link" :class="{ active: route.path === '/stats' }">
            Statistiken
          </router-link>
          <router-link to="/achievements" class="nav-link" :class="{ active: route.path === '/achievements' }">
            Errungenschaften
          </router-link>
          <router-link to="/settings" class="nav-link" :class="{ active: route.path === '/settings' }">
            Einstellungen
          </router-link>
        </nav>

        <!-- Mobile Hamburger Button -->
        <button class="hamburger" @click="toggleMobileMenu" aria-label="Menü">
          <span class="hamburger-line" :class="{ open: mobileMenuOpen }"></span>
          <span class="hamburger-line" :class="{ open: mobileMenuOpen }"></span>
          <span class="hamburger-line" :class="{ open: mobileMenuOpen }"></span>
        </button>
      </div>

      <!-- Mobile Navigation Dropdown -->
      <nav class="nav-mobile" :class="{ open: mobileMenuOpen }">
        <router-link to="/" class="nav-mobile-link" :class="{ active: route.path === '/' }">
          Home
        </router-link>
        <router-link to="/stats" class="nav-mobile-link" :class="{ active: route.path === '/stats' }">
          Statistiken
        </router-link>
        <router-link to="/achievements" class="nav-mobile-link" :class="{ active: route.path === '/achievements' }">
          Errungenschaften
        </router-link>
        <router-link to="/settings" class="nav-mobile-link" :class="{ active: route.path === '/settings' }">
          Einstellungen
        </router-link>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>Sachkundenachweis NRW - Hundehalter-Prüfung Training</p>
    </footer>

    <!-- Modal Dialog -->
    <div v-if="store.modalVisible.value" class="modal-overlay" @click.self="store.closeModal(false)">
      <div class="modal">
        <h3 class="modal-title">{{ store.modalTitle.value }}</h3>
        <p class="modal-message">{{ store.modalMessage.value }}</p>
        <div class="modal-actions">
          <button v-if="store.modalConfirm.value" @click="store.closeModal(false)" class="btn btn-outline">
            Abbrechen
          </button>
          <button @click="store.closeModal(true)" class="btn btn-primary">
            {{ store.modalConfirm.value ? 'Bestätigen' : 'OK' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Achievements Preference Prompt -->
    <div v-if="store.showAchievementsPrompt.value" class="modal-overlay">
      <div class="modal">
        <h3 class="modal-title">Errungenschaften aktivieren?</h3>
        <p class="modal-message">Möchtest du Errungenschaften und Benachrichtigungen für deinen Lernfortschritt erhalten?</p>
        <div class="modal-actions">
          <button @click="store.setAchievementsPreference(false)" class="btn btn-outline">
            Nein, danke
          </button>
          <button @click="store.setAchievementsPreference(true)" class="btn btn-primary">
            Ja, aktivieren
          </button>
        </div>
      </div>
    </div>

    <!-- Confetti Animation -->
    <div v-if="store.showConfetti.value" class="confetti-container">
      <div v-for="i in 50" :key="i" class="confetti" :style="{ '--i': i }"></div>
    </div>
  </div>
</template>

<style>
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

html, body, #app {
  min-height: 100vh;
  width: 100%;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background-color: #f4f4f4;
  color: #2b2b2b;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  display: flex;
  flex-direction: column;
}

a {
  text-decoration: none;
  color: inherit;
}

/* ========================================
   VARIABLES
   ======================================== */
:root {
  --primary: #ad0d13;
  --primary-hover: #8a0a0f;
  --secondary: #6c757d;
  --secondary-hover: #5a6268;
  --text: #2b2b2b;
  --text-light: #666;
  --text-muted: #999;
  --bg: #f4f4f4;
  --white: #fff;
  --border: #ddd;
  --border-light: #e5e5e5;
  --success: #28a745;
  --success-bg: #d4edda;
  --warning: #ffc107;
  --warning-bg: #fff3cd;
  --danger: #dc3545;
  --danger-bg: #f8d7da;
  --info-bg: #e3f2fd;
  --info-border: #90caf9;
  --info-text: #1565c0;
  --radius: 6px;
  --radius-lg: 10px;
  --shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* ========================================
   OFFLINE BANNER
   ======================================== */
.offline-banner {
  background: var(--warning);
  color: #000;
  text-align: center;
  padding: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* ========================================
   PAGE LAYOUT
   ======================================== */
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

/* ========================================
   HEADER
   ======================================== */
.header {
  border-bottom: 4px solid var(--primary);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--radius);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--border-light);
  color: var(--primary);
}

.logo {
  cursor: pointer;
  flex: 1;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

/* Desktop Navigation */
.nav-desktop {
  display: none;
  gap: 8px;
  margin-left: auto;
  align-items: center;
}

.nav-link {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: var(--text-light);
  cursor: pointer;
  border-radius: var(--radius);
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-link.active {
  color: var(--primary);
  font-weight: 600;
}

/* Hamburger Menu Button */
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: auto;
}

.hamburger-line {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text);
  transition: all 0.3s;
}

.hamburger-line.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-line.open:nth-child(2) {
  opacity: 0;
}

.hamburger-line.open:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile Navigation */
.nav-mobile {
  display: none;
  flex-direction: column;
  background: var(--white);
  border-top: 1px solid var(--border-light);
  padding: 8px 0;
}

.nav-mobile.open {
  display: flex;
}

.nav-mobile-link {
  padding: 12px 20px;
  color: var(--text);
  font-size: 1rem;
  transition: all 0.2s;
}

.nav-mobile-link:hover {
  background: var(--bg);
  color: var(--primary);
}

.nav-mobile-link.active {
  color: var(--primary);
  font-weight: 600;
  background: var(--bg);
}

/* ========================================
   MAIN CONTENT
   ======================================== */
.main {
  flex: 1;
  padding: 32px 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.container-narrow {
  max-width: 700px;
}

/* ========================================
   HERO
   ======================================== */
.hero {
  text-align: center;
  margin-bottom: 32px;
}

.hero h1 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 8px;
}

.hero p {
  font-size: 1.1rem;
  color: var(--text-light);
}

.page-title {
  text-align: center;
  margin-bottom: 32px;
  color: var(--text);
}

/* ========================================
   STATS BAR (Quick stats)
   ======================================== */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-box {
  background: var(--white);
  padding: 20px 16px;
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow);
}

.stat-box.warn .stat-num {
  color: var(--danger);
}

.stat-num {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-txt {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ========================================
   CARDS
   ======================================== */
.card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
}

.card h3 {
  margin-bottom: 16px;
  color: var(--text);
}

/* ========================================
   FORM ELEMENTS
   ======================================== */
.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

.select {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  background: var(--white);
  color: var(--text);
}

.select:focus {
  outline: none;
  border-color: var(--primary);
}

.hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

/* ========================================
   CHIPS (Category selection)
   ======================================== */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text);
}

.chip:hover {
  border-color: var(--primary);
}

.chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.chip input {
  display: none;
}

/* ========================================
   BUTTONS
   ======================================== */
.btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn small {
  font-weight: 400;
  font-size: 0.8rem;
  opacity: 0.85;
  margin-top: 2px;
}

.btn-lg {
  padding: 18px 32px;
  font-size: 1.1rem;
  flex: 1;
  min-width: 180px;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-outline {
  background: var(--white);
  color: var(--text);
  border-color: var(--border);
}

.btn-outline:hover:not(:disabled) {
  background: var(--bg);
  border-color: var(--text-light);
}

.btn-warning {
  background: var(--warning);
  color: var(--text);
  border-color: var(--warning);
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
  border-color: #e0a800;
}

.btn-ghost {
  background: transparent;
  color: var(--text-light);
  border-color: var(--border);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--bg);
}

.btn-danger-outline {
  background: transparent;
  color: var(--danger);
  border-color: var(--danger);
}

.btn-danger-outline:hover:not(:disabled) {
  background: var(--danger);
  color: #fff;
}

.btn-secondary {
  background: var(--secondary);
  color: #fff;
  border-color: var(--secondary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--secondary-hover);
  border-color: var(--secondary-hover);
}

.actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.actions-center {
  justify-content: center;
}

/* ========================================
   ALERTS
   ======================================== */
.alert {
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  text-align: center;
}

.alert h3 {
  margin: 0 0 8px;
}

.alert p {
  margin: 0 0 16px;
  color: var(--text-light);
}

.alert-warning {
  background: var(--warning-bg);
  border: 2px solid var(--warning);
}

/* ========================================
   QUIZ PROGRESS
   ======================================== */
.quiz-header {
  margin-bottom: 20px;
}

.progress {
  height: 8px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-light);
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.training {
  background: var(--success-bg);
  color: var(--success);
}

.badge.exam {
  background: #cce5ff;
  color: #004085;
}

.badge.timed {
  background: #fff3e0;
  color: #e65100;
}

.badge.mock {
  background: #e8f5e9;
  color: #2e7d32;
}

.score-row {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 12px;
  background: var(--white);
  border-radius: var(--radius);
  margin-bottom: 20px;
  font-weight: 600;
}

.score-good {
  color: var(--success);
}

.score-bad {
  color: var(--danger);
}

/* ========================================
   QUESTION
   ======================================== */
.q-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.q-category {
  background: var(--bg);
  color: var(--text-light);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.q-text {
  font-size: 1.25rem;
  line-height: 1.5;
  margin-bottom: 20px;
  color: var(--text);
}

.q-image {
  margin-bottom: 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
}

.q-image img {
  max-width: 100%;
  max-height: 350px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.2s;
}

.q-image:hover img {
  transform: scale(1.02);
}

.q-image-zoom-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 8px;
}

/* ========================================
   IMAGE ZOOM MODAL
   ======================================== */
.image-zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
  cursor: pointer;
}

.image-zoom-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.image-zoom-close:hover {
  opacity: 1;
}

.image-zoom-img {
  max-width: 95vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius);
  cursor: default;
}

/* ========================================
   OPTIONS
   ======================================== */
.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  color: var(--text);
}

.option:hover:not(:disabled) {
  border-color: var(--primary);
  background: #fef5f5;
}

.option.selected {
  border-color: var(--primary);
  background: #fef0f0;
}

.option:disabled {
  cursor: default;
}

.option.correct-answer {
  border-color: var(--success);
  background: var(--success-bg);
}

.option.wrong-selected {
  border-color: var(--danger);
  background: var(--danger-bg);
}

.option-key {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.option.correct-answer .option-key {
  background: var(--success);
}

.option.wrong-selected .option-key {
  background: var(--danger);
}

.option-text {
  flex: 1;
  line-height: 1.4;
}

.option-check {
  color: var(--success);
  font-size: 1.25rem;
  font-weight: 700;
}

/* ========================================
   FEEDBACK & HINT
   ======================================== */
.feedback {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius);
  margin-bottom: 20px;
}

.feedback-correct {
  background: var(--success-bg);
  border: 2px solid var(--success);
}

.feedback-wrong {
  background: var(--danger-bg);
  border: 2px solid var(--danger);
}

.feedback-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feedback-correct .feedback-icon {
  background: var(--success);
  color: #fff;
}

.feedback-wrong .feedback-icon {
  background: var(--danger);
  color: #fff;
}

.feedback p {
  margin: 4px 0 0;
  font-size: 0.9rem;
}

.hint-box {
  background: var(--info-bg);
  border: 2px solid var(--info-border);
  color: var(--info-text);
  padding: 12px 16px;
  border-radius: var(--radius);
  margin-bottom: 16px;
  text-align: center;
}

.q-actions {
  display: flex;
  gap: 12px;
}

.q-actions .btn {
  flex: 1;
}

/* ========================================
   RESULT
   ======================================== */
.result-box {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--white);
  padding: 32px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: 24px;
  border: 4px solid var(--danger);
}

.result-box.passed {
  border-color: var(--success);
}

.result-score {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}

.result-info p {
  margin: 0;
  color: var(--text-light);
}

.result-info h2 {
  margin: 4px 0;
  font-size: 1.5rem;
}

.result-box.passed .result-info h2 {
  color: var(--success);
}

.result-box:not(.passed) .result-info h2 {
  color: var(--danger);
}

.result-hint {
  font-size: 0.85rem;
}

.result-time {
  font-family: monospace;
  margin-top: 8px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  padding: 16px;
  border-radius: var(--radius);
  border-left: 4px solid;
}

.result-correct {
  background: #f0fff4;
  border-color: var(--success);
}

.result-wrong {
  background: #fff5f5;
  border-color: var(--danger);
}

.result-item-head {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 8px;
}

.result-correct .result-item-head {
  color: var(--success);
}

.result-wrong .result-item-head {
  color: var(--danger);
}

.result-item-q {
  margin: 0 0 8px;
  font-weight: 500;
}

.result-item-a {
  margin: 4px 0;
  font-size: 0.9rem;
  color: var(--text-light);
}

.result-item-a .wrong {
  color: var(--danger);
}

.result-item-a .correct {
  color: var(--success);
  font-weight: 600;
}

/* ========================================
   STATS PAGE
   ======================================== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--white);
  padding: 24px 20px;
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow);
}

.stat-card-highlight {
  background: var(--primary);
  color: #fff;
}

.stat-card-num {
  display: block;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-card:not(.stat-card-highlight) .stat-card-num {
  color: var(--primary);
}

.stat-card-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.cat-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cat-stat {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.cat-stat:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.cat-stat-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.cat-stat-count {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.cat-stat-bar {
  height: 6px;
  background: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.cat-stat-fill {
  height: 100%;
  background: var(--success);
  transition: width 0.3s;
}

.cat-stat-pct {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ========================================
   EXAM HISTORY
   ======================================== */
.exam-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exam-history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg);
  border-radius: var(--radius);
  border-left: 4px solid var(--danger);
}

.exam-history-item.passed {
  border-left-color: var(--success);
}

.exam-history-date {
  font-size: 0.85rem;
  color: var(--text-muted);
  min-width: 80px;
}

.exam-history-result {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.exam-history-result strong {
  font-size: 1.1rem;
}

.exam-history-status {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--danger-bg);
  color: var(--danger);
}

.exam-history-item.passed .exam-history-status {
  background: var(--success-bg);
  color: var(--success);
}

.exam-history-time {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* ========================================
   FOOTER
   ======================================== */
.footer {
  color: var(--text-muted);
  text-align: center;
  padding: 20px;
  font-size: 0.85rem;
}

.footer p {
  margin: 0;
}

/* ========================================
   MODAL DIALOG
   ======================================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  margin: 0 0 12px;
  font-size: 1.25rem;
  color: var(--text);
}

.modal-message {
  margin: 0 0 24px;
  color: var(--text-light);
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-actions .btn {
  flex-direction: row;
  padding: 10px 20px;
}

/* ========================================
   STREAK & TIMER
   ======================================== */
.streak-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 12px;
}

.stat-box.streak .stat-num {
  color: #f7931e;
}

.timer {
  font-family: monospace;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-right: 12px;
}

.timer-warning {
  color: var(--danger);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.progress-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ========================================
   BOOKMARK BUTTON
   ======================================== */
.bookmark-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
  transition: all 0.2s;
}

.bookmark-btn:hover,
.bookmark-btn.active {
  opacity: 1;
}

/* ========================================
   TRAINING OPTIONS
   ======================================== */
.training-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.training-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--white);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow);
}

.training-option:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.training-icon {
  font-size: 1.5rem;
}

.training-option strong {
  display: block;
  color: var(--text);
}

.training-option small {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ========================================
   CARD HIGHLIGHT
   ======================================== */
.card-highlight {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: white;
  text-align: center;
}

.card-highlight h3 {
  color: white;
  margin-bottom: 8px;
}

.card-highlight p {
  opacity: 0.9;
  margin-bottom: 16px;
}

.card-highlight .btn-primary {
  background: white;
  color: var(--primary);
  border-color: white;
}

.card-highlight .btn-primary:hover {
  background: rgba(255,255,255,0.9);
}

/* ========================================
   ACHIEVEMENTS
   ======================================== */
.page-subtitle {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  opacity: 0.5;
  filter: grayscale(1);
  transition: all 0.3s;
}

.achievement-card.unlocked {
  opacity: 1;
  filter: none;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-info {
  flex: 1;
}

.achievement-info strong {
  display: block;
  color: var(--text);
  margin-bottom: 2px;
}

.achievement-info small {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.achievement-check {
  color: var(--success);
  font-size: 1.25rem;
  font-weight: 700;
}

/* ========================================
   TOGGLE SWITCH (Settings)
   ======================================== */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: 0.3s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--success);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* ========================================
   SETTINGS PAGE
   ======================================== */
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
}

.setting-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-row:first-child {
  padding-top: 0;
}

.setting-info {
  flex: 1;
}

.setting-info strong {
  display: block;
  color: var(--text);
  margin-bottom: 4px;
}

.setting-info small {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ========================================
   NAV TEXT (hide on mobile)
   ======================================== */
.nav-text {
  margin-left: 4px;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 640px) {
  .header-inner {
    height: 56px;
    padding: 0 16px;
  }

  .logo-text {
    font-size: 1rem;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 0.8rem;
  }

  .nav-text {
    display: none;
  }

  .main {
    padding: 20px 16px;
  }

  .hero h1 {
    font-size: 1.5rem;
  }

  .hero p {
    font-size: 1rem;
  }

  .card {
    padding: 16px;
  }

  .actions {
    flex-direction: column;
  }

  .btn-lg {
    min-width: auto;
    width: 100%;
  }

  .q-text {
    font-size: 1.1rem;
  }

  .q-image img {
    max-height: 250px;
  }

  .result-box {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card-num {
    font-size: 1.75rem;
  }
}

@media (min-width: 768px) {
  .main {
    padding: 40px 24px;
  }

  .stats-bar {
    grid-template-columns: repeat(4, 1fr);
  }

  /* Show desktop navigation, hide hamburger */
  .nav-desktop {
    display: flex;
  }

  .hamburger {
    display: none;
  }

  .nav-mobile {
    display: none !important;
  }
}

/* ========================================
   CONFETTI ANIMATION
   ======================================== */
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 3000;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  left: calc(var(--i) * 2%);
  animation: confetti-fall 4s ease-out forwards;
  animation-delay: calc(var(--i) * 0.02s);
}

.confetti::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: hsl(calc(var(--i) * 7.2), 80%, 60%);
  border-radius: 2px;
  animation: confetti-spin 1s linear infinite;
}

.confetti:nth-child(odd)::before {
  border-radius: 50%;
}

.confetti:nth-child(3n)::before {
  width: 6px;
  height: 14px;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes confetti-spin {
  0% {
    transform: rotateY(0deg) rotateX(0deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(180deg);
  }
}
</style>
