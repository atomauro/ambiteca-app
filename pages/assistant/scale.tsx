import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function ScalePage() {
  const router = useRouter();
  const name = (router.query.name as string) || "Asistente";
  const material = (router.query.material as string) || "Material";
  const materialId = (router.query.material_id as string) || "";
  const unit = (router.query.unit as string) || "kg";
  const ambitecaId = (router.query.ambiteca_id as string) || "";
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [weight, setWeight] = useState<string>("");
  const [ppvRate, setPpvRate] = useState<number>(0);

  const formatUnit = (u?: string): string => {
    const s = (u || '').trim().toLowerCase();
    if (!s) return '';
    if (["l", "lt", "lts", "lit", "litro", "litros", "liter", "liters"].includes(s)) return "litro";
    if (["unidad", "unidades", "uni", "unit", "units"].includes(s)) return "unidad";
    return s;
  };

  useEffect(() => {
    const imgQ = (router.query.image_url as string) || '';
    if (imgQ) setImageUrl(imgQ);
    if (!materialId) return;
    (async () => {
      try {
        const url = new URL('/api/admin/materials', window.location.origin);
        url.searchParams.set('id', materialId);
        if (ambitecaId) url.searchParams.set('ambiteca_id', ambitecaId);
        const res = await fetch(url.toString());
        const d = await res.json();
        if (res.ok) {
          if (!imgQ && d?.material?.image_url) setImageUrl(d.material.image_url as string);
          const rate = Number(d?.current_rate ?? 0);
          setPpvRate(Number.isFinite(rate) ? rate : 0);
        }
      } catch {}
    })();
  }, [materialId, ambitecaId]);

  const weightNumber = useMemo(() => {
    const raw = (weight || "").trim();
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [weight]);

  const estimatedPpv = useMemo(() => {
    const est = (ppvRate || 0) * weightNumber;
    return Number.isFinite(est) ? est : 0;
  }, [ppvRate, weightNumber]);

  const goNext = () => {
    const raw = (weight || "").trim();
    if (raw.includes(',')) {
      return toast.error('Usa punto (.) para decimales');
    }
    const regex = /^\d+(?:\.\d{1,3})?$/; // solo punto, hasta 3 decimales
    if (!regex.test(raw)) {
      return toast.error('Formato inválido: usa punto (.) y máximo 3 decimales');
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num <= 0) {
      return toast.error('Ingresa un peso válido mayor a 0');
    }
    router.push({ pathname: "/assistant/summary", query: { ...router.query, weight: raw } });
  };

  return (
    <>
      <Head>
        <title>Sube el material a la báscula</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{name},</h1>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Ingresa el peso de la báscula</h2>

          <div className="mt-10 flex flex-col items-center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={material} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-muted" />
            )}
            <p className="mt-3 font-semibold">{material}</p>
            <p className="text-xs text-muted-foreground">Medida: {formatUnit(unit)}</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); goNext(); }} className="mt-8 space-y-4">
            <div className="relative w-full max-w-md mx-auto">
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-full bg-gray-100 pl-5 pr-16 py-3"
                required
                inputMode="decimal"
                pattern="[0-9]+(\.[0-9]{1,3})?"
                title="Usa punto (.) y máximo 3 decimales"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">
                {formatUnit(unit)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Tarifa: {ppvRate.toFixed(3)} PPV / {formatUnit(unit)} · Estimado: <span className="font-semibold text-foreground">{estimatedPpv.toFixed(2)} PPV</span>
            </div>
            <div className="text-xs text-muted-foreground">Usa punto (.) para decimales. Máximo 3.</div>
            <div className="flex justify-center gap-4">
              <button type="button" onClick={() => router.back()} className="rounded-full border px-6 py-2 text-sm hover:bg-muted">Volver</button>
              <button type="submit" className="rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Continuar</button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}


