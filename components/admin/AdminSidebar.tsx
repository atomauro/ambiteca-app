import Link from 'next/link'
import { LayoutDashboard, Users2, Package, Building2, Truck, Coins } from 'lucide-react'

export function AdminSidebar() {
  return (
    <aside className="hidden md:block w-60 shrink-0 border-r bg-card/50">
      <div className="px-4 py-4">
        <div className="text-xs text-muted-foreground mb-2">Panel</div>
        <nav className="grid gap-1 text-sm">
          <Link href="/admin" className="px-2 py-1.5 rounded hover:bg-muted inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> <span>Dashboard</span></Link>
          <Link href="/admin/users" className="px-2 py-1.5 rounded hover:bg-muted inline-flex items-center gap-2"><Users2 className="h-4 w-4" /> <span>Usuarios</span></Link>
          <Link href="/admin/materials" className="px-2 py-1.5 rounded hover:bg-muted inline-flex items-center gap-2"><Package className="h-4 w-4" /> <span>Materiales</span></Link>
          <Link href="/admin/ambitecas" className="px-2 py-1.5 rounded hover:bg-muted inline-flex items-center gap-2"><Building2 className="h-4 w-4" /> <span>Ambitecas</span></Link>
        </nav>

        <div className="mt-6 text-xs text-muted-foreground mb-2">Reportes</div>
        <nav className="grid gap-1 text-sm">
          <a className="px-2 py-1.5 rounded hover:bg-muted cursor-not-allowed opacity-50 inline-flex items-center gap-2"><Truck className="h-4 w-4" /> <span>Entregas</span></a>
          <a className="px-2 py-1.5 rounded hover:bg-muted cursor-not-allowed opacity-50 inline-flex items-center gap-2"><Coins className="h-4 w-4" /> <span>PPV</span></a>
        </nav>
      </div>
    </aside>
  )
}


