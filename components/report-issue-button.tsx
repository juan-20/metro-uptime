"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getMetroLines, getStationsByLine, submitIssueReport } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Station = {
  id: number
  name: string
}

type MetroLine = {
  id: number
  name: string
  code: string
}

export function ReportIssueButton() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<MetroLine[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [lineId, setLineId] = useState("")
  const [stationId, setStationId] = useState("")
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLines = async () => {
      const linesData = await getMetroLines()
      setLines(linesData)
    }
    fetchLines()
  }, [])

  useEffect(() => {
    const fetchStations = async () => {
      if (lineId) {
        const stationsData = await getStationsByLine(Number(lineId))
        setStations(stationsData)
      } else {
        setStations([])
      }
      setStationId("")
    }
    fetchStations()
  }, [lineId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append("line", lineId)
    formData.append("issueType", issueType)
    formData.append("description", description)

    // Determine status based on issue type
    let status = "normal"
    if (issueType === "delay") status = "delayed"
    if (issueType === "stopped") status = "stopped"
    formData.append("status", status)

    // Station is optional
    if (stationId) {
      formData.append("station", stationId)
    }

    const result = await submitIssueReport(formData)
    
    setIsSubmitting(false)
    
    if (result.success === true) {
      toast({
        title: "Relatório Enviado",
        description: "Obrigado por seu relatorio. Ele ajudará outros passageiros.",
      })

      // Reset form and close dialog
      setLineId("")
      setStationId("")
      setIssueType("")
      setDescription("")
      setOpen(false)
    } else {
      setError(result.error || "Falha ao enviar seu relatorio. Por favor, tente novamente.")

      // Ensure the error message is displayed
      toast({
        title: "Erro",
        description: result.error || "Falha ao enviar seu relatorio. Por favor, tente novamente.",
        variant: "destructive",
      })
      
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Reportar Problema</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reportar um Problema com o Metrô</DialogTitle>
            <DialogDescription>Ajude outros passageiros reportando problemas com o serviço do metrô.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Você atingiu o limite de reportes</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="line">Linha do Metrô</Label>
              <Select value={lineId} onValueChange={setLineId} required>
                <SelectTrigger id="line">
                  <SelectValue placeholder="Selecione uma linha" />
                </SelectTrigger>
                <SelectContent>
                  {lines.map((line) => (
                    <SelectItem key={line.id} value={line.id.toString()}>
                      {line.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {lineId && (
              <div className="grid gap-2">
                <Label htmlFor="station">Estação (Opcional)</Label>
                <Select value={stationId} onValueChange={setStationId}>
                  <SelectTrigger id="station">
                    <SelectValue placeholder="Selecione uma estação (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id.toString()}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Tipo de Problema</Label>
              <RadioGroup value={issueType} onValueChange={setIssueType} required>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delay" id="delay" />
                  <Label htmlFor="delay">Atraso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stopped" id="stopped" />
                  <Label htmlFor="stopped">Serviço Interrompido</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="crowded" id="crowded" />
                  <Label htmlFor="crowded">Muito Lotado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Outro</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <div className="relative">
                <Textarea
                  id="description"
                  placeholder="Detalhes do problema..."
                  value={description}
                  onChange={(e) => {
                    const newValue = e.target.value.slice(0, 140)
                    setDescription(newValue)
                  }}
                  rows={3}
                  maxLength={140}
                />
                <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                  {description.length}/140
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || !lineId || !issueType || error?.includes("Rate limit exceeded")}
            >
              {isSubmitting ? "Enviando..." : "Enviar Relatório"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

