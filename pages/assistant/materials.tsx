import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  ppv_per_kg: number;
  image_url?: string;
}

export default function MaterialsPage() {
  const router = useRouter();
  const name = (router.query.name as string) || "Asistente";
  const ambitecaId = (router.query.ambiteca_id as string) || "";
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/admin/materials', window.location.origin);
        if (ambitecaId) url.searchParams.set('ambiteca_id', ambitecaId);
        const res = await fetch(url.toString());
        const d = await res.json();
        if (res.ok) setMaterials((d.materials || []) as MaterialItem[]);
      } finally { setLoading(false); }
    };
    load();
  }, [ambitecaId]);

  const goTo = (m: MaterialItem) => {
    router.push({ pathname: "/assistant/scale", query: { ...router.query, material_id: m.id, material: m.name, unit: m.unit } });
  };

  return (
    <>
      <Head>
        <title>Selecciona material</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/logoambiteca.png" alt="Ambitecapp" width={36} height={36} />
            <span className="font-semibold tracking-wide">AMBITECAPP</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">0.0000</span>
            <span className="w-6 h-6 rounded-full bg-green-500 inline-block" />
          </div>
        </header>

        <div className="mt-4">
          <a href="/" className="text-sm underline">Volver al inicio</a>
        </div>

        <section className="max-w-5xl mx-auto mt-20 text-center">
          <h1 className="text-4xl font-extrabold">Hola {name},</h1>
          <h2 className="text-4xl font-extrabold mt-2">¿Qué quieres reciclar hoy?</h2>
          {loading ? (
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-8">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-8">
              {materials.map((m) => (
                <button key={m.id} onClick={() => goTo(m)} className="flex flex-col items-center gap-3">
                  {m.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image_url} alt={m.name} className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <span className="w-24 h-24 rounded-full bg-gray-200" />
                  )}
                  <span className="font-semibold text-sm">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.unit}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-12">
            <Link href="/assistant/home" className="text-sm underline">Volver</Link>
          </div>
        </section>
      </main>
    </>
  );
}


