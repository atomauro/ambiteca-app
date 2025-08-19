import Head from "next/head";
import Image from "next/image";

export default function HistoryMaterial() {
  return (
    <>
      <Head>
        <title>Historial de recaudo de material</title>
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


