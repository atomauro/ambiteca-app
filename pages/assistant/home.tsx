import Head from "next/head";
import Link from "next/link";
import { Recycle } from "lucide-react";
import React from "react";

export default function AssistantHome() {
  return (
    <>
      <Head>
        <title>AMBITECA APP · ¿Qué quieres hacer hoy?</title>
      </Head>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                {React.createElement(Recycle, { className: "h-5 w-5 text-primary-foreground" })}
              </div>
              <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
            </div>

            {/* <nav className="hidden md:flex items-center gap-6">
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
            </nav> */}

            <div className="flex items-center gap-2">
              <Link href="/assistant">
                <button className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Asistente
                </button>
              </Link>
              <Link href="/">
                <button className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors">
                  Volver
                </button>
              </Link>
            </div>
          </div>
        </header>

        <section className="max-w-3xl mx-auto mt-24 text-center px-6 sm:px-12 py-12">
          <h1 className="text-4xl font-extrabold">¿Qué quieres hacer hoy?</h1>
          <div className="mt-10 flex justify-center gap-6">
            <Link href="/assistant/login" className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 font-semibold">Ingresar usuario</Link>
            <Link href="/assistant/register" className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold">Registrar nuevo</Link>
          </div>
          <div className="mt-8">
            <Link href="/assistant/history" className="text-sm underline">Ver historial</Link>
          </div>
          <div className="mt-4">
            <Link href="/assistant/rewards" className="text-sm underline">Puntos y recompensas</Link>
          </div>
        </section>
      </main>
    </>
  );
}


