import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import AssistantHeader from "@/components/AssistantHeader";

export default function HistoryLanding() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Historial</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Historial de Entrega de material</h1>
          <div className="mt-10 flex justify-center gap-6">
            <Link href="/assistant/history/material" className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 font-semibold">Material</Link>
            <Link href="/assistant/history/person" className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold">Personas</Link>
          </div>
          <div className="mt-8">
            <button onClick={() => router.back()} className="rounded-full border px-6 py-2 text-sm hover:bg-muted">Volver</button>
          </div>
        </section>
      </main>
    </>
  );
}


