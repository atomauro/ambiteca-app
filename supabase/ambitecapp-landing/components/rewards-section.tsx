import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Gift, ShoppingBag, Coffee } from "lucide-react"

const rewards = [
  {
    icon: Gift,
    title: "Productos ecológicos",
    description: "Canjea por productos sostenibles y amigables con el medio ambiente",
    points: "500 puntos",
    category: "Productos",
  },
  {
    icon: Coffee,
    title: "Descuentos en cafeterías",
    description: "Obtén descuentos en cafeterías locales que apoyan el reciclaje",
    points: "200 puntos",
    category: "Descuentos",
  },
  {
    icon: ShoppingBag,
    title: "Cupones de compra",
    description: "Recibe cupones para tiendas que promueven la sostenibilidad",
    points: "300 puntos",
    category: "Cupones",
  },
  {
    icon: Star,
    title: "Experiencias únicas",
    description: "Accede a talleres, eventos y experiencias relacionadas con el medio ambiente",
    points: "1000 puntos",
    category: "Experiencias",
  },
]

export function RewardsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl mb-4">Sistema de recompensas</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Convierte tus acciones de reciclaje en beneficios tangibles y experiencias únicas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {rewards.map((reward, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <reward.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{reward.category}</Badge>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{reward.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{reward.points}</span>
                  <Button size="sm" variant="outline">
                    Canjear
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            Ver todas las recompensas
          </Button>
        </div>
      </div>
    </section>
  )
}
