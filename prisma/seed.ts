import { PrismaClient } from "@prisma/client"
import type { StatusType } from "@prisma/client"

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    // Check if we already have data
    const lineCount = await prisma.metroLine.count()
    if (lineCount > 0) {
      return
    }

    // Create metro lines
    const lines = [
      { name: "Linha 1 - Azul", code: "line1", color: "#0255a5" },
      { name: "Linha 2 - Verde", code: "line2", color: "#007e5e" },
      { name: "Linha 3 - Vermelho", code: "line3", color: "#ee1c25" },
      { name: "Linha 4 - Amarelo", code: "line4", color: "#ffd800" },
      { name: "Linha 5 - Lilás", code: "line5", color: "#8c5e98" },
      { name: "Linha 15 - Prata", code: "line15", color: "#8c8c8c" },
    ]

    for (const line of lines) {
      await prisma.metroLine.create({
        data: line,
      })
    }

    // Create stations for each line
    const stationsData = {
      line1: [
        "Tucuruvi",
        "Parada Inglesa",
        "Jardim São Paulo",
        "Santana",
        "Carandiru",
        "Portuguesa-Tietê",
        "Armênia",
        "Tiradentes",
        "Luz",
        "São Bento",
        "Sé",
        "Liberdade",
        "São Joaquim",
        "Vergueiro",
        "Paraíso",
        "Ana Rosa",
        "Vila Mariana",
        "Santa Cruz",
        "Praça da Árvore",
        "Saúde",
        "São Judas",
        "Conceição",
        "Jabaquara",
      ],
      line2: [
        "Vila Madalena",
        "Sumaré",
        "Clínicas",
        "Consolação",
        "Trianon-Masp",
        "Brigadeiro",
        "Paraíso",
        "Ana Rosa",
        "Chácara Klabin",
        "Santos-Imigrantes",
        "Alto do Ipiranga",
        "Sacomã",
        "Tamanduateí",
        "Vila Prudente",
      ],
      line3: [
        "Palmeiras-Barra Funda",
        "Marechal Deodoro",
        "Santa Cecília",
        "República",
        "Anhangabaú",
        "Sé",
        "Pedro II",
        "Brás",
        "Bresser-Mooca",
        "Belém",
        "Tatuapé",
        "Carrão",
        "Penha",
        "Vila Matilde",
        "Guilhermina-Esperança",
        "Patriarca",
        "Artur Alvim",
        "Corinthians-Itaquera",
      ],
      line4: [
        "Luz",
        "República",
        "Higienópolis-Mackenzie",
        "Paulista",
        "Oscar Freire",
        "Fradique Coutinho",
        "Faria Lima",
        "Pinheiros",
        "Butantã",
        "São Paulo-Morumbi",
        "Vila Sônia",
      ],
      line5: [
        "Capão Redondo",
        "Campo Limpo",
        "Vila das Belezas",
        "Giovanni Gronchi",
        "Santo Amaro",
        "Largo Treze",
        "Adolfo Pinheiro",
        "Alto da Boa Vista",
        "Borba Gato",
        "Brooklin",
        "Campo Belo",
        "Eucaliptos",
        "Moema",
        "AACD-Servidor",
        "Hospital São Paulo",
        "Santa Cruz",
        "Chácara Klabin",
      ],
      line15: [
        "Vila Prudente",
        "Oratório",
        "São Lucas",
        "Camilo Haddad",
        "Vila Tolstói",
        "Vila União",
        "Jardim Planalto",
        "Sapopemba",
        "Fazenda da Juta",
        "São Mateus",
      ],
    }

    for (const [lineCode, stations] of Object.entries(stationsData)) {
      const line = await prisma.metroLine.findUnique({
        where: { code: lineCode },
      })

      if (line) {
        for (let i = 0; i < stations.length; i++) {
          await prisma.station.create({
            data: {
              name: stations[i],
              lineId: line.id,
              position: i + 1,
            },
          })
        }
      }
    }

    // Create initial line statuses
    const lines2 = await prisma.metroLine.findMany()
    for (const line of lines2) {
      // Randomly assign statuses for demo purposes
      const statuses: StatusType[] = ["normal", "delayed", "stopped"]
      const randomStatus = statuses[Math.floor(Math.random() * 3)]

      await prisma.lineStatus.create({
        data: {
          lineId: line.id,
          status: randomStatus,
          isCurrent: true,
        },
      })
    }

    // Create some sample issue reports
    const issueTypes = ["delay", "stopped", "crowded", "technical"]
    const lines3 = await prisma.metroLine.findMany({
      include: { stations: true },
    })

    // Create reports from the last 7 days
    const now = new Date()
    for (let i = 0; i < 50; i++) {
      const randomLine = lines3[Math.floor(Math.random() * lines3.length)]
      const randomStation = randomLine.stations[Math.floor(Math.random() * randomLine.stations.length)]
      const randomIssueType = issueTypes[Math.floor(Math.random() * issueTypes.length)]
      const randomStatus: StatusType =
        randomIssueType === "delay" ? "delayed" : randomIssueType === "stopped" ? "stopped" : "normal"

      // Random time in the last 7 days
      const randomTime = new Date(now.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))

      await prisma.issueReport.create({
        data: {
          lineId: randomLine.id,
          stationId: randomStation.id,
          issueType: randomIssueType,
          description: `Issue reported at ${randomStation.name}`,
          status: randomStatus,
          reportedAt: randomTime,
        },
      })
    }

  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export { seedDatabase }