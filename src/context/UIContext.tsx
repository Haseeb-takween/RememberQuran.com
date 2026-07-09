"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface UIContextValue {
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useLocalStorage("rq-sidebar-open", true)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((v) => !v)
  }, [setSidebarOpen])

  return (
    <UIContext.Provider
      value={{
        commandOpen,
        setCommandOpen,
        mobileNavOpen,
        setMobileNavOpen,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error("useUI must be used within UIProvider")
  return ctx
}
