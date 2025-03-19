import Link from "next/link"
import { LineStatusCard, LineStatusCardProps } from "@/components/line-status-card"
import { StatusFilter } from "@/components/status-filter"
import { ReportIssueButton } from "@/components/report-issue-button"
import { getMetroLines, StatusType } from "./actions"
import { format } from 'date-fns-tz'

// Define the type for the metro line
interface MetroLine {
  id: number;
  name: string;
  code: string;
  color: string;
  status: StatusType;
  message?: string;
}

export default async function Home() {
  const lines = await getMetroLines();
  const timeZone = 'America/Sao_Paulo';
  const cacheDuration = 5 * 60 * 1000;
  const lastUpdated = new Date().getTime();
  const nextUpdate = new Date(lastUpdated + cacheDuration);
  const initialTimeLeft = nextUpdate.getTime() - lastUpdated;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Status do Metrô de São Paulo</h1>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-900 font-medium">
                Início
              </Link>
              <Link href="/admin" className="text-gray-500 hover:text-gray-900">
                Admin
              </Link>
              {/* <Link href="/about" className="text-gray-500 hover:text-gray-900">
                Sobre
              </Link> */}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Status Atual</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* TODO: Add filter status */}
            {/* <StatusFilter /> */}
            <ReportIssueButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lines.map((line) => (
            <LineStatusCard
              key={line.id}
              id={line.id}
              name={line.name}
              code={line.code}
              color={line.color}
              status={line.status}
              statusMessage={line.message ?? ''}
              lastUpdated={new Date().toISOString()}
            />
          ))}
        </div>
      </main>

      <footer className="bg-white border-t mt-12 flex justify-center align-bottom w-full bottom-0 sticky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500">
          Este é um serviço não oficial. Os dados são crowdsourced de relatórios de usuários.
          </p>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const updateCountdown = () => {
            const nextUpdateElement = document.getElementById('next-update');
            let timeLeft = ${initialTimeLeft};
            setInterval(() => {
              timeLeft -= 1000;
              const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
              nextUpdateElement.textContent = 'Próxima atualização em: ' + minutes + 'm ' + seconds + 's';
            }, 1000);
          };
          updateCountdown();
        })();
      `}} />
    </div>
  );
}

