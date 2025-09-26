import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

export default function AssistantLanding() {
  const router = useRouter();
  const handleEnter = () => router.push("/assistant/home");

  return (
    <>
      <Head>
        <title>AMBITECA APP · Asistente</title>
      </Head>
      <main className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-12">
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

        <section className="max-w-2xl mx-auto mt-16 text-center">
          <h1 className="text-4xl font-extrabold">Selecciona la ambiteca</h1>
          <div className="mt-8 space-y-5">
            <div className="mx-auto max-w-xl">
              <div className="rounded-full bg-gray-100 px-5 py-3 text-left">San Luis</div>
            </div>
            <div>
              <p className="text-lg font-semibold">Hora de entrada</p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <span className="rounded-full bg-gray-100 px-5 py-3">08</span>
                <span className="font-bold text-2xl">:</span>
                <span className="rounded-full bg-gray-100 px-5 py-3">00</span>
                <span className="rounded-full bg-gray-100 px-5 py-3">am</span>
              </div>
            </div>
            <button onClick={handleEnter} className="rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Entrar</button>
          </div>
        </section>
      </main>
    </>
  );
}


