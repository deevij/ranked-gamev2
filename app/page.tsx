'use client'

import { useState } from 'react'

const correctOrder = [
  'ChatGPT',
  'Reddit',
  'TikTok',
  'LinkedIn',
  'X',
]

export default function Home() {
  const [items, setItems] = useState([
    'TikTok',
    'LinkedIn',
    'ChatGPT',
    'X',
    'Reddit',
  ])

  const [result, setResult] = useState('')

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]

    if (direction === 'up' && index > 0) {
      ;[newItems[index], newItems[index - 1]] = [
        newItems[index - 1],
        newItems[index],
      ]
    }

    if (direction === 'down' && index < items.length - 1) {
      ;[newItems[index], newItems[index + 1]] = [
        newItems[index + 1],
        newItems[index],
      ]
    }

    setItems(newItems)
  }

  const calculateScore = () => {
    let score = 0

    items.forEach((item, index) => {
      if (item === correctOrder[index]) {
        score += 1
      }
    })

    if (score === 5) {
      setResult('🧠 PERFECTLY CALIBRATED')
    } else if (score >= 4) {
      setResult('🔥 YOU READ THE ROOM')
    } else if (score >= 3) {
      setResult('⚡ MOSTLY TUNED IN')
    } else if (score >= 2) {
      setResult('🌪 SLIGHTLY OUT OF SYNC')
    } else {
      setResult('💀 AGGRESSIVELY OFFLINE')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold mb-2">Ranked</h1>

        <p className="text-gray-400 mb-8">
          Rank from most socially acceptable to admit using daily.
        </p>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item}
              className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="font-medium">{item}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => moveItem(index, 'up')}
                  className="bg-zinc-700 px-3 py-1 rounded-lg"
                >
                  ↑
                </button>

                <button
                  onClick={() => moveItem(index, 'down')}
                  className="bg-zinc-700 px-3 py-1 rounded-lg"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={calculateScore}
          className="w-full mt-6 bg-white text-black font-bold py-4 rounded-2xl"
        >
          Submit Ranking
        </button>

        {result && (
          <div className="mt-6 bg-zinc-900 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold">{result}</p>
          </div>
        )}
      </div>
    </main>
  )
}