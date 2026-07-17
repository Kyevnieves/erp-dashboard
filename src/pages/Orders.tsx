import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getOrders, updateOrder } from "@/lib/db"
import { exportOrdersToExcel } from "@/lib/excel"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Download, Search, ShoppingCart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"
import type { Order } from "@/types"

const statusColor: Record<Order["status"], "success" | "warning" | "default" | "destructive"> = {
  completed: "success",
  processing: "warning",
  pending: "default",
  cancelled: "destructive",
}

const statusLabel: Record<Order["status"], string> = {
  completed: "Completada",
  processing: "En Proceso",
  pending: "Pendiente",
  cancelled: "Cancelada",
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { isAdmin } = useAuth()

  useEffect(() => {
    getOrders().then(setOrders).finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase())
  )

  async function handleStatusChange(order: Order, newStatus: Order["status"]) {
    await updateOrder({ ...order, status: newStatus })
    toast.success(`Orden ${order.id} actualizada a "${statusLabel[newStatus]}"`)
    getOrders().then(setOrders)
  }

  const nextStatus: Record<Order["status"], Order["status"]> = {
    pending: "processing",
    processing: "completed",
    completed: "completed",
    cancelled: "cancelled",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Órdenes</h1>
          <p className="text-muted-foreground">Gestiona las órdenes de tus clientes</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => exportOrdersToExcel(orders)}>
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar órdenes..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todas las Órdenes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-lg font-medium mb-1">
                {search ? "Sin resultados" : "No hay órdenes"}
              </p>
              <p className="text-sm">
                {search ? "Intenta con otros términos" : "Las órdenes aparecerán aquí cuando se registren"}
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Items</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium hidden md:table-cell">Fecha</th>
                  {isAdmin && <th className="p-4 font-medium">Acción</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 font-medium">{order.customer}</td>
                    <td className="p-4 hidden sm:table-cell">{order.items.length}</td>
                    <td className="p-4">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <Badge variant={statusColor[order.status]}>{statusLabel[order.status]}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{formatDate(order.createdAt)}</td>
                    {isAdmin && (
                      <td className="p-4">
                        {order.status !== "completed" && order.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(order, nextStatus[order.status])}
                          >
                            {order.status === "pending" ? "Procesar" : "Completar"}
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
