import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function WeightPage() {
  const router = useRouter();
  const material = (router.query.material as string) || "Material";
  const materialId = (router.query.material_id as string) || "";
  const unit = (router.query.unit as string) || "kg";
  const ambitecaId = (router.query.ambiteca_id as string) || "";
  const [weight, setWeight] = useState("0,00");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [ppvRate, setPpvRate] = useState<number>(0);

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
    }
  };

  return (
    <>
      <Head>
        <title>Ingresa el peso</title>
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

        <section className="max-w-5xl mx-auto mt-14">
          <h1 className="text-4xl font-extrabold">Ingresa el peso que muestra la balanza</h1>
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
              <p className="font-semibold mt-1">Medida: {unit}</p>
              <div className="mt-1 text-sm text-muted-foreground">Tarifa: {ppvRate} PPV / {unit}</div>
              <div className="mt-1 text-sm font-semibold">Estimado: {estimated.toFixed(2)} PPV</div>
              <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Peso" className="mt-4 w-full max-w-md rounded-full bg-gray-100 px-5 py-3" />
              <div className="mt-8 flex gap-4">
                <button onClick={saveDraft} className="rounded-full bg-orange-600 text-white px-6 py-3 font-semibold">Guardar</button>
                <button onClick={saveDraft} className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold">Convertir</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


