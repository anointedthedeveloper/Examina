import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Examina — Anobyte Technologies',
  description: 'School exam portal for teachers, students, and parents by Anobyte Technologies.',
  icons: {
    icon: '/favicon-circle.png',
    apple: '/favicon-circle.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
