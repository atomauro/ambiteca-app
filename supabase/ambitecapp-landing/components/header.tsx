import { Button } from "@/components/ui/button"
import { Recycle } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Recycle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#inicio"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Inicio
          </a>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cómo funciona
          </a>
          <a
            href="#beneficios"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Beneficios
          </a>
          <a
            href="#contacto"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contacto
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Asistente
          </Button>
          <Button variant="ghost" size="sm">
            Administrador
          </Button>
        </div>
      </div>
    </header>
  )
}
