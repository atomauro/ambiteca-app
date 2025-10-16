import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";

export default function HistoryMaterial() {
  return (
    <>
      <Head>
        <title>Historial de recaudo de material</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 pt-6 pb-12">
        <AssistantHeader showBackButton={false} />

        <section className="max-w-3xl mx-auto mt-24 text-center">
          <h1 className="text-4xl font-extrabold">Historial de recaudo de material</h1>
          <div className="mt-10 space-y-6">
            <select className="w-full rounded-full bg-gray-100 px-5 py-3 max-w-xl mx-auto">
              <option>Tipo de Material</option>
              <option>Papel</option>
              <option>Cartón</option>
              <option>Plástico</option>
              <option>Vidrio</option>
              <option>Metal</option>
            </select>
            <button className="rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Entrar</button>
          </div>
        </section>
      </main>
    </>
  );
}


