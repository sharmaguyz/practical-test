'use client'

import { createContext, useContext, useState } from 'react'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
  title: string
  message: string
  type: NotificationType
  show: boolean
}

interface NotificationContextType {
  notification: Notification
  showNotification: (title: string, message: string, type?: NotificationType) => void
  hideNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<Notification>({
    title: '',
    message: '',
    type: 'success',
    show: false
  })

  const showNotification = (title: string, message: string, type: NotificationType = 'success') => {
    setNotification({ title, message, type, show: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}