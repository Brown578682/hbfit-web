'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export type ViewMode = 'manager' | 'coach' | 'member' | 'coach-view'

interface ViewContextType {
  mode: ViewMode
  setMode: (m: ViewMode) => void
  // member impersonation
  impersonatedMemberId: string | null
  impersonatedMemberName: string | null
  impersonateMember: (id: string, name: string) => void
  // coach impersonation
  impersonatedCoachId: string | null
  impersonatedCoachName: string | null
  impersonateCoach: (id: string, name: string) => void
  // shared
  clearImpersonation: () => void
}

const ViewContext = createContext<ViewContextType>({
  mode: 'coach',
  setMode: () => {},
  impersonatedMemberId: null,
  impersonatedMemberName: null,
  impersonateMember: () => {},
  impersonatedCoachId: null,
  impersonatedCoachName: null,
  impersonateCoach: () => {},
  clearImpersonation: () => {},
})

export function ViewProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('coach')
  const [impersonatedMemberId, setImpersonatedMemberId] = useState<string | null>(null)
  const [impersonatedMemberName, setImpersonatedMemberName] = useState<string | null>(null)
  const [impersonatedCoachId, setImpersonatedCoachId] = useState<string | null>(null)
  const [impersonatedCoachName, setImpersonatedCoachName] = useState<string | null>(null)

  const impersonateMember = (id: string, name: string) => {
    setImpersonatedMemberId(id)
    setImpersonatedMemberName(name)
    setImpersonatedCoachId(null)
    setImpersonatedCoachName(null)
    setMode('member')
  }

  const impersonateCoach = (id: string, name: string) => {
    setImpersonatedCoachId(id)
    setImpersonatedCoachName(name)
    setImpersonatedMemberId(null)
    setImpersonatedMemberName(null)
    setMode('coach-view')
  }

  const clearImpersonation = () => {
    setImpersonatedMemberId(null)
    setImpersonatedMemberName(null)
    setImpersonatedCoachId(null)
    setImpersonatedCoachName(null)
    setMode('coach')
  }

  return (
    <ViewContext.Provider value={{
      mode, setMode,
      impersonatedMemberId, impersonatedMemberName, impersonateMember,
      impersonatedCoachId, impersonatedCoachName, impersonateCoach,
      clearImpersonation,
    }}>
      {children}
    </ViewContext.Provider>
  )
}

export const useView = () => useContext(ViewContext)
