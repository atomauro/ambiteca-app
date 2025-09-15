import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

export default function WeightPage() {
  const router = useRouter();
  const material = (router.query.material as string) || "Papel";
  const [weight, setWeight] = useState("0,00");
  const [draftId, setDraftId] = useState<string | null>(null);

  const saveDraft = async () => {
    try {
      const res = await fetch("/api/deliveries/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personDoc: `${router.query.docType || "CC"}-${router.query.doc || "0000"}`,
          ambitecaId: "ambiteca-1",
          material,
          weightKg: Number((weight || "0").replace(",", "."))
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
              <p className="font-semibold mt-1">Medida: kg</p>
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


