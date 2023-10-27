import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Secret Space Santa',
  description: 'Web application to manage Secret Santa groups',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const footerStyle = {
    background: 'url("/christmas-trees-footer.png") repeat-x',
  };

  return (
    <html lang="en">
      <body className="{inter.className} min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-repeat-x h-32" style={footerStyle}>
          <p>If you want to contribute to this project, check out <a href="https://github.com/jletellier/secret-space-santa">this Git repository</a> on Github.</p>
        </footer>
      </body>
    </html>
  )
}
