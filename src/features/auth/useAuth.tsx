import { useEffect, useState, createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

type AuthContextType = {
  session: Session | null
  user: User | null
  isAdmin: boolean | null // null means loading
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      checkAdminStatus(session?.user?.email)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        checkAdminStatus(session?.user?.email)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async (email?: string) => {
    if (!email) {
      setIsAdmin(false)
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .single()

      if (error || !data) {
        setIsAdmin(false)
      } else {
        setIsAdmin(true)
      }
    } catch {
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
