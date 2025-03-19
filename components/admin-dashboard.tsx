"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, AlertCircle, Trash2, Edit } from "lucide-react"
import { updateLineStatus, deleteReport } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PasswordProtection } from "@/components/password-protection"

type AdminDashboardProps = {
  lines: any[]
  recentReports: any[]
}

export function AdminDashboard({ lines, recentReports }: AdminDashboardProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("lines")
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedLine, setSelectedLine] = useState<any>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [statusMessage, setStatusMessage] = useState<string>("")

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
          label: "Serviço parado",
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

  const handleUpdateStatus = async () => {
    if (!selectedLine || !newStatus) return

    setIsUpdating(true)

    const result = await updateLineStatus(selectedLine.id, newStatus as any, statusMessage)

    setIsUpdating(false)

    if (result.success) {
      toast({
        title: "Status Updated",
        description: `${selectedLine.name} status has been updated to ${newStatus}.`,
      })
      setStatusDialogOpen(false)

      // Update the line status in the UI
      const updatedLines = lines.map((line) => (line.id === selectedLine.id ? { ...line, status: newStatus } : line))
      lines = updatedLines
    } else {
      toast({
        title: "Error",
        description: "Failed to update line status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm("Certeza que quer deletar esse relatório?")) return

    const result = await deleteReport(reportId)

    if (result.success) {
      toast({
        title: "Relat[orio deletado",
        description: "The report has been deleted successfully.",
      })

      // Update the reports list in the UI
      recentReports = recentReports.filter((report) => report.id !== reportId)
    } else {
      toast({
        title: "Error",
        description: "Erro ao deletar. Tente de novo",
        variant: "destructive",
      })
    }
  }

  return (
    <PasswordProtection>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="lines">Linhas de metrô</TabsTrigger>
            <TabsTrigger value="reports">Relatórios recentes</TabsTrigger>
          </TabsList>

          <TabsContent value="lines">
            <Card>
              <CardHeader>
                <CardTitle>Linhas de metrô</CardTitle>
                <CardDescription>Administrar linhas de metrô e seus status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line) => {
                        const statusDetails = getStatusDetails(line.status)
                        return (
                          <TableRow key={line.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: line.color }}></div>
                                {line.name}
                              </div>
                            </TableCell>
                            <TableCell>{line.color}</TableCell>
                            <TableCell>
                              <Badge className={statusDetails.color}>
                                <span className="flex items-center gap-1">
                                  {statusDetails.icon}
                                  {statusDetails.label}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedLine(line)
                                  setNewStatus(line.status)
                                  setStatusDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Mudar status
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios recentes</CardTitle>
                <CardDescription>Ver e administrar os relatórios enviados pelos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Linha</TableHead>
                        <TableHead>Estação</TableHead>
                        <TableHead>Tipo do problema</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reportado em</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentReports.map((report) => {
                        const statusDetails = getStatusDetails(report.status)
                        return (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: report.line.color }}
                                ></div>
                                {report.line.name}
                              </div>
                            </TableCell>
                            <TableCell>{report.station?.name || "N/A"}</TableCell>
                            <TableCell>{report.issueType}</TableCell>
                            <TableCell>
                              <Badge className={statusDetails.color}>{statusDetails.label}</Badge>
                            </TableCell>
                            <TableCell>{new Date(report.reportedAt).toLocaleString()}</TableCell>
                            <TableCell>{report.description}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteReport(report.id)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mudar Status Da Linha</DialogTitle>
              <DialogDescription>Mudar status operacional da  {selectedLine?.name}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Operação Normal</SelectItem>
                    <SelectItem value="delayed">Atrasos</SelectItem>
                    <SelectItem value="stopped">Serviço parou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="message">Mensagem de status</Label>
                <textarea
                  id="message"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="Escreva uma mensagem de status"
                />
                <p>Recomedação de textos:</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusMessage("Serviço operando normalmente em todas as estações.")}
                  >
                    Operação Normal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusMessage("Atrasos de aproximadamente 5 minutos em todas as estações.")}
                  >
                    Atraso 5min
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusMessage("Serviço interrompido temporariamente. Equipe técnica no local.")}
                  >
                    Serviço Interrompido
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusMessage("Manutenção programada em andamento.")}
                  >
                    Manutenção
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusMessage("Estações cheias.")}
                  >
                    Lotação máxima
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateStatus} disabled={isUpdating || !newStatus}>
                {isUpdating ? "Atualizando..." : "Atualizar Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PasswordProtection>
  )
}

