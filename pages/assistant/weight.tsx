import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AssistantHeader from "@/components/AssistantHeader";

export default function WeightPage() {
  const router = useRouter();
  const material = (router.query.material as string) || "Material";
  const materialId = (router.query.material_id as string) || "";
  const unit = (router.query.unit as string) || "kg";
  const ambitecaId = (router.query.ambiteca_id as string) || "";
  const [weight, setWeight] = useState("0,00");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [ppvRate, setPpvRate] = useState<number>(0);
  const [redirecting, setRedirecting] = useState(false);

  const formatUnit = (u?: string): string => {
    const s = (u || '').trim().toLowerCase();
    if (!s) return '';
    if (["l", "lt", "lts", "lit", "litro", "litros", "liter", "liters"].includes(s)) return "litro";
    if (["unidad", "unidades", "uni", "unit", "units"].includes(s)) return "unidad";
    return s;
  };

  useEffect(() => {
    if (!materialId) return;
    (async () => {
      try {
        const url = new URL('/api/admin/materials', window.location.origin);
        url.searchParams.set('id', materialId);
        const res = await fetch(url.toString());
        const d = await res.json();
        if (!res.ok) throw new Error(d?.error || 'No se pudo cargar tarifa');
        const rates: any[] = d.rates || [];
        const today = new Date().toISOString().slice(0,10);
        const matchAmb = ambitecaId ? rates.find(r => r.ambiteca_id === ambitecaId && r.valid_from <= today && (!r.valid_to || r.valid_to >= today)) : null;
        const matchGlobal = rates.find(r => !r.ambiteca_id && r.valid_from <= today && (!r.valid_to || r.valid_to >= today));
        const rate = Number(matchAmb?.ppv_per_kg ?? matchGlobal?.ppv_per_kg ?? 0);
        setPpvRate(rate);
      } catch (e) {
        setPpvRate(0);
      }
    })();
  }, [materialId, ambitecaId]);

  const weightNumber = useMemo(() => Number((weight || "0").replace(",", ".")) || 0, [weight]);
  const estimated = useMemo(() => (ppvRate || 0) * weightNumber, [ppvRate, weightNumber]);

  const saveDraft = async () => {
    try {
      setRedirecting(true);
      const res = await fetch("/api/deliveries/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personDoc: `${router.query.docType || "CC"}-${router.query.doc || "0000"}`,
          ambitecaId: ambitecaId || 'global',
          materialId: materialId || null,
          material,
          weightKg: weightNumber,
          estimatedPpv: estimated
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error guardando borrador");
      const id = data.draftId as string;
      setDraftId(id);
      toast.success("Borrador guardado");
      router.push({ pathname: "/assistant/summary", query: { ...router.query, weight, draftId: id } });
    } catch (e: any) {
      toast.error(e.message || "No se pudo guardar el borrador");
      setRedirecting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ingresa el peso</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Ingresa el peso que muestra la balanza</h1>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="grid grid-cols-3 gap-6 max-w-xs">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-12 h-12 rounded bg-gray-200" />
              ))}
              <div className="w-12 h-12 rounded bg-gray-200" />
              <div className="w-12 h-12 rounded bg-gray-200" />
              <div className="w-12 h-12 rounded bg-gray-200" />
            </div>
            <div>
              <p className="font-semibold">Material: {material}</p>
              <p className="font-semibold mt-1">Medida: {formatUnit(unit)}</p>
              <div className="mt-1 text-sm text-muted-foreground">Tarifa: {ppvRate} PPV / {formatUnit(unit)}</div>
              <div className="mt-1 text-sm font-semibold">Estimado: {estimated.toFixed(2)} PPV</div>
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Peso"
                className="mt-4 w-full max-w-md rounded-full bg-gray-100 px-5 py-3"
                required
                inputMode="decimal"
              />
              <div className="mt-8 flex gap-4">
                <button onClick={saveDraft} className="rounded-full bg-orange-600 text-white px-6 py-3 font-semibold">Guardar</button>
                <button onClick={saveDraft} className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold">Convertir</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {redirecting && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
          <div className="bg-white rounded-md shadow px-6 py-5 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
            <span className="text-sm">Guardando…</span>
          </div>
        </div>
      )}
    </>
  );
}


