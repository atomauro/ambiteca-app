import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gift, Users, MapPin } from "lucide-react"

export function PromotionalBanner() {
  const promotions = [
    {
      icon: Users,
      title: "Marcas Aliadas",
      description: "Descubre productos sostenibles de nuestras marcas partner",
      badge: "Nuevo",
      color: "bg-blue-500",
    },
    {
      icon: Calendar,
      title: "Eventos Educativos",
      description: "Talleres y charlas sobre reciclaje y sostenibilidad",
      badge: "Próximamente",
      color: "bg-green-500",
    },
    {
      icon: MapPin,
      title: "Jornadas de Reciclaje",
      description: "Participa en la recuperación de espacios comunitarios",
      badge: "Activo",
      color: "bg-orange-500",
    },
    {
      icon: Gift,
      title: "Productos de Canje",
      description: "Intercambia tus puntos por productos ecológicos",
      badge: "Popular",
      color: "bg-purple-500",
    },
  ]

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Descubre más con AmbitecApp</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora todas las oportunidades para hacer la diferencia y obtener beneficios por tu compromiso ambiental
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotions.map((promo, index) => {
            const IconComponent = promo.icon
            return (
              <div
                key={index}
                className="relative group bg-background rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${promo.color}/10`}>
                    <IconComponent
                      className={`h-6 w-6 text-white`}
                      style={{ color: promo.color.replace("bg-", "").replace("-500", "") }}
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {promo.badge}
                  </Badge>
                </div>

                <h3 className="font-semibold mb-2 text-lg">{promo.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{promo.description}</p>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                >
                  Explorar
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
