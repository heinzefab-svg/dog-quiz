// Types for JSON category files
interface JsonQuestion {
  id: number;
  question: string;
  options: { [key: string]: string };
  correct_answers: string[];
  image?: {
    data: string;
    media_type: string;
  };
}

interface JsonCategory {
  category: string;
  category_description: string;
  questions: JsonQuestion[];
}

// Export interface for the app
export interface Question {
  id: number;
  category: string;
  categoryId: number;
  text: string;
  options: { [key: string]: string };
  correctAnswers: string[];
  image?: {
    data: string;
    mediaType: string;
  };
}

export interface Category {
  id: number;
  name: string;
  shortName: string;
}

// Dynamically import all category JSON files
const categoryModules = import.meta.glob<JsonCategory>('./category*.json', { eager: true })

// Category short names mapping
const categoryShortNames: { [key: string]: string } = {
  "1 Ausdrucksverhalten Bilder": "Verhalten (Bilder)",
  "2 Ausdrucksverhalten Fragen": "Verhalten (Fragen)",
  "3 Rassen": "Rassen",
  "4 Hund und Kind": "Hund & Kind",
  "5 Umgang und Verständnis": "Umgang",
  "6 Training": "Training",
  "7 Strafen": "Strafen",
  "8 Hundewahl": "Hundewahl",
  "9 Hundebegegnungen": "Begegnungen",
  "10 Aufzucht": "Aufzucht",
  "11 Hilfsmittel": "Hilfsmittel",
  "12 Probleme - Verständnis": "Probleme (Verständnis)",
  "13 Probleme - Ursachen und Vorbeugen": "Probleme (Ursachen)",
  "14 Probleme - Maßnahmen": "Probleme (Maßnahmen)",
  "15 Rechtliches": "Rechtliches",
  "16 Haltung": "Haltung",
  "17 Gesundheit": "Gesundheit",
  "18 Geschlechter": "Geschlechter",
  "19 Krankheiten": "Krankheiten",
  "20 Öffentlichkeit": "Öffentlichkeit",
}

// Extract category ID from category name (e.g., "1 Ausdrucksverhalten Bilder" -> 1)
function extractCategoryId(categoryName: string): number {
  const match = categoryName.match(/^(\d+)/)
  return match && match[1] ? parseInt(match[1], 10) : 0
}

// Extract display name from category name (e.g., "1 Ausdrucksverhalten Bilder" -> "Ausdrucksverhalten Bilder")
function extractCategoryDisplayName(categoryName: string): string {
  return categoryName.replace(/^\d+\s*/, '')
}

// Build categories and questions from loaded JSON modules
const categoriesMap = new Map<number, Category>()
const allQuestions: Question[] = []

for (const path in categoryModules) {
  const module = categoryModules[path]
  if (!module) continue

  const categoryId = extractCategoryId(module.category)
  const categoryDisplayName = extractCategoryDisplayName(module.category)

  // Add category if not already present
  if (!categoriesMap.has(categoryId)) {
    categoriesMap.set(categoryId, {
      id: categoryId,
      name: categoryDisplayName,
      shortName: categoryShortNames[module.category] || categoryDisplayName
    })
  }

  // Transform and add questions
  for (const q of module.questions) {
    allQuestions.push({
      id: q.id,
      category: categoryDisplayName,
      categoryId: categoryId,
      text: q.question,
      options: q.options,
      correctAnswers: q.correct_answers,
      image: q.image ? {
        data: q.image.data,
        mediaType: q.image.media_type
      } : undefined
    })
  }
}

// Sort categories by ID and export
export const categories: Category[] = Array.from(categoriesMap.values()).sort((a, b) => a.id - b.id)

// Sort questions by ID and export
export const questions: Question[] = allQuestions.sort((a, b) => a.id - b.id)

export function getQuestionsByCategory(categoryId: number): Question[] {
  return questions.filter(q => q.categoryId === categoryId)
}

export function getRandomQuestions(count: number, categoryIds?: number[]): Question[] {
  let pool = categoryIds
    ? questions.filter(q => categoryIds.includes(q.categoryId))
    : [...questions]

  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
