"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { StatusType } from "@prisma/client"
import { headers } from "next/headers"

export type { StatusType };

export async function getMetroLines() {
  try {
    const lines = await prisma.metroLine.findMany({
      include: {
        lineStatus: {
          where: { isCurrent: true },
          take: 1,
        },
      },
      orderBy: { id: "asc" },
    })

    return lines.map((line) => ({
      id: line.id,
      name: line.name,
      code: line.code,
      color: line.color,
      status: line.lineStatus[0]?.status || "normal",
      message: line.lineStatus[0]?.message || undefined,
    }))
  } catch (error) {
    console.error("Error fetching metro lines:", error)
    return []
  }
}

export async function getLineDetails(code: string) {
  try {
    const line = await prisma.metroLine.findUnique({
      where: { code },
      include: {
        stations: {
          orderBy: { position: "asc" },
        },
        lineStatus: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    })

    if (!line) return null

    // Get issue reports for the last 24 hours
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const reports = await prisma.issueReport.findMany({
      where: {
        lineId: line.id,
        reportedAt: { gte: twentyFourHoursAgo },
      },
      include: {
        station: true,
      },
      orderBy: { reportedAt: "desc" },
    })

    // Get hourly issue counts for the last 12 hours
    const twelveHoursAgo = new Date()
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12)

    const hourlyReports = await prisma.$queryRaw`
      SELECT date_trunc('hour', reported_at) as hour, COUNT(*) as count
      FROM issue_reports
      WHERE line_id = ${line.id} AND reported_at >= ${twelveHoursAgo}
      GROUP BY date_trunc('hour', reported_at)
      ORDER BY hour ASC
    `

    return {
      id: line.id,
      name: line.name,
      code: line.code,
      color: line.color,
      status: line.lineStatus[0]?.status || "normal",
      stations: line.stations,
      reports,
      issueHistory: Array.isArray(hourlyReports)
        ? hourlyReports.map((hr: any) => ({
            time: new Date(hr.hour).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            issues: Number(hr.count), // Ensure count is a number
          }))
        : [], // Return an empty array if no reports
    }
  } catch (error) {
    console.error("Error fetching line details:", error)
    return null
  }
}

export async function getStationsByLine(lineId: number) {
  try {
    const stations = await prisma.station.findMany({
      where: { lineId },
      orderBy: { position: "asc" },
    })
    return stations
  } catch (error) {
    console.error("Error fetching stations:", error)
    return []
  }
}

