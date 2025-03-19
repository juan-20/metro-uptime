"use client"

// Sample data for the charts
const issuesByLineData = [
  { name: "Line 1", value: 24, fill: "#0255a5" },
  { name: "Line 2", value: 13, fill: "#007e5e" },
  { name: "Line 3", value: 38, fill: "#ee1c25" },
  { name: "Line 4", value: 8, fill: "#ffd800" },
  { name: "Line 5", value: 45, fill: "#8c5e98" },
  { name: "Line 15", value: 12, fill: "#8c8c8c" },
]

const issuesByTypeData = [
  { name: "Delays", value: 65 },
  { name: "Stopped", value: 24 },
  { name: "Overcrowded", value: 42 },
  { name: "Technical", value: 9 },
]

const weeklyTrendData = [
  { day: "Mon", issues: 12 },
  { day: "Tue", issues: 19 },
  { day: "Wed", issues: 15 },
  { day: "Thu", issues: 8 },
  { day: "Fri", issues: 23 },
  { day: "Sat", issues: 10 },
  { day: "Sun", issues: 5 },
]

import { StatisticsContent } from "@/components/statistics-content"
import { getStatistics } from "../actions"

export default async function StatisticsPage() {
  const statistics = await getStatistics()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatisticsContent statistics={statistics} />
      </main>
    </div>
  )
}

