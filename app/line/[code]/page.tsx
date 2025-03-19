import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LineDetails } from "@/components/line-details"
import { getLineDetails } from "@/app/actions"
import { notFound } from "next/navigation"

export default async function LinePage({ params }: { params: { code: string } }) {
  const lineData = await getLineDetails(params.code)

  if (!lineData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{lineData.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LineDetails lineData={lineData} />
      </main>
    </div>
  )
}