import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { PrivyClient } from "@privy-io/server-auth";
import { useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookieAuthToken = req.cookies["privy-token"];
  if (!cookieAuthToken) return { props: {} };

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

  try {
    await client.verifyAuthToken(cookieAuthToken);
    return { props: {}, redirect: { destination: "/dashboard", permanent: false } };
  } catch {
    return { props: {} };
  }
};

export default function HomePage() {
  const router = useRouter();
  const { login } = useLogin({ onComplete: () => router.push("/dashboard") });

  return (
    <>
      <Head>
        <title>Ambitecapp</title>
      </Head>
      <main className="min-h-screen bg-white">
        <header className="flex items-center justify-between px-6 sm:px-12 py-4">
          <div className="flex items-center gap-3">
            <Image src="/images/logoambiteca.png" alt="Ambitecapp" width={36} height={36} />
            <span className="font-semibold tracking-wide">AMBITECAPP</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/assistant" className="hover:underline">Asistente</Link>
            <Link href="/dashboard" className="hover:underline">Administrador</Link>
          </nav>
        </header>

        <section className="px-6 sm:px-12 pt-16 pb-12 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Recicla, gana puntos y ayuda al planeta.
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Cada material que reciclas cuenta. ¡Haz la diferencia hoy!
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth/login" className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-sm font-semibold">
              Iniciar sesión
            </Link>
            <Link href="/auth/register" className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-sm font-semibold">
              Crear cuenta
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
