import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import AssistantHeader from "../../components/AssistantHeader";

export default function SummaryPage() {
  const router = useRouter();
  const material = (router.query.material as string) || "Material";
  const weightRaw = (router.query.weight as string) || "0,00";
  const weightKg = useMemo(() => {
    const n = Number((weightRaw || "0").replace(",", "."));
    return Number.isFinite(n) ? Number(n.toFixed(3)) : 0;
  }, [weightRaw]);

  const [loading, setLoading] = useState(false);
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [awardedPpv, setAwardedPpv] = useState<number | null>(null);
  const [awarding, setAwarding] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const draftId = (router.query.draftId as string) || null;

  const confirmDelivery = async () => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await fetch("/api/deliveries/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personDoc: `${router.query.docType || "CC"}-${router.query.doc || "0000"}`,
          ambiteca_id: (router.query.ambiteca_id as string) || 'global',
          items: [{ material_id: (router.query.material_id as string) || '', weight_kg: weightKg }]
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error registrando entrega");
      setDeliveryId(data.delivery_id);
      setAwardedPpv(data.ppv_awarded);
      toast.success("Entrega confirmada");
      return data;
    } catch (e: any) {
      toast.error(e.message || "No se pudo confirmar");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const done = async () => {
    const showLoader = () => {
      const el = document.createElement('div');
      el.id = 'global-loader';
      el.className = 'fixed inset-0 z-[100] bg-black/40 grid place-items-center';
      el.innerHTML = '<div class="bg-white rounded-md shadow px-6 py-5 flex items-center gap-3"><div class="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div><span class="text-sm">Procesando…</span></div>';
      document.body.appendChild(el);
      return () => { try { document.getElementById('global-loader')?.remove(); } catch {} };
    };
    const hide = showLoader();
    let ppv = awardedPpv;
    let currentDeliveryId = deliveryId;
    
    // Confirmar entrega si no está confirmada
    if (ppv == null) {
      const data = await confirmDelivery();
      if (!data) return;
      ppv = data.ppv_awarded;
      currentDeliveryId = data.delivery_id;
    }
    // Marcar onchain (mock) y obtener hash
    if (ppv && ppv > 0 && currentDeliveryId) {
      try {
        setAwarding(true);
        const res = await fetch('/api/deliveries/award', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ delivery_id: currentDeliveryId }) });
        const d = await res.json();
        if (res.ok) {
          setTxHash(d.tx_hash || null);
          toast.success('PPV acreditado (mock onchain)');
        }
      } catch {}
      finally { setAwarding(false); }
    }
    
    router.push({ 
      pathname: "/assistant/more", 
      query: { 
        ...router.query, 
        deliveryId: currentDeliveryId || "", 
        ppv: ppv ?? 0,
        txHash: txHash || ''
      } 
    });
    hide();
  };

  return (
    <>
      <Head>
        <title>Registro listo</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto text-center">
          {deliveryId ? (
            <div className="mb-6 text-left bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Entrega confirmada. ID: {deliveryId}</p>
                <span className="text-xs font-semibold rounded-full bg-green-600 text-white px-3 py-1">Confirmado</span>
              </div>
            </div>
          ) : null}
          {draftId && !deliveryId ? (
            <div className="mb-6 text-left bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Borrador sin confirmar (ID: {draftId}). Revisa y confirma para acreditar PLV.</p>
                <button
                  onClick={() => router.push({ pathname: "/assistant/weight", query: { ...router.query } })}
                  className="text-sm rounded-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2"
                >
                  Editar peso
                </button>
              </div>
            </div>
          ) : null}
          <h1 className="text-4xl font-extrabold">¡Listo! Tu material ha sido registrado.</h1>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-200 rounded-lg p-8">
              <p className="font-bold text-xl">Peso</p>
              <p className="text-4xl mt-4">{weightKg.toFixed(2)}</p>
              <p className="mt-2">kg</p>
            </div>
            <div className="bg-gray-200 rounded-lg p-8">
              <p className="font-bold text-xl">Equivalente</p>
              <p className="text-4xl mt-4">{awardedPpv != null ? awardedPpv.toFixed(3) : "—"}</p>
              <p className="mt-2">PPV</p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-left mt-8 text-sm">
            <p>Material: {material}</p>
            <p>Peso kg: {weightKg.toFixed(2)}</p>
            <p>PPV: {awardedPpv != null ? awardedPpv.toFixed(3) : "—"}</p>
            {deliveryId ? <p>ID de entrega: {deliveryId}</p> : null}
            {txHash ? <p>Tx hash: {txHash}</p> : null}
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <button className="rounded-full bg-orange-600 text-white px-6 py-3 font-semibold" onClick={() => router.back()}>Volver a pesar</button>
            <button 
              onClick={done} 
              disabled={loading || awarding} 
              className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold disabled:opacity-60 flex items-center gap-2"
            >
              {loading && "Registrando…"}
              {awarding && (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Acreditando PPV...
                </>
              )}
              {!loading && !mintingTokens && "Aceptar"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}


