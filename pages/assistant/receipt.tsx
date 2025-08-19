import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function ReceiptPage() {
  return (
    <>
      <Head>
        <title>Gracias por ayudar el planeta</title>
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

        <section className="max-w-3xl mx-auto mt-14 text-center">
          <h1 className="text-4xl font-extrabold">Gracias por ayudar el planeta!</h1>
          <p className="mt-4 text-gray-600">A continuación puedes verificar tu saldo en puntos perla verde.</p>
          <div className="mt-10 space-y-3">
            <p><span className="font-bold">Fecha:</span> 20250729</p>
            <p><span className="font-bold">Material:</span> Papel</p>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <p className="text-4xl font-extrabold">0,00</p>
                <p className="text-gray-600">kg</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold">0,000</p>
                <p className="text-gray-600">PLV</p>
              </div>
            </div>
            <p className="mt-10 text-xl font-bold">Total de puntos por mes 0,000 PLV</p>
          </div>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/assistant/home" className="rounded-full bg-orange-600 text-white px-6 py-3 font-semibold">Cerrar</Link>
            <button className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold">Enviar al correo</button>
          </div>
        </section>
      </main>
    </>
  );
}


