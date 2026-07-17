import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardStats, getOrders, getProducts } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import type { DashboardStats, Order, Product } from "@/types"

const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"]
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [s, orders, prods] = await Promise.all([
        getDashboardStats(),
        getOrders(),
        getProducts(),
      ])
      setStats(s)
      setRecentOrders(orders.slice(0, 5).reverse())
      setProducts(prods)
    } catch (err) {
      setError("Error al cargar datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  const monthlySales = MONTHS.map((month, i) => ({
    name: month,
    ventas: Math.floor(Math.random() * 80000 + 20000) * (i + 1) / 6,
  }))

  const ordersByStatus = [
    { name: "Completadas", value: stats ? Math.floor(stats.totalOrders * 0.45) : 0 },
    { name: "En Proceso", value: stats ? Math.floor(stats.totalOrders * 0.25) : 0 },
    { name: "Pendientes", value: stats ? Math.floor(stats.totalOrders * 0.2) : 0 },
    { name: "Canceladas", value: stats ? Math.floor(stats.totalOrders * 0.1) : 0 },
  ]

  const categoryData = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  const productsByCategory = Object.entries(categoryData).map(([name, value]) => ({
    name,
    cantidad: value,
  }))

  const statusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed": return "success" as const
      case "processing": return "warning" as const
      case "pending": return "default" as const
      case "cancelled": return "destructive" as const
    }
  }

  const statusLabel = (status: Order["status"]) => {
    switch (status) {
      case "completed": return "Completada"
      case "processing": return "En Proceso"
      case "pending": return "Pendiente"
      case "cancelled": return "Cancelada"
    }
  }

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? "#1e293b" : "#fff",
      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      borderRadius: "8px",
      color: isDark ? "#f8fafc" : "#0f172a",
    },
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <button onClick={loadData} className="text-sm text-primary hover:underline">Intentar de nuevo</button>
      </div>
    )
  }

  // --- Loading Skeleton ---
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: "Ventas Totales",
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      change: stats.salesChange,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Órdenes",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: stats.ordersChange,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Productos",
      value: stats.totalProducts.toString(),
      icon: Package,
      change: stats.productsChange,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Usuarios",
      value: stats.totalUsers.toString(),
      icon: Users,
      change: stats.usersChange,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del sistema ERP</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const isPositive = stat.change >= 0
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`flex items-center text-xs mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(stat.change)}% vs mes anterior
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {monthlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <XAxis dataKey="name" tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }} axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }} />
                    <YAxis tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }} axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value) || 0), "Ventas"]} labelStyle={{ color: isDark ? "#f8fafc" : "#0f172a" }} {...tooltipStyle} />
                    <Bar dataKey="ventas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos de ventas</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Órdenes por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {ordersByStatus.some((o) => o.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                      {ordersByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [Number(value) || 0, "Órdenes"]} {...tooltipStyle} />
                    <Legend verticalAlign="bottom" height={36} formatter={(value) => (
                      <span style={{ color: isDark ? "#cbd5e1" : "#475569", fontSize: 12 }}>{value}</span>
                    )} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin órdenes registradas</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Productos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {productsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productsByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <XAxis type="number" tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }} axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }} axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }} width={100} />
                    <Tooltip formatter={(value) => [Number(value) || 0, "Productos"]} {...tooltipStyle} />
                    <Bar dataKey="cantidad" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Sin productos registrados</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Total Productos", value: stats.totalProducts, color: "text-purple-600" },
              { label: "Total Órdenes", value: stats.totalOrders, color: "text-blue-600" },
              { label: "Ventas Totales", value: formatCurrency(stats.totalSales), color: "text-green-600" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Órdenes Recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-4 font-medium">Cliente</th>
                    <th className="p-4 font-medium hidden sm:table-cell">Total</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium hidden md:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4 font-medium">{order.customer}</td>
                      <td className="p-4 hidden sm:table-cell">{formatCurrency(order.total)}</td>
                      <td className="p-4">
                        <Badge variant={statusColor(order.status)}>{statusLabel(order.status)}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mb-2 opacity-40" />
              <p>No hay órdenes registradas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
