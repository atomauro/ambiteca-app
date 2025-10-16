import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface MaterialRow { id: string; name: string; }

export default function HistoryMaterial() {
  const router = useRouter();
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [materialId, setMaterialId] = useState<string>("");
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 20;

  useEffect(() => {
    const load = async () => {
      setLoadingMaterials(true);
      try {
        const res = await fetch('/api/admin/materials');
        const d = await res.json();
        if (res.ok) setMaterials((d.materials || []).map((m: any) => ({ id: m.id, name: m.name })));
      } finally { setLoadingMaterials(false); }
    };
    load();
  }, []);

  const fetchPage = async (pageIndex: number) => {
    const from = pageIndex * LIMIT;
    const to = from + LIMIT - 1;
    const { data } = await supabase
      .from('delivery_items')
      .select('id, weight_kg, deliveries(id, delivered_at, ambiteca_id)')
      .eq('material_id', materialId)
      .order('created_at', { ascending: false })
      .range(from, to);
    return data || [];
  };

  const search = async () => {
    if (!materialId) { setItems([]); setHasMore(false); return; }
    setLoadingList(true);
    try {
      const data = await fetchPage(0);
      setItems(data);
      setPage(0);
      setHasMore(data.length === LIMIT);
    } finally { setLoadingList(false); }
  };

  const loadMore = async () => {
    setLoadingList(true);
    try {
      const nextPage = page + 1;
      const data = await fetchPage(nextPage);
      setItems(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === LIMIT);
    } finally { setLoadingList(false); }
  };
  return (
    <>
      <Head>
        <title>Historial de recaudo de material</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Historial de recaudo de material</h1>
          <div className="mt-10 space-y-6">
            {loadingMaterials ? (
              <Skeleton className="w-full h-12 max-w-xl mx-auto rounded-full" />
            ) : (
              <select value={materialId} onChange={(e)=>setMaterialId(e.target.value)} className="w-full rounded-full bg-gray-100 px-5 py-3 max-w-xl mx-auto">
                <option value="">Selecciona material</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            )}
            <button onClick={search} className="rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Buscar</button>
          </div>

          <div className="mt-10 text-left">
            {loadingList ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No hay entregas para este material.</div>
            ) : (
              <div className="divide-y">
                {items.map((it:any) => (
                  <div key={it.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(it.deliveries?.delivered_at || '').toLocaleString()}</span>
                      <span className="text-muted-foreground">Entrega {it.deliveries?.id?.slice(0,8) || ''}</span>
                    </div>
                    <div className="font-semibold">{Number(it.weight_kg || 0).toFixed(2)} kg</div>
                  </div>
                ))}
              </div>
            )}
            {!loadingList && hasMore && (
              <div className="text-center mt-6">
                <button onClick={loadMore} className="rounded-full border px-6 py-2 text-sm hover:bg-muted">Ver más</button>
              </div>
            )}
          </div>
          <div className="mt-8">
            <button onClick={() => router.back()} className="rounded-full border px-6 py-2 text-sm hover:bg-muted">Volver</button>
          </div>
        </section>
      </main>
    </>
  );
}


