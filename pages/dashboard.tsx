import React from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Link from "next/link";
import { useUserSync } from "@/lib/hooks/useUserSync";
import { Recycle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, logout, user } = usePrivy();
  const { userProfile, isLoading: profileLoading } = useUserSync();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>AMBITECA APP</title>
      </Head>
      <div className="min-h-screen bg-background">
        {ready && authenticated ? (
          <>
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    {React.createElement(Recycle, { className: "h-5 w-5 text-primary-foreground" })}
                  </div>
                  <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                  <a
                    href="/#inicio"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Inicio
                  </a>
                  <a
                    href="/#beneficios"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Beneficios
                  </a>
                  <a
                    href="/#materiales"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Materiales
                  </a>
                </nav>

                <div className="flex items-center gap-2">
                  <Link href="/assistant">
                    <button className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors">
                      Asistente
                    </button>
                  </Link>
                  <Link href="/admin">
                    <button className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors">
                      Admin
                    </button>
                  </Link>
                  <button 
                    onClick={logout}
                    className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </header>

            <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Hola, {userProfile?.full_name || user?.google?.name || 'Usuario'}
              </h1>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Cada material que reciclas cuenta. ¡Haz la diferencia hoy!
              </p>
              {userProfile && (
                <div className="mt-4 text-sm text-gray-500">
                  Rol: <span className="font-semibold capitalize">{userProfile.role}</span>
                </div>
              )}
              <div className="mt-8 flex justify-center gap-4">
                <button className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-sm font-semibold">Iniciar sesión</button>
                <button className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-sm font-semibold">Crear cuenta</button>
              </div>
            </section>

            <section className="px-6 sm:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="aspect-video bg-gray-200 rounded-md grid place-items-center">
                <div className="w-0 h-0 border-t-[18px] border-t-transparent border-l-[28px] border-l-gray-500 border-b-[18px] border-b-transparent" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">¿Cómo canjear tu reciclaje?</h2>
                <ol className="mt-6 space-y-4 list-decimal list-inside text-gray-700">
                  <li>Selecciona el material que vas a reciclar en la app: cartón, papel, plástico, vidrio, etc.</li>
                  <li>Lleva el material al punto de reciclaje habilitado y pésalo con la ayuda de la báscula conectada.</li>
                  <li>La app registrará el peso y te mostrará cuántos puntos has ganado.</li>
                  <li>Acumula puntos cada vez que recicles.</li>
                  <li>Cuando tengas suficientes puntos, ve a “Canjear puntos” y elige entre productos o beneficios.</li>
                  <li>¡Confirma tu canje y listo! Estás ayudando al planeta y ganando recompensas.</li>
                </ol>
              </div>
            </section>

            <section className="px-6 sm:px-12 py-12">
              <h2 className="text-2xl font-extrabold">Tipos de material reciclable</h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                  { title: "Papel", desc: "Hojas usadas, cuadernos, periódicos, revistas, folletos. Evita papeles sucios o plastificados." },
                  { title: "Cartón", desc: "Cajas limpias, empaques, tubos de cartón. Debe estar seco y sin restos de comida." },
                  { title: "Plástico", desc: "Envases limpios, botellas y tapas. Evita plásticos sucios o con residuos." },
                  { title: "Vidrio", desc: "Botellas y frascos. Evita vidrio roto o espejos." },
                  { title: "Metal", desc: "Latas de gaseosa o cerveza, envases de alimentos. Aplástalas para facilitar el reciclaje." },
                  { title: "Aceite usado", desc: "Aceite de cocina en botellas plásticas. No mezclar con agua ni otros residuos." },
                  { title: "Residuos electrónicos", desc: "Celulares, cargadores, pilas, pequeños electrodomésticos." },
                ].map((item) => (
                  <div key={item.title} className="grid grid-cols-[120px_1fr] items-start gap-6">
                    <div className="w-[120px] h-[90px] bg-gray-200 rounded" />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-700 mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="px-6 sm:px-12 pb-16">
              <button onClick={() => router.push("/onboarding")} className="w-full sm:w-auto block mx-auto rounded-full bg-black text-white px-6 py-3 text-sm font-semibold">
                Onboarding
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
