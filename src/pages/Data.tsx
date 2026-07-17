import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { exportToJSON, importFromJSON } from "@/lib/db"
import { getProducts } from "@/lib/db"
import { exportProductsToExcel, importExcel } from "@/lib/excel"
import { useAuth } from "@/contexts/AuthContext"
import { Download, Upload, Database, FileSpreadsheet, AlertTriangle } from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

export default function Data() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  if (!isAdmin) {
    navigate("/dashboard")
    return null
  }

  async function handleBackup() {
    const data = await exportToJSON()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `erp_backup_${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Backup descargado")
  }

  async function handleRestore() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (!data.products || !data.orders) {
          toast.error("Formato de backup inválido")
          return
        }
        await importFromJSON(data)
        toast.success("Backup restaurado exitosamente")
      } catch {
        toast.error("Error al restaurar backup")
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Gestión de Datos</h1>
        <p className="text-muted-foreground">Backup, restauración e importación de datos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-3">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Backup JSON</CardTitle>
                <CardDescription>Respaldo completo de productos y órdenes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={handleBackup}>
              <Download className="h-4 w-4 mr-2" /> Descargar Backup
            </Button>
            <Button className="w-full" variant="outline" onClick={handleRestore}>
              <Upload className="h-4 w-4 mr-2" /> Restaurar Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3">
                <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Importar/Exportar Excel</CardTitle>
                <CardDescription>Productos desde/a archivos .xlsx</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline" onClick={async () => {
              const products = await getProducts()
              exportProductsToExcel(products)
            }}>
              <Download className="h-4 w-4 mr-2" /> Exportar Productos a Excel
            </Button>
            <Button className="w-full" variant="outline" onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = ".xlsx,.xls"
              input.onchange = async (e: any) => {
                const file = e.target?.files?.[0]
                if (!file) return
                try {
                  const products = await importExcel(file)
                  const { addProduct } = await import("@/lib/db")
                  for (const p of products) await addProduct(p)
                  toast.success(`${products.length} productos importados`)
                } catch {
                  toast.error("Error al importar")
                }
              }
              input.click()
            }}>
              <Upload className="h-4 w-4 mr-2" /> Importar Productos desde Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-200 dark:border-yellow-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-sm font-medium">Información</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Todos los datos se almacenan localmente en IndexedDB. 
            Los backups en JSON incluyen productos y órdenes completas.
            Los archivos Excel se pueden importar/exportar usando las columnas: 
            Nombre, SKU, Categoría, Precio, Stock, Descripción.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
