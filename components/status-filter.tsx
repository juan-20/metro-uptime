"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type FilterOption = {
  id: string
  label: string
  checked: boolean
}

export function StatusFilter() {
  const [statusOptions, setStatusOptions] = useState<FilterOption[]>([
    { id: "normal", label: "Normal Operation", checked: true },
    { id: "delayed", label: "Delays", checked: true },
    { id: "stopped", label: "Stopped", checked: true },
  ])

  const [timeOptions, setTimeOptions] = useState<FilterOption[]>([
    { id: "today", label: "Today", checked: true },
    { id: "week", label: "Last 7 days", checked: false },
    { id: "month", label: "Last 30 days", checked: false },
  ])

  const toggleOption = (options: FilterOption[], id: string) => {
    return options.map((option) => (option.id === id ? { ...option, checked: !option.checked } : option))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuGroup>
          {statusOptions.map((option) => (
            <DropdownMenuItem key={option.id} onClick={() => setStatusOptions(toggleOption(statusOptions, option.id))}>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border flex items-center justify-center">
                  {option.checked && <Check className="h-3 w-3" />}
                </div>
                <span>{option.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Time Period</DropdownMenuLabel>
        <DropdownMenuGroup>
          {timeOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => setTimeOptions(timeOptions.map((o) => ({ ...o, checked: o.id === option.id })))}
            >
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border flex items-center justify-center">
                  {option.checked && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span>{option.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

