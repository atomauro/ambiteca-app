import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";
import { useRouter } from "next/router";

export default function HistoryMaterial() {
  const router = useRouter();
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
          <div className="mt-8">
            <button onClick={() => router.back()} className="rounded-full border px-6 py-2 text-sm hover:bg-muted">Volver</button>
          </div>
        </section>
      </main>
    </>
  );
}


