export type Role = "admin" | "user"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  avatar?: string
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  customer: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  salesChange: number
  ordersChange: number
  productsChange: number
  usersChange: number
}
