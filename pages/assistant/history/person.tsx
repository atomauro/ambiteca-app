import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPerson() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [docType, setDocType] = useState("");
  const [doc, setDoc] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 20;

  const fetchPage = async (personId: string, pageIndex: number) => {
    const from = pageIndex * LIMIT;
    const to = from + LIMIT - 1;
    const { data } = await supabase
      .from('deliveries')
      .select('id, delivered_at, ambiteca_id')
      .eq('person_id', personId)
      .order('delivered_at', { ascending: false })
      .range(from, to);
    return data || [];
  };

  const search = async () => {
    setLoading(true);
    try {
      // Buscar persona por documento o email
      let personId: string | null = null;
      if (email) {
        const { data: p } = await supabase.from('profiles').select('person_id').eq('email', email).maybeSingle();
        personId = p?.person_id || null;
      }
      if (!personId && (docType && doc)) {
        const { data: person } = await supabase.from('persons').select('id').eq('doc_type', docType).eq('doc_number', doc).maybeSingle();
        personId = person?.id || null;
      }
      if (!personId) { setRows([]); setHasMore(false); return; }
      const data = await fetchPage(personId, 0);
      setRows(data);
      setPage(0);
      setHasMore(data.length === LIMIT);
    } finally { setLoading(false); }
  };
  return (
    <>
      <Head>
        <title>Historial de Entrega por persona</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Historial de Entrega por persona</h1>
          <div className="mt-10 space-y-4 max-w-xl mx-auto">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nombre" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Correo" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <select value={docType} onChange={(e)=>setDocType(e.target.value)} className="w-full rounded-full bg-gray-100 px-5 py-3">
              <option value="">Tipo de documento</option>
              <option value="CC">Cédula</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="PP">Pasaporte</option>
            </select>
            <input value={doc} onChange={(e)=>setDoc(e.target.value)} placeholder="Número de documento" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <button onClick={search} className="inline-block rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Buscar</button>
          </div>

          <div className="mt-10 text-left">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No hay entregas para esta persona.</div>
            ) : (
              <div className="divide-y">
                {rows.map((d:any) => (
                  <div key={d.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(d.delivered_at).toLocaleString()}</span>
                      <span className="text-muted-foreground">Entrega {d.id.slice(0,8)}</span>
                    </div>
                    <div className="text-muted-foreground">Ambiteca {d.ambiteca_id?.slice(0,6) || ''}</div>
                  </div>
                ))}
              </div>
            )}
            {!loading && hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={async ()=>{
                    setLoading(true);
                    try {
                      // Re-derivar personId
                      let personId: string | null = null;
                      if (email) {
                        const { data: p } = await supabase.from('profiles').select('person_id').eq('email', email).maybeSingle();
                        personId = p?.person_id || null;
                      }
                      if (!personId && (docType && doc)) {
                        const { data: person } = await supabase.from('persons').select('id').eq('doc_type', docType).eq('doc_number', doc).maybeSingle();
                        personId = person?.id || null;
                      }
                      if (!personId) return;
                      const nextPage = page + 1;
                      const from = nextPage * LIMIT;
                      const to = from + LIMIT - 1;
                      const { data } = await supabase
                        .from('deliveries')
                        .select('id, delivered_at, ambiteca_id')
                        .eq('person_id', personId)
                        .order('delivered_at', { ascending: false })
                        .range(from, to);
                      const list = data || [];
                      setRows(prev => [...prev, ...list]);
                      setPage(nextPage);
                      setHasMore(list.length === LIMIT);
                    } finally { setLoading(false); }
                  }}
                  className="rounded-full border px-6 py-2 text-sm hover:bg-muted"
                >
                  Ver más
                </button>
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