export async function getStatistics() {
  try {
    // Get issues by line for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const issuesByLine = await prisma.$queryRaw`
      SELECT ml.name, ml.color, COUNT(*) as value
      FROM issue_reports ir
      JOIN metro_lines ml ON ir.line_id = ml.id
      WHERE ir.reported_at >= ${thirtyDaysAgo}
      GROUP BY ml.id, ml.name, ml.color
      ORDER BY value DESC
    `

    // Get issues by type for the last 30 days
    const issuesByType = await prisma.$queryRaw`
      SELECT issue_type as name, COUNT(*) as value
      FROM issue_reports
      WHERE reported_at >= ${thirtyDaysAgo}
      GROUP BY issue_type
      ORDER BY value DESC
    `

    // Get daily issues for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyTrend = await prisma.$queryRaw`
      SELECT 
        to_char(date_trunc('day', reported_at), 'Dy') as day,
        COUNT(*) as issues
      FROM issue_reports
      WHERE reported_at >= ${sevenDaysAgo}
      GROUP BY date_trunc('day', reported_at)
      ORDER BY date_trunc('day', reported_at) ASC
    `

    return {
      issuesByLine: Array.isArray(issuesByLine) ? issuesByLine : [],
      issuesByType: Array.isArray(issuesByType) ? issuesByType : [],
      weeklyTrend: Array.isArray(weeklyTrend) ? weeklyTrend : [],
    }
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return {
      issuesByLine: [],
      issuesByType: [],
      weeklyTrend: [],
    }
  }
}

// Check if user has exceeded rate limit (3 reports per hour)
async function checkRateLimit(ipAddress: string): Promise<{ allowed: boolean; count: number }> {
  const oneHourAgo = new Date()
  oneHourAgo.setHours(oneHourAgo.getHours() - 1)

  // Count submissions in the last hour
  const count = await prisma.reportSubmission.count({
    where: {
      ipAddress,
      submittedAt: { gte: oneHourAgo },
    },
  })

  return { allowed: count < 3, count }
}

export async function submitIssueReport(formData: FormData) {
  try {
    // Get IP address from headers
    const headersList = headers()
    const ipAddress = (await headersList).get("x-forwarded-for") || "unknown"

    // Check rate limit
    const { allowed, count } = await checkRateLimit(ipAddress)

    if (!allowed) {
      return {
        success: false,
        error: `Limite de taxa excedido. Você só pode enviar 3 relatórios por hora. Você enviou ${count} relatórios na última hora.`,
      }
    }

    const lineId = Number(formData.get("line"))
    const issueType = formData.get("issueType") as string
    const description = formData.get("description") as string
    const status = formData.get("status") as StatusType
    const stationIdStr = formData.get("station") as string | null

    // Station is optional
    const stationId = stationIdStr ? Number(stationIdStr) : null

    // Create the issue report
    const report = await prisma.issueReport.create({
      data: {
        lineId,
        stationId,
        issueType,
        description,
        status,
        reportedAt: new Date().toISOString(),
      },
    })

    // Record the submission for rate limiting
    await prisma.reportSubmission.create({
      data: {
        ipAddress: ipAddress as string,
      },
    })

    // Update line status if needed (simplified logic)
    // In a real app, you might want more complex logic to determine status changes
    const recentReports = await prisma.issueReport.findMany({
      where: {
        lineId,
        reportedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    })

    // if there are many recent reports, update the status
    if (recentReports.length >= 5 && status === "stopped") {
      // Close current status
      await prisma.lineStatus.updateMany({
        where: { lineId, isCurrent: true },
        data: { isCurrent: false, endedAt: new Date() },
      })

      // Create new status
      await prisma.lineStatus.create({
        data: {
          lineId,
          status: "stopped",
          isCurrent: true,
        },
      })
    } else if (recentReports.length >= 3 && status === "delayed") {
      const currentStatus = await prisma.lineStatus.findFirst({
        where: { lineId, isCurrent: true },
      })

      if (currentStatus?.status === "normal") {
        // Close current status
        await prisma.lineStatus.updateMany({
          where: { lineId, isCurrent: true },
          data: { isCurrent: false, endedAt: new Date() },
        })

        // Create new status
        await prisma.lineStatus.create({
          data: {
            lineId,
            status: "delayed",
            isCurrent: true,
          },
        })
      }
    }

    revalidatePath("/")
    revalidatePath(`/line/${lineId}`)
    revalidatePath("/statistics")

    return { success: true, report }
  } catch (error) {
    console.error("Error submitting issue report:", error)
    return { success: false, error: "Failed to submit report" }
  }
}

// CRUD operations for admin functionality

export async function createMetroLine(data: { name: string; code: string; color: string }) {
  try {
    const line = await prisma.metroLine.create({
      data: {
        ...data,
        lineStatus: {
          create: {
            status: "normal",
            isCurrent: true,
          },
        },
      },
    })

    revalidatePath("/")
    return { success: true, line }
  } catch (error) {
    console.error("Error creating metro line:", error)
    return { success: false, error: "Failed to create metro line" }
  }
}

export async function updateMetroLine(id: number, data: { name?: string; color?: string }) {
  try {
    const line = await prisma.metroLine.update({
      where: { id },
      data,
    })

    revalidatePath("/")
    revalidatePath(`/line/${line.code}`)
    return { success: true, line }
  } catch (error) {
    console.error("Error updating metro line:", error)
    return { success: false, error: "Failed to update metro line" }
  }
}

export async function updateLineStatus(lineId: number, status: StatusType, message?: string) {
  try {
    // First update the current status to not current
    await prisma.lineStatus.updateMany({
      where: {
        lineId,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    })

    // Create new status
    const lineStatus = await prisma.lineStatus.create({
      data: {
        lineId,
        status,
        message: message || null, 
        isCurrent: true,
      },
      include: {
        line: true,
      },
    })

    revalidatePath("/")
    revalidatePath(`/line/${lineStatus.line.code}`)
    revalidatePath("/statistics")

    return { success: true, lineStatus }
  } catch (error) {
    console.error("Error updating line status:", error)
    return { success: false, error: "Failed to update line status" }
  }
}

export async function createStation(data: { name: string; lineId: number; position: number }) {
  try {
    const station = await prisma.station.create({
      data,
    })

    const line = await prisma.metroLine.findUnique({
      where: { id: data.lineId },
    })

    if (line) {
      revalidatePath(`/line/${line.code}`)
    }

    return { success: true, station }
  } catch (error) {
    console.error("Error creating station:", error)
    return { success: false, error: "Failed to create station" }
  }
}

export async function updateStation(id: number, data: { name?: string; position?: number }) {
  try {
    const station = await prisma.station.update({
      where: { id },
      data,
      include: {
        line: true,
      },
    })

    revalidatePath(`/line/${station.line.code}`)
    return { success: true, station }
  } catch (error) {
    console.error("Error updating station:", error)
    return { success: false, error: "Failed to update station" }
  }
}

export async function deleteReport(id: number) {
  try {
    const report = await prisma.issueReport.delete({
      where: { id },
      include: {
        line: true,
      },
    })

    revalidatePath("/")
    revalidatePath(`/line/${report.line.code}`)
    revalidatePath("/statistics")

    return { success: true }
  } catch (error) {
    console.error("Error deleting report:", error)
    return { success: false, error: "Failed to delete report" }
  }
}

export async function getRecentReports(limit = 10) {
  try {
    const reports = await prisma.issueReport.findMany({
      take: limit,
      orderBy: {
        reportedAt: "desc",
      },
      include: {
        line: true,
        station: true,
      },
    })

    // Convert timestamps to local timezone when displaying
    return reports.map(report => ({
      ...report,
      reportedAt: new Date(report.reportedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    }))
  } catch (error) {
    console.error("Error fetching recent reports:", error)
    return []
  }
}

