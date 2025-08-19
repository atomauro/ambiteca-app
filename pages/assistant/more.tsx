import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

export default function MoreMaterialsPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>¿Quieres pesar más materiales?</title>
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

        <section className="max-w-3xl mx-auto mt-24 text-center">
          <h1 className="text-4xl font-extrabold">¿Quieres pesar más materiales?</h1>
          <p className="text-gray-600 mt-3">A continuación puedes observar tu saldo en puntos perla verde.</p>
          <div className="mt-10 flex justify-center gap-6">
            <button onClick={() => router.push("/assistant/materials")} className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 font-semibold">Sí</button>
            <button onClick={() => router.push("/assistant/receipt")} className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold">No</button>
          </div>
        </section>
      </main>
    </>
  );
}


