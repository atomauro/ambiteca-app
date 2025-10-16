import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AssistantHeader from "@/components/AssistantHeader";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const formatUnit = (u?: string): string => {
    const s = (u || '').trim().toLowerCase();
    if (!s) return '';
    if (["l", "lt", "lts", "lit", "litro", "litros", "liter", "liters"].includes(s)) return "litro";
    if (["unidad", "unidades", "uni", "unit", "units"].includes(s)) return "unidad";
    return s;
  };

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

  useEffect(() => {
    const saved = sessionStorage.getItem('assistant_material_sel');
    if (saved) {
      try { const s = JSON.parse(saved); if (s?.material_id) setSelectedId(s.material_id); } catch {}
    }
  }, []);

  const continueNext = () => {
    const m = materials.find(x => x.id === selectedId);
    if (!m) return;
    sessionStorage.setItem('assistant_material_sel', JSON.stringify({ material_id: m.id, material: m.name, unit: m.unit, image_url: m.image_url || '' }));
    router.push({ pathname: "/assistant/scale", query: { ...router.query, material_id: m.id, material: m.name, unit: m.unit, image_url: m.image_url || '' } });
  };

  return (
    <>
      <Head>
        <title>Selecciona material</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Hola {name},</h1>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">¿Qué quieres reciclar hoy?</h2>
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
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6 sm:gap-8 place-items-center justify-center">
              {materials.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  aria-label={`Seleccionar ${m.name}`}
                  className={`group flex flex-col items-center gap-3 rounded-xl p-3 sm:p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${selectedId===m.id ? 'bg-accent/80' : 'hover:bg-accent/60'}`}
                >
                  {m.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-muted transition-transform duration-200 group-hover:scale-105" />
                  )}
                  <span className="font-semibold text-sm sm:text-[0.95rem] text-foreground text-center leading-tight">
                    {m.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatUnit(m.unit)}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-12 flex items-center justify-center gap-3">
            <button onClick={() => router.back()} className="rounded-full border px-6 py-2 text-sm hover:bg-muted">Volver</button>
            <button onClick={continueNext} disabled={!selectedId} className="rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white px-8 py-3 font-semibold">Continuar</button>
          </div>
        </section>
      </main>
    </>
  );
}


