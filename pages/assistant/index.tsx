import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Recycle } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssistantLanding() {
  const router = useRouter();
  const [ambs, setAmbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ambSel, setAmbSel] = useState<string>("");
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/ambitecas');
        const d = await res.json();
        if (res.ok) setAmbs(d.ambitecas || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);
  const handleEnter = () => router.push({ pathname: "/assistant/home", query: { ambiteca_id: ambSel } });

  return (
    <>
      <Head>
        <title>AMBITECA APP · Asistente</title>
      </Head>
      <div className="min-h-screen bg-background">
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

        <main className="px-4 sm:px-6 lg:px-8 py-12">

        <section className="max-w-2xl mx-auto mt-16 text-center">
          <h1 className="text-4xl font-extrabold">Selecciona la ambiteca</h1>
          <div className="mt-8 space-y-5">
            <div className="mx-auto max-w-xl">
              {loading ? (
                <Skeleton className="h-10 w-full rounded-full" />
              ) : (
                <select value={ambSel} onChange={(e)=>setAmbSel(e.target.value)} className="w-full rounded-full bg-gray-100 px-5 py-3">
                  <option value="">Global</option>
                  {ambs.map((a)=> (<option key={a.id} value={a.id}>{a.name}</option>))}
                </select>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold">Hora de entrada</p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <span className="rounded-full bg-gray-100 px-5 py-3">08</span>
                <span className="font-bold text-2xl">:</span>
                <span className="rounded-full bg-gray-100 px-5 py-3">00</span>
                <span className="rounded-full bg-gray-100 px-5 py-3">am</span>
              </div>
            </div>
            <button onClick={handleEnter} className="rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Entrar</button>
          </div>
        </section>
        </main>
      </div>
    </>
  );
}


