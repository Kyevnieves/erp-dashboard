import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User } from "@/types"
import { toast } from "react-toastify"

const DEMO_USERS: User[] = [
  {
    id: "1",
    name: "Admin",
    email: "admin@erp.com",
    password: "admin123",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Usuario Demo",
    email: "user@erp.com",
    password: "user123",
    role: "user",
    createdAt: new Date("2024-01-01"),
  },
]

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  allUsers: User[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("erp_user")
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback((email: string, password: string): boolean => {
    const found = DEMO_USERS.find((u) => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser as User)
      localStorage.setItem("erp_user", JSON.stringify(safeUser))
      toast.success(`Bienvenido, ${safeUser.name}`)
      return true
    }
    toast.error("Credenciales inválidas")
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("erp_user")
    toast.info("Sesión cerrada")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        allUsers: DEMO_USERS.map(({ password: _, ...u }) => u as User),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
