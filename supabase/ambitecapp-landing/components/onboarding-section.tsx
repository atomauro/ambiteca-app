import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, Scale, TrendingUp, Gift, Recycle } from "lucide-react"

const steps = [
  {
    icon: Smartphone,
    title: "Selecciona el material",
    description: "Elige en la app el tipo de material que vas a reciclar: cartón, papel, plástico, vidrio, etc.",
  },
  {
    icon: Scale,
    title: "Lleva al punto de reciclaje",
    description: "Ve al punto de reciclaje habilitado y pesa tu material con la báscula conectada",
  },
  {
    icon: TrendingUp,
    title: "Registra y gana puntos",
    description: "La app registrará automáticamente el peso y te mostrará cuántos puntos has ganado",
  },
  {
    icon: Recycle,
    title: "Acumula más puntos",
    description: "Sigue reciclando diferentes materiales para acumular más puntos en tu cuenta",
  },
  {
    icon: Gift,
    title: "Canjea recompensas",
    description: "Ve a 'Canjear puntos' y elige entre productos, descuentos o beneficios disponibles",
  },
]

export function OnboardingSection() {
  return (
    <section id="como-funciona" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl mb-4">
            ♻️ ¿Cómo canjear tu reciclaje?
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Sigue estos 5 pasos simples para reciclar, ganar puntos y ayudar al planeta
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-pretty text-sm">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
