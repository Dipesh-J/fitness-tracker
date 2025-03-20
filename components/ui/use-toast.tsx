// Adapted from shadcn/ui toast component
// https://ui.shadcn.com/docs/components/toast

import React, { useState, createContext, useContext } from "react"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastActionElement = React.ReactElement

export interface ToastProps {
  toast: Toast
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, ...toast }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id)
    }, 5000)
  }

  const dismissToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function ToastContainer() {
  const context = useContext(ToastContext)

  if (!context) {
    return null
  }

  const { toasts, dismissToast } = context

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            w-72 rounded-md p-4 shadow-md 
            ${toast.variant === "destructive" ? "bg-red-500 text-white" : "bg-white border"}
          `}
        >
          {toast.title && <div className="font-semibold">{toast.title}</div>}
          {toast.description && <div className="text-sm">{toast.description}</div>}
          <button
            className="absolute top-2 right-2 text-sm opacity-70 hover:opacity-100"
            onClick={() => dismissToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return {
    toast: context.addToast,
    dismiss: context.dismissToast,
    toasts: context.toasts,
  }
}

// Simplified function for direct imports
export const toast = (props: Omit<Toast, "id">) => {
  // Create a temporary element to render the toast
  const div = document.createElement("div")
  div.style.position = "fixed"
  div.style.bottom = "4rem"
  div.style.right = "1rem"
  div.style.zIndex = "9999"
  div.style.padding = "1rem"
  div.style.background = props.variant === "destructive" ? "#ef4444" : "white"
  div.style.color = props.variant === "destructive" ? "white" : "black"
  div.style.borderRadius = "0.375rem"
  div.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
  div.style.maxWidth = "18rem"
  
  if (props.title) {
    const title = document.createElement("div")
    title.style.fontWeight = "600"
    title.textContent = props.title
    div.appendChild(title)
  }
  
  if (props.description) {
    const description = document.createElement("div")
    description.style.fontSize = "0.875rem"
    description.textContent = props.description
    div.appendChild(description)
  }
  
  document.body.appendChild(div)
  
  // Remove after 5 seconds
  setTimeout(() => {
    div.style.opacity = "0"
    div.style.transition = "opacity 150ms ease-out"
    setTimeout(() => {
      document.body.removeChild(div)
    }, 150)
  }, 5000)
} 