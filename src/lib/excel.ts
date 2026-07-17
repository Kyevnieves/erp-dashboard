import * as XLSX from "xlsx"
import type { Product, Order } from "@/types"
import { toast } from "react-toastify"

export function exportProductsToExcel(products: Product[]) {
  const data = products.map((p) => ({
    ID: p.id,
    Nombre: p.name,
    SKU: p.sku,
    Categoría: p.category,
    Precio: p.price,
    Stock: p.stock,
    Descripción: p.description || "",
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, "Productos")
  XLSX.writeFile(wb, `productos_${new Date().toISOString().split("T")[0]}.xlsx`)
  toast.success("Productos exportados a Excel")
}

export function exportOrdersToExcel(orders: Order[]) {
  const data = orders.map((o) => ({
    ID: o.id,
    Cliente: o.customer,
    Total: o.total,
    Estado: o.status,
    Fecha: new Date(o.createdAt).toLocaleDateString("es-MX"),
    Items: o.items.length,
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, "Órdenes")
  XLSX.writeFile(wb, `ordenes_${new Date().toISOString().split("T")[0]}.xlsx`)
  toast.success("Órdenes exportadas a Excel")
}

export function importExcel(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<any>(ws)

        const products: Product[] = json.map((row: any, index: number) => ({
          id: `imp-${Date.now()}-${index}`,
          name: row["Nombre"] || row["name"] || row["Name"] || "",
          sku: row["SKU"] || row["sku"] || `SKU-${index}`,
          category: row["Categoría"] || row["category"] || row["Category"] || "General",
          price: Number(row["Precio"] || row["price"] || row["Price"] || 0),
          stock: Number(row["Stock"] || row["stock"] || 0),
          description: row["Descripción"] || row["description"] || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        resolve(products)
      } catch (err) {
        reject(new Error("Error al leer el archivo Excel"))
      }
    }
    reader.onerror = () => reject(new Error("Error al leer el archivo"))
    reader.readAsArrayBuffer(file)
  })
}
