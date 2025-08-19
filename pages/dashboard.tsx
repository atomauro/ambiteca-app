import { useRouter } from "next/router";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();

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
      <main className="min-h-screen bg-white">
        {ready && authenticated ? (
          <>
            <header className="flex items-center justify-between px-6 sm:px-12 py-4">
              <div className="flex items-center gap-3">
                <Image src="/images/logoambiteca.png" alt="Ambitecapp" width={36} height={36} />
                <span className="font-semibold tracking-wide">AMBITECAPP</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/assistant" className="text-sm underline">Asistente</Link>
                <button onClick={logout} className="text-sm rounded-full bg-gray-100 hover:bg-gray-200 px-4 py-2">Salir</button>
              </div>
            </header>

            <section className="px-6 sm:px-12 pt-16 pb-12 text-center">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Hola, Admin</h1>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Cada material que reciclas cuenta. ¡Haz la diferencia hoy!
              </p>
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
      </main>
    </>
  );
}
