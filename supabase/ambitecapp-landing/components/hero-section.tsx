import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Recycle } from "lucide-react"

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 py-20 lg:py-32"
    >
      <div className="container px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido de texto */}
            <div className="text-center lg:text-left">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary-foreground border border-primary/30">
                <Recycle className="h-4 w-4" />
                Únete al cambio ambiental
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Recicla, gana puntos y ayuda al planeta
              </h1>

              <p className="mb-8 text-lg text-muted-foreground text-pretty max-w-2xl lg:max-w-none">
                Cada material que reciclas cuenta. Convierte tus acciones ambientales en recompensas mientras
                contribuyes a un futuro más sostenible. ¡Haz la diferencia hoy!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Crear cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
                >
                  Iniciar sesión
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/persona-feliz-reciclando-materiales-en-punto-de-re.jpg"
                  alt="Persona reciclando materiales en AmbitecApp"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Elementos decorativos */}
              <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-primary/20 blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-secondary/20 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
