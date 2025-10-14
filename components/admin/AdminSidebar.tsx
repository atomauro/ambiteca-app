import Link from 'next/link'

export function AdminSidebar() {
  return (
    <aside className="hidden md:block w-60 shrink-0 border-r bg-card/50">
      <div className="px-4 py-4">
        <div className="text-xs text-muted-foreground mb-2">Panel</div>
        <nav className="grid gap-1 text-sm">
          <Link href="/admin" className="px-2 py-1.5 rounded hover:bg-muted">Dashboard</Link>
          <Link href="/admin/users" className="px-2 py-1.5 rounded hover:bg-muted">Usuarios</Link>
          <Link href="/admin/materials" className="px-2 py-1.5 rounded hover:bg-muted">Materiales</Link>
          <Link href="/admin/ambitecas" className="px-2 py-1.5 rounded hover:bg-muted">Ambitecas</Link>
        </nav>

        <div className="mt-6 text-xs text-muted-foreground mb-2">Reportes</div>
        <nav className="grid gap-1 text-sm">
          <a className="px-2 py-1.5 rounded hover:bg-muted cursor-not-allowed opacity-50">Entregas</a>
          <a className="px-2 py-1.5 rounded hover:bg-muted cursor-not-allowed opacity-50">PPV</a>
        </nav>
      </div>
    </aside>
  )
}


