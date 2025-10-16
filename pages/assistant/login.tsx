import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AssistantIdentify() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [docType, setDocType] = useState("");
  const [doc, setDoc] = useState("");
  const [email, setEmail] = useState("");

  const goNext = () => {
    const nameOk = (name || "").trim().length > 1;
    const docTypeOk = !!docType;
    const docOk = (doc || "").trim().length > 0;
    const emailOk = /.+@.+\..+/.test((email || "").trim());
    if (!nameOk) return toast.error("Ingresa un nombre válido");
    if (!docTypeOk) return toast.error("Selecciona el tipo de documento");
    if (!docOk) return toast.error("Ingresa el número de documento");
    if (!emailOk) return toast.error("Ingresa un correo válido");
    router.push({ pathname: "/assistant/materials", query: { name: name.trim(), docType, doc: doc.trim(), email: email.trim() } });
  };

  useEffect(() => {
    if (!router.isReady) return;
    const qName = (router.query.name as string) || "";
    const qDoc = (router.query.doc as string) || "";
    const qDocType = (router.query.docType as string) || "";
    const qEmail = (router.query.email as string) || "";
    setName((prev) => (prev && prev.trim().length > 0 ? prev : (qName || "")));
    setDoc((prev) => (prev && prev.trim().length > 0 ? prev : (qDoc || "")));
    setDocType((prev) => (prev && prev.length > 0 ? prev : (qDocType || "")));
    setEmail((prev) => (prev && prev.trim().length > 0 ? prev : (qEmail || "")));
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>AMBITECAPP - Asistente</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Cargar material</h1>
          <form
            onSubmit={(e) => { e.preventDefault(); goNext(); }}
            className="mt-10 space-y-4"
          >
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="w-full rounded-full bg-gray-100 px-5 py-3" required />
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full rounded-full bg-gray-100 px-5 py-3" required>
              <option value="" disabled>Tipo de documento</option>
              <option value="CC">Cédula</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="PP">Pasaporte</option>
            </select>
            <input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Número de documento" className="w-full rounded-full bg-gray-100 px-5 py-3" required />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" className="w-full rounded-full bg-gray-100 px-5 py-3" required />
            <button type="submit" className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Comenzar carga</button>
          </form>
          <div className="mt-8">
            <button onClick={() => router.back()} className="rounded-full border px-6 py-2 text-sm hover:bg-muted">Volver</button>
          </div>
        </section>
      </main>
    </>
  );
}


