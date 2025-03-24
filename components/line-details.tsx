"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

type LineDetailsProps = {
  lineData: any
}

type IssueHistoryEntry = {
  time: string; // or whatever type it is
  issues: number; // assuming issues is a number
};

export function LineDetails({ lineData }: LineDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const intervalId = setInterval(updateTime, 1000)
    return () => clearInterval(intervalId)
  }, [])

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "normal":
        return {
          label: "Operação normal",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: "bg-green-100 text-green-800",
        }
      case "delayed":
        return {
          label: "Atrasos reportados",
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
          color: "bg-amber-100 text-amber-800",
        }
      case "stopped":
        return {
          label: "Serviço interompido",
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          color: "bg-red-100 text-red-800",
        }
      default:
        return {
          label: "Desconhecido",
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          color: "bg-gray-100 text-gray-800",
        }
    }
  }

  const statusDetails = getStatusDetails(lineData.status)

  return (
    <div className="mb-8 w-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: lineData.color }}></div>
          <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${statusDetails.color}`}>
            {statusDetails.icon}
            <span className="font-medium">{statusDetails.label}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Atualizado em: {currentTime}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Geral</TabsTrigger>
          <TabsTrigger value="stations">Estações</TabsTrigger>
          <TabsTrigger value="reports">Relatório de usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="">
              <CardHeader>
                <CardTitle>Histórico de problemas</CardTitle>
                <CardDescription>Número de problemas relatados ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                {lineData.issueHistory ? (
                  <ChartContainer 
                    config={{
                      issues: {
                        label: "Issues",
                        color: lineData.color,
                      },
                    }}
                    className="h-80 w-fit"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData.issueHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip
                          content={<ChartTooltipContent indicator="line" nameKey="time" />}
                        />
                        <Line
                          type="monotone"
                          dataKey="issues"
                          stroke={lineData.color}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p>Nenhum dado recente encontrado</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status da Linha</CardTitle>
                <CardDescription>Situação operacional atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Status Atual</h3>
                    <div className={`px-3 py-2 rounded-md ${statusDetails.color}`}>
                      <div className="flex items-center gap-2">
                        {statusDetails.icon}
                        <span className="font-medium">{statusDetails.label}</span>
                      </div>
                      <p className="text-sm mt-1">
                        {lineData.status === "normal"
                          ? "Todos os trens estão no hórario"
                          : lineData.status === "delayed"
                            ? "Os trens estão sofrendo pequenos atrasos."
                            : "O serviço está suspenso no momento. Use rotas alternativas."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Hora de operação</h3>
                    <p className="text-sm">Segunda a sexta: 4:40 AM - 12:00 AM</p>
                    <p className="text-sm">Sábado: 4:40 AM - 1:00 AM</p>
                    <p className="text-sm">Domingo e feriados: 4:40 AM - 12:00 AM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Stations</CardTitle>
              <CardDescription>{lineData.stations.length} estações nessa linha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-6 w-0.5" style={{ backgroundColor: lineData.color }}></div>
                <ul className="space-y-4 relative">
                  {lineData.stations.map((station: any) => (
                    <li key={station.id} className="flex items-center pl-12 relative">
                      <div
                        className="absolute left-4 w-5 h-5 rounded-full border-2 border-white"
                        style={{ backgroundColor: lineData.color }}
                      ></div>
                      <span className="font-medium">{station.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de usuários</CardTitle>
              <CardDescription>Problemas recentes reportados pelos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              {lineData.reports.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sem problemas recentes</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Não tem problemas reportados para essa linha nas ultimas 24 horas. A linha parece estar funcionando normalmente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lineData.reports.map((report: any) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-1 text-xs rounded-full ${
                              report.status === "delayed"
                                ? "bg-amber-100 text-amber-800"
                                : report.status === "stopped"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {report.issueType}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(report.reportedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        {report.station && <span className="text-sm font-medium">{report.station.name}</span>}
                      </div>
                      {report.description && <p className="text-gray-700">{report.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

