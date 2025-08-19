import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SummaryPage() {
  const router = useRouter();
  const weight = (router.query.weight as string) || "0,00";
  const material = (router.query.material as string) || "Papel";

  const done = () => router.push({ pathname: "/assistant/more", query: router.query });

  return (
    <>
      <Head>
        <title>Registro listo</title>
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

        <section className="max-w-5xl mx-auto mt-14 text-center">
          <h1 className="text-4xl font-extrabold">¡Listo! Tu material ha sido registrado.</h1>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-200 rounded-lg p-8">
              <p className="font-bold text-xl">Peso</p>
              <p className="text-4xl mt-4">{weight}</p>
              <p className="mt-2">kg</p>
            </div>
            <div className="bg-gray-200 rounded-lg p-8">
              <p className="font-bold text-xl">Equivalente</p>
              <p className="text-4xl mt-4">0,000</p>
              <p className="mt-2">Perla Verde</p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-left mt-8 text-sm">
            <p>Material: {material}</p>
            <p>Peso kg: {weight}</p>
            <p>Puntos Perla Verde: 0,000</p>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <button className="rounded-full bg-orange-600 text-white px-6 py-3 font-semibold">Volver a pesar</button>
            <button onClick={done} className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold">Aceptar</button>
          </div>
        </section>
      </main>
    </>
  );
}


