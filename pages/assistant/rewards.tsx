import Head from "next/head";
import Image from "next/image";

export default function RewardsPage() {
  return (
    <>
      <Head>
        <title>Gestión de puntos y recompensas</title>
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

        <section className="max-w-3xl mx-auto mt-20 text-center">
          <h1 className="text-4xl font-extrabold">Gestión de puntos por reciclaje y recompensas</h1>
          <div className="mt-10 flex justify-center gap-6">
            <button className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 font-semibold">Enviados</button>
            <button className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold">Canjeados</button>
          </div>
        </section>
      </main>
    </>
  );
}


