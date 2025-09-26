import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Scale, Award, MapPin } from "lucide-react"

const benefits = [
  {
    icon: Leaf,
    title: "Impacto ambiental real",
    description:
      "Cada kilogramo reciclado contribuye directamente a la reducción de residuos y conservación del planeta",
    stat: "Toneladas",
    statLabel: "de residuos procesados",
  },
  {
    icon: Scale,
    title: "Pesaje preciso",
    description: "Básculas conectadas que registran automáticamente el peso exacto de tus materiales reciclados",
    stat: "Precisión",
    statLabel: "en cada pesaje",
  },
  {
    icon: Award,
    title: "Sistema de puntos justo",
    description: "Gana puntos proporcionales al peso y tipo de material reciclado, con recompensas reales",
    stat: "Puntos",
    statLabel: "por cada reciclaje",
  },
  {
    icon: MapPin,
    title: "Puntos de reciclaje cercanos",
    description: "Encuentra fácilmente los puntos de reciclaje habilitados más cercanos a tu ubicación",
    stat: "Ubicaciones",
    statLabel: "disponibles",
  },
]

export function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl mb-4">
            ¿Por qué elegir AmbitecApp?
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Descubre las ventajas de usar nuestra plataforma para reciclar de manera inteligente y efectiva
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground text-pretty mb-4">{benefit.description}</p>
                <div className="border-t pt-4">
                  <div className="text-2xl font-bold text-primary">{benefit.stat}</div>
                  <div className="text-sm text-muted-foreground">{benefit.statLabel}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
