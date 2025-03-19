import { getMetroLines, getRecentReports } from "@/app/actions"
import { AdminDashboard } from "@/components/admin-dashboard"
import Link from "next/link"

export default async function AdminPage() {
  const lines = await getMetroLines()
  const recentReports = await getRecentReports(20)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-900 font-medium">
                Início
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard lines={lines} recentReports={recentReports} />
      </main>
    </div>
  )
}

