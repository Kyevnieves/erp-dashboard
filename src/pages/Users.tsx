import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, User as UserIcon } from "lucide-react"

export default function Users() {
  const { allUsers } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Usuarios</h1>
        <p className="text-muted-foreground">Usuarios registrados en el sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {allUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={user.role === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                  {user.role === "admin" ? (
                    <Shield className="h-3 w-3 mr-1" />
                  ) : (
                    <UserIcon className="h-3 w-3 mr-1" />
                  )}
                  {user.role === "admin" ? "Administrador" : "Usuario"}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  Desde {new Date(user.createdAt).toLocaleDateString("es-MX")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
