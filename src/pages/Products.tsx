import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import { exportProductsToExcel, importExcel } from "@/lib/excel"
import { useAuth } from "@/contexts/AuthContext"
import { Plus, Pencil, Trash2, Download, Upload, Search, Package as PackageIcon } from "lucide-react"
import { toast } from "react-toastify"
import type { Product } from "@/types"

const defaultProduct = (): Product => ({
  id: crypto.randomUUID(),
  name: "",
  sku: "",
  category: "",
  price: 0,
  stock: 0,
  description: "",
  createdAt: new Date(),
  updatedAt: new Date(),
})

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const { isAdmin } = useAuth()

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    if (editing.id && products.find((p) => p.id === editing.id)) {
      await updateProduct(editing)
      toast.success("Producto actualizado")
    } else {
      await addProduct(editing)
      toast.success("Producto creado")
    }
    setDialogOpen(false)
    setEditing(null)
    getProducts().then(setProducts)
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este producto?")) {
      await deleteProduct(id)
      toast.success("Producto eliminado")
      getProducts().then(setProducts)
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importExcel(file)
      for (const p of imported) await addProduct(p)
      toast.success(`${imported.length} productos importados`)
      getProducts().then(setProducts)
    } catch {
      toast.error("Error al importar")
    }
    if (fileRef.current) fileRef.current.value = ""
  }

  function openNew() {
    setEditing(defaultProduct())
    setDialogOpen(true)
  }

  function openEdit(product: Product) {
    setEditing({ ...product })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <Button size="sm" onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" /> Nuevo
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportProductsToExcel(products)}>
                <Download className="h-4 w-4 mr-2" /> Exportar
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Importar
              </Button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-9 w-full mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PackageIcon className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium mb-1">
            {search ? "Sin resultados" : "No hay productos"}
          </p>
          <p className="text-sm mb-4">
            {search ? "Intenta con otros términos de búsqueda" : "Agrega tu primer producto para empezar"}
          </p>
          {isAdmin && !search && (
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Agregar Producto
            </Button>
          )}
        </div>
      )}

      {/* Product Grid */}
      {!loading && filtered.length > 0 && (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{product.sku}</p>
                </div>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                <span className={`text-sm ${product.stock < 10 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                  Stock: {product.stock}
                </span>
              </div>
              {product.description && (
                <p className="text-xs text-muted-foreground mb-3">{product.description}</p>
              )}
              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-red-500" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id && products.find((p) => p.id === editing.id) ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={editing?.name || ""} onChange={(e) => setEditing((prev) => prev ? { ...prev, name: e.target.value } : null)} required />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={editing?.sku || ""} onChange={(e) => setEditing((prev) => prev ? { ...prev, sku: e.target.value } : null)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input value={editing?.category || ""} onChange={(e) => setEditing((prev) => prev ? { ...prev, category: e.target.value } : null)} required />
              </div>
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input type="number" step="0.01" min="0" value={editing?.price || ""} onChange={(e) => setEditing((prev) => prev ? { ...prev, price: Number(e.target.value) } : null)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min="0" value={editing?.stock ?? ""} onChange={(e) => setEditing((prev) => prev ? { ...prev, stock: Number(e.target.value) } : null)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={editing?.description || ""} onChange={(e) => setEditing((prev) => prev ? { ...prev, description: e.target.value } : null)} />
            </div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
