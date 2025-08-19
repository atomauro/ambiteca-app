import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

export default function ScalePage() {
  const router = useRouter();
  const name = (router.query.name as string) || "Juan";
  const material = (router.query.material as string) || "Papel";

  const goNext = () => router.push({ pathname: "/assistant/weight", query: router.query });

  return (
    <>
      <Head>
        <title>Sube el material a la báscula</title>
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

        <section className="max-w-4xl mx-auto mt-20 text-center">
          <h1 className="text-4xl font-extrabold">{name},</h1>
          <h2 className="text-4xl font-extrabold mt-2">Sube el material a la báscula</h2>

          <div className="mt-12 flex items-center justify-center gap-10">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto" />
              <p className="mt-2 font-semibold">{material}</p>
            </div>
            <span className="text-3xl font-bold">→</span>
            <div className="w-28 h-28 bg-gray-200" />
          </div>

          <button onClick={goNext} className="mt-12 rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Continuar</button>
        </section>
      </main>
    </>
  );
}


