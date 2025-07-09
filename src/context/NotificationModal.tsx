// components/NotificationModal.tsx
'use client'

import { useNotification } from '@/context/NotificationContext'
import { useEffect } from 'react'

export const NotificationModal = () => {
  const { notification, hideNotification } = useNotification()

  // Convert message with <br> and \n to React nodes
  const formatMessage = (message: string) => {
    return message.split('\n').map((paragraph, i) => (
      <p key={i} className="mb-2 last:mb-0">
        {paragraph.split('<br>').map((line, j) => (
          <span key={j}>
            {line}
            {j < paragraph.split('<br>')?.length - 1 && <br />}
          </span>
        ))}
      </p>
    ))
  }

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        hideNotification()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.show, hideNotification])

  if (!notification.show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={hideNotification}
      />

      <div className="relative w-full max-w-lg rounded-lg shadow-xl bg-white dark:bg-gray-800 min-h-60 text-center flex items-center justify-center text-lg p-4">
        {/* <div className={`p-4 border-b dark:border-gray-700 ${
          notification.type === 'success' ? 'bg-green-100 dark:bg-green-900 success-alert-show' :
          notification.type === 'error' ? 'bg-red-100 dark:bg-red-900' :
          notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
          'bg-blue-100 dark:bg-blue-900'
        }`}>
          <h3 className="text-lg font-bold dark:text-white">{notification.title}</h3>
        </div> */}
        <button
          onClick={hideNotification}
          className="absolute -top-2 -right-2 rounded-full flex items-center justify-center text-white bg-gray-600 hover:bg-gray-700 alert-btn-color text-sm button-cross-modal">
          x
        </button>

        <div className="p-4">
          <div className="text-gray-800 dark:text-gray-200">
            {formatMessage(notification.message)}
          </div>
        </div>

        {/* <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-700">

        </div> */}
      </div>
    </div>
  )
}