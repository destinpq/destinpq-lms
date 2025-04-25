import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from './context/AuthContext'
import { ConfigProvider } from 'antd'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Psychology Workshop LMS',
  description: 'Learning Management System for Psychology Workshops',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 6,
              fontFamily: inter.style.fontFamily,
            },
            components: {
              Button: {
                colorPrimary: '#1890ff',
                algorithm: true,
              },
              Card: {
                colorBgContainer: '#ffffff',
              },
            },
          }}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}
