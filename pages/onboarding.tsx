import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <>
      <Head>
        <title>Ambitecapp · Onboarding</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 py-12">
        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm rounded-full bg-gray-100 hover:bg-gray-200 px-4 py-2">Volver</Link>
          <div className="flex items-center gap-3">
            <Image src="/images/logoambiteca.png" alt="Ambitecapp" width={32} height={32} />
            <span className="font-semibold">AMBITECAPP</span>
          </div>
        </header>

        <section className="mt-10 max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold">Onboarding</h1>
          <p className="mt-3 text-gray-600">Completa estos pasos para empezar a reciclar y ganar puntos.</p>

          <ol className="mt-8 space-y-6 list-decimal list-inside">
            <li>Confirma tu perfil y preferencias.</li>
            <li>Conecta un medio de autenticación (email, teléfono o wallet).</li>
            <li>Explora los puntos de reciclaje cercanos.</li>
            <li>Lee las reglas para clasificar y pesar materiales.</li>
          </ol>

          <div className="mt-10 flex gap-4">
            <Link href="/dashboard" className="rounded-full bg-black text-white px-6 py-3 text-sm font-semibold">Empezar</Link>
            <Link href="/" className="rounded-full bg-gray-100 hover:bg-gray-200 px-6 py-3 text-sm font-semibold">Salir</Link>
          </div>
        </section>
      </main>
    </>
  );
}


