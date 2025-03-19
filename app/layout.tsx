import type { Metadata } from 'next'
import { PostHogProvider } from './providers'
import './globals.css'
import ProgressBar from '@/components/ProgressBar';

export const metadata: Metadata = {
  title: 'metro-uptime',
  description: 'Veja o status das linhas de metrô em tempo real',
  icons: ['https://media.discordapp.net/attachments/897676728288288808/1351945109502951548/metro_1f687.png?ex=67dc3880&is=67dae700&hm=49755d4a2cda5e9ae88f75066af3b08bfb67cfbc9850f9e8886e889f778b35ab&=&format=webp&quality=lossless'],
  openGraph: {
    images: ['https://media.discordapp.net/attachments/897676728288288808/1351945109502951548/metro_1f687.png?ex=67dc3880&is=67dae700&hm=49755d4a2cda5e9ae88f75066af3b08bfb67cfbc9850f9e8886e889f778b35ab&=&format=webp&quality=lossless'],
  },
  twitter: {
    images: ['https://media.discordapp.net/attachments/897676728288288808/1351945109502951548/metro_1f687.png?ex=67dc3880&is=67dae700&hm=49755d4a2cda5e9ae88f75066af3b08bfb67cfbc9850f9e8886e889f778b35ab&=&format=webp&quality=lossless']
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-br">
      <ProgressBar />
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
