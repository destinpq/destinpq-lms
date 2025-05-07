import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from './context/AuthContext'
import { ConfigProvider, App } from 'antd'

// We don't need Inter anymore since we're using Poppins and Playfair Display

export const metadata: Metadata = {
  title: 'Psychology Learning Platform',
  description: 'High-quality psychology workshops, interactive content, and assessments',
  keywords: 'psychology, workshops, learning, mental health, education, online courses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#2d3f7c',
              colorSuccess: '#0c9f6a',
              colorWarning: '#ebb350',
              colorError: '#e45858',
              colorInfo: '#4991e2',
              colorTextBase: '#1a1a2c',
              colorBgBase: '#ffffff',
              borderRadius: 8,
              fontFamily: "'Poppins', sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
            },
            components: {
              Button: {
                colorPrimary: '#2d3f7c',
                algorithm: true,
                borderRadius: 8,
                controlHeight: 44,
                controlHeightLG: 56,
                fontSize: 16,
                fontSizeLG: 18,
              },
              Card: {
                colorBgContainer: '#ffffff',
                borderRadiusLG: 16,
              },
              Input: {
                colorPrimary: '#2d3f7c',
                borderRadius: 8,
                controlHeight: 44,
                controlHeightLG: 56,
              },
              Select: {
                colorPrimary: '#2d3f7c',
                borderRadius: 8,
                controlHeight: 44,
                controlHeightLG: 56,
              },
              Typography: {
                fontWeightStrong: 600,
                fontSizeHeading1: 48,
                fontSizeHeading2: 36,
                fontSizeHeading3: 28,
                fontSizeHeading4: 24,
                fontSizeHeading5: 20,
              }
            },
          }}
        >
          <App>
            <AuthProvider>
              <div className="animate-fadeIn">
                {children}
              </div>
            </AuthProvider>
          </App>
        </ConfigProvider>
      </body>
    </html>
  )
}
