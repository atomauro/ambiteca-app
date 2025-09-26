import { Card, CardContent } from "@/components/ui/card"
import { FileText, Package, Bold as Bottle, Wine, Zap, Droplets, Smartphone } from "lucide-react"

const materials = [
  {
    icon: FileText,
    title: "Papel",
    description: "Hojas usadas, cuadernos, periódicos, revistas, folletos.",
    tip: "Evita papeles sucios o plastificados",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Package,
    title: "Cartón",
    description: "Cajas limpias, empaques, tubos de cartón.",
    tip: "Debe estar seco y sin restos de comida",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Bottle,
    title: "Plástico",
    description: "Botellas, tapas, envases, bolsas.",
    tip: "Lava los envases antes de entregarlos",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Wine,
    title: "Vidrio",
    description: "Botellas, frascos, envases de vidrio.",
    tip: "Evita vidrio roto o espejos",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Zap,
    title: "Metal",
    description: "Latas de gaseosa o cerveza, envases de alimentos.",
    tip: "Aplástalas para facilitar el reciclaje",
    color: "bg-gray-50 text-gray-600",
  },
  {
    icon: Droplets,
    title: "Aceite usado",
    description: "Aceite de cocina almacenado en botellas plásticas.",
    tip: "No mezclar con agua ni otros residuos",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: Smartphone,
    title: "Residuos electrónicos",
    description: "Celulares, cargadores, pilas, pequeños electrodomésticos.",
    tip: "Consulta disponibilidad en tu zona",
    color: "bg-purple-50 text-purple-600",
  },
]

export function MaterialsSection() {
  return (
    <section id="materiales" className="py-20">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl mb-4">
            Tipos de materiales reciclables
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Conoce todos los materiales que puedes reciclar con AmbitecApp y las recomendaciones para cada uno
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {materials.map((material, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${material.color}`}
                >
                  <material.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{material.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{material.description}</p>
                <div className="border-t pt-3">
                  <p className="text-xs text-primary font-medium">💡 {material.tip}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
