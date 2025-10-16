import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";
import Link from "next/link";

export default function HistoryPerson() {
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
            <input placeholder="Nombre" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <select className="w-full rounded-full bg-gray-100 px-5 py-3">
              <option>Tipo de documento</option>
              <option>Cédula</option>
              <option>Tarjeta de identidad</option>
              <option>Pasaporte</option>
            </select>
            <input placeholder="Número de documento" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <Link href="/assistant/history/person/detail" className="inline-block rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Entrar</Link>
          </div>
        </section>
      </main>
    </>
  );
}


