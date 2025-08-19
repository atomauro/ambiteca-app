import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

export default function AssistantIdentify() {
  const router = useRouter();
  const [name, setName] = useState("Juan");
  const [docType, setDocType] = useState("CC");
  const [doc, setDoc] = useState("1000000");

  const goNext = () => router.push({ pathname: "/assistant/materials", query: { name, docType, doc } });

  return (
    <>
      <Head>
        <title>Iniciar sesión · Asistente</title>
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

        <section className="max-w-xl mx-auto mt-16 text-center">
          <h1 className="text-4xl font-extrabold">Iniciar sesión</h1>
          <div className="mt-10 space-y-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full rounded-full bg-gray-100 px-5 py-3">
              <option value="CC">Tipo de documento</option>
              <option value="CC">Cédula</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="PP">Pasaporte</option>
            </select>
            <input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Número de documento" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <button onClick={goNext} className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Registrar</button>
          </div>
        </section>
      </main>
    </>
  );
}


