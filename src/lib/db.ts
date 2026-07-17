import { openDB, type IDBPDatabase } from "idb"
import type { Product, Order, DashboardStats } from "@/types"

const DB_NAME = "erp_dashboard"
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "id" })
          store.createIndex("sku", "sku", { unique: true })
          store.createIndex("category", "category", { unique: false })
        }
        if (!db.objectStoreNames.contains("orders")) {
          const store = db.createObjectStore("orders", { keyPath: "id" })
          store.createIndex("status", "status", { unique: false })
          store.createIndex("createdAt", "createdAt", { unique: false })
        }
        if (!db.objectStoreNames.contains("backup")) {
          db.createObjectStore("backup", { keyPath: "id" })
        }
      },
    })
  }
  return dbPromise
}

// Seed data for offline-first
const SEED_PRODUCTS: Product[] = [
  { id: "p1", name: "Laptop Pro", sku: "LAP-001", category: "Electrónicos", price: 25999.99, stock: 15, description: "Laptop de alta gama", createdAt: new Date(), updatedAt: new Date() },
  { id: "p2", name: "Monitor 27\"", sku: "MON-001", category: "Electrónicos", price: 5499.99, stock: 30, description: "Monitor 4K", createdAt: new Date(), updatedAt: new Date() },
  { id: "p3", name: "Teclado Mecánico", sku: "TEC-001", category: "Periféricos", price: 1299.99, stock: 50, createdAt: new Date(), updatedAt: new Date() },
  { id: "p4", name: "Mouse Inalámbrico", sku: "MOU-001", category: "Periféricos", price: 599.99, stock: 80, createdAt: new Date(), updatedAt: new Date() },
  { id: "p5", name: "Escritorio Eléctrico", sku: "ESC-001", category: "Muebles", price: 8499.99, stock: 10, createdAt: new Date(), updatedAt: new Date() },
  { id: "p6", name: "Silla Ergonómica", sku: "SIL-001", category: "Muebles", price: 12499.99, stock: 8, createdAt: new Date(), updatedAt: new Date() },
  { id: "p7", name: "Webcam HD", sku: "WEB-001", category: "Periféricos", price: 1499.99, stock: 25, createdAt: new Date(), updatedAt: new Date() },
  { id: "p8", name: "Audífonos Bluetooth", sku: "AUD-001", category: "Audio", price: 2199.99, stock: 35, createdAt: new Date(), updatedAt: new Date() },
]

const SEED_ORDERS: Order[] = [
  { id: "o1", customer: "Juan Pérez", items: [{ productId: "p1", productName: "Laptop Pro", quantity: 1, price: 25999.99 }], total: 25999.99, status: "completed", createdAt: new Date("2024-06-01") },
  { id: "o2", customer: "María García", items: [{ productId: "p3", productName: "Teclado Mecánico", quantity: 2, price: 1299.99 }], total: 2599.98, status: "processing", createdAt: new Date("2024-06-05") },
  { id: "o3", customer: "Carlos López", items: [{ productId: "p6", productName: "Silla Ergonómica", quantity: 1, price: 12499.99 }], total: 12499.99, status: "pending", createdAt: new Date("2024-06-10") },
  { id: "o4", customer: "Ana Martínez", items: [{ productId: "p2", productName: "Monitor 27\"", quantity: 2, price: 5499.99 }, { productId: "p4", productName: "Mouse Inalámbrico", quantity: 1, price: 599.99 }], total: 11599.97, status: "completed", createdAt: new Date("2024-06-12") },
  { id: "o5", customer: "Roberto Díaz", items: [{ productId: "p8", productName: "Audífonos Bluetooth", quantity: 1, price: 2199.99 }], total: 2199.99, status: "cancelled", createdAt: new Date("2024-06-15") },
]

async function initializeData() {
  const db = await getDB()
  const count = await db.count("products")
  if (count === 0) {
    const tx = db.transaction(["products", "orders"], "readwrite")
    for (const p of SEED_PRODUCTS) await tx.objectStore("products").add(p)
    for (const o of SEED_ORDERS) await tx.objectStore("orders").add(o)
    await tx.done
  }
}

// Product operations
export async function getProducts(): Promise<Product[]> {
  await initializeData()
  const db = await getDB()
  return db.getAll("products")
}

export async function addProduct(product: Product): Promise<void> {
  const db = await getDB()
  await db.add("products", product)
}

export async function updateProduct(product: Product): Promise<void> {
  const db = await getDB()
  await db.put("products", product)
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("products", id)
}

// Order operations
export async function getOrders(): Promise<Order[]> {
  await initializeData()
  const db = await getDB()
  return db.getAll("orders")
}

export async function addOrder(order: Order): Promise<void> {
  const db = await getDB()
  await db.add("orders", order)
}

export async function updateOrder(order: Order): Promise<void> {
  const db = await getDB()
  await db.put("orders", order)
}

// Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const [products, orders] = await Promise.all([getProducts(), getOrders()])

  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === "completed")
  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0)
  const totalProducts = products.length
  const totalUsers = 2

  return {
    totalSales,
    totalOrders,
    totalProducts,
    totalUsers,
    salesChange: 12.5,
    ordersChange: -3.2,
    productsChange: 8.1,
    usersChange: 0,
  }
}

// Backup / Export
export async function exportToJSON() {
  const [products, orders] = await Promise.all([getProducts(), getOrders()])
  return { products, orders, exportedAt: new Date().toISOString() }
}

export async function importFromJSON(data: { products: Product[]; orders: Order[] }) {
  const db = await getDB()
  const tx = db.transaction(["products", "orders"], "readwrite")
  
  // Clear and re-add
  await tx.objectStore("products").clear()
  await tx.objectStore("orders").clear()
  
  for (const p of data.products) await tx.objectStore("products").add(p)
  for (const o of data.orders) await tx.objectStore("orders").add(o)
  await tx.done
}
