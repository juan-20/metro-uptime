"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"

type LineStatus = "normal" | "delayed" | "stopped"

export interface LineStatusCardProps {
  id: number
  name: string
  code: string
  color: string
  status: LineStatus
  lastUpdated: string
  statusMessage?: string
}

export function LineStatusCard({ id, name, code, color, status, lastUpdated, statusMessage }: LineStatusCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getStatusDetails = (status: LineStatus) => {
    switch (status) {
      case "normal":
        return {
          label: "Normal Operation",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: "bg-green-100 text-green-800",
          defaultMessage: "No issues reported in the last hour.",
        }
      case "delayed":
        return {
          label: "Delays Reported",
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
          color: "bg-amber-100 text-amber-800",
          defaultMessage: "Minor delays reported. Trains are running with increased intervals.",
        }
      case "stopped":
        return {
          label: "Service Stopped",
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          color: "bg-red-100 text-red-800",
          defaultMessage: "Service is currently stopped. Maintenance teams are working to resolve the issue.",
        }
    }
  }

  const statusDetails = getStatusDetails(status)
  const formattedDate = new Date(lastUpdated).toLocaleTimeString()

  return (
    <Card className="overflow-hidden">
      <div className="h-2" style={{ backgroundColor: color }}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{name}</CardTitle>
          <Badge className={statusDetails.color}>
            <span className="flex items-center gap-1">
              {statusDetails.icon}
              {statusDetails.label}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Clock className="h-4 w-4 mr-1" />
          <span>Atualizado as {formattedDate}</span>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2 text-sm">
            {statusMessage ?
             <p>
             {statusMessage}
             </p> : 
              <p>Nenhuma atualização recente, veja detalhes para saber das últimas atualizações</p>
            }
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <button onClick={() => setExpanded(!expanded)} className="text-sm text-primary hover:underline">
          {expanded ? "Mostrar menos" : "Mostrar mais"}
        </button>
        <Link href={`/line/${code}`} className="text-sm text-primary hover:underline">
          Ver detalhes
        </Link>
      </CardFooter>
    </Card>
  )
}

