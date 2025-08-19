import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const MATERIALS = [
  "Papel",
  "Cartón",
  "Plástico",
  "Vidrio",
  "Metal",
  "Aceite usado",
  "Residuos electrónicos",
];

export default function MaterialsPage() {
  const router = useRouter();
  const name = (router.query.name as string) || "Juan";

  const goTo = (material: string) => {
    router.push({ pathname: "/assistant/scale", query: { ...router.query, material } });
  };

  return (
    <>
      <Head>
        <title>Selecciona material</title>
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

        <section className="max-w-5xl mx-auto mt-20 text-center">
          <h1 className="text-4xl font-extrabold">Hola {name},</h1>
          <h2 className="text-4xl font-extrabold mt-2">¿Qué quieres reciclar hoy?</h2>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-8">
            {MATERIALS.map((m) => (
              <button key={m} onClick={() => goTo(m)} className="flex flex-col items-center gap-3">
                <span className="w-24 h-24 rounded-full bg-gray-200" />
                <span className="font-semibold text-sm">{m}</span>
              </button>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/assistant/home" className="text-sm underline">Volver</Link>
          </div>
        </section>
      </main>
    </>
  );
}


