export type Prompt = {
  id: string
  description: string
  items: readonly string[]
  correctOrder: readonly string[]
}

export const RANKED_EPOCH = new Date('2025-01-01T00:00:00')

export const prompts: readonly Prompt[] = [
  {
    id: 'social-apps',
    description:
      'Rank from most socially acceptable to admit using daily.',
    items: ['ChatGPT', 'Reddit', 'TikTok', 'LinkedIn', 'X'],
    correctOrder: ['ChatGPT', 'Reddit', 'TikTok', 'LinkedIn', 'X'],
  },
  {
    id: 'coffee-orders',
    description: 'Rank from most to least pretentious coffee order.',
    items: ['Black coffee', 'Latte', 'Cold brew', 'Oat milk cortado', 'Pumpkin spice latte'],
    correctOrder: [
      'Black coffee',
      'Cold brew',
      'Latte',
      'Oat milk cortado',
      'Pumpkin spice latte',
    ],
  },
  {
    id: 'excuses-late',
    description: 'Rank from most to least believable excuse for being late.',
    items: ['Traffic', 'Overslept', 'Subway delay', 'Forgot my laptop', 'Mercury retrograde'],
    correctOrder: [
      'Subway delay',
      'Traffic',
      'Overslept',
      'Forgot my laptop',
      'Mercury retrograde',
    ],
  },
  {
    id: 'group-chat',
    description: 'Rank from most to least chaotic group chat behavior.',
    items: [
      'Sending memes',
      'Voice notes',
      '@everyone',
      'Reacting to every message',
      'Leaving read receipts on blast',
    ],
    correctOrder: [
      'Sending memes',
      'Reacting to every message',
      'Voice notes',
      'Leaving read receipts on blast',
      '@everyone',
    ],
  },
  {
    id: 'first-date',
    description: 'Rank from best to worst first-date idea.',
    items: ['Coffee', 'Museum', 'Dinner', 'Mini golf', 'Your apartment'],
    correctOrder: ['Coffee', 'Museum', 'Mini golf', 'Dinner', 'Your apartment'],
  },
  {
    id: 'work-meetings',
    description: 'Rank from most to least necessary meeting format.',
    items: [
      '1:1',
      'Async doc comment',
      'Standup',
      'All-hands',
      'Could have been an email',
    ],
    correctOrder: [
      '1:1',
      'Async doc comment',
      'Standup',
      'All-hands',
      'Could have been an email',
    ],
  },
  {
    id: 'airport-arrival',
    description: 'Rank from smartest to most chaotic airport arrival time.',
    items: ['3 hours early', '2 hours early', '90 minutes', '1 hour', 'When boarding starts'],
    correctOrder: [
      '2 hours early',
      '3 hours early',
      '90 minutes',
      '1 hour',
      'When boarding starts',
    ],
  },
] as const

function startOfLocalDay(date: Date): Date {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day
}

/** Days since RANKED_EPOCH (1-based), using the viewer's local calendar day. */
export function getPuzzleNumber(date: Date = new Date()): number {
  const today = startOfLocalDay(date)
  const epoch = startOfLocalDay(RANKED_EPOCH)
  return Math.floor((today.getTime() - epoch.getTime()) / 86_400_000) + 1
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return hash
}

function createSeededRandom(seed: number): () => number {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleWithSeed<T>(array: readonly T[], seed: number): T[] {
  const result = [...array]
  const random = createSeededRandom(seed)

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/** Deterministic daily prompt — same puzzle number always picks the same prompt. */
export function getDailyPrompt(date: Date = new Date()): Prompt {
  const index = (getPuzzleNumber(date) - 1) % prompts.length
  return prompts[index]!
}

/** Deterministic starting order for today's prompt (same for all players). */
export function getDailyStartOrder(
  prompt: Prompt = getDailyPrompt(),
  date: Date = new Date(),
): string[] {
  const seed = getPuzzleNumber(date) * 997 + hashString(prompt.id)
  return shuffleWithSeed(prompt.items, seed)
}
