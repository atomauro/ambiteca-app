import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";
import { useRouter } from "next/router";
import { useState } from "react";

export default function AssistantRegister() {
  const router = useRouter();
  const [name, setName] = useState("Juan Pérez");
  const [docType, setDocType] = useState("CC");
  const [doc, setDoc] = useState("1000000");
  const [email, setEmail] = useState("juan@example.com");

  const goNext = () => router.push({ pathname: "/assistant/materials", query: { name, docType, doc } });

  return (
    <>
      <Head>
        <title>Registrar usuario nuevo</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 py-12">
        <AssistantHeader showBackButton={false} />

        <section className="max-w-xl mx-auto mt-16 text-center">
          <h1 className="text-4xl font-extrabold">Registrar usuario nuevo</h1>
          <div className="mt-10 space-y-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full rounded-full bg-gray-100 px-5 py-3">
              <option value="CC">Tipo de documento</option>
              <option value="CC">Cédula</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="PP">Pasaporte</option>
            </select>
            <input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Número de documento" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <input type="password" placeholder="Contraseña" className="w-full rounded-full bg-gray-100 px-5 py-3" />
            <button onClick={goNext} className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Registrar</button>
          </div>
        </section>
      </main>
    </>
  );
}


