import React, { useEffect } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { PrivyClient } from "@privy-io/server-auth";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { HeroSection } from "../components/hero-section";
import { BenefitsSection } from "../components/benefits-section";
import { MaterialsSection } from "../components/materials-section";
import { Recycle } from "lucide-react";
 

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
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      try {
        const lastRole = localStorage.getItem('lastRole')?.toLowerCase();
        if (lastRole === 'admin') { router.replace('/admin'); return; }
        if (lastRole === 'assistant') { router.replace('/assistant/home'); return; }
      } catch {}
      router.replace('/dashboard');
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>AmbitecApp - Recicla, gana puntos y ayuda al planeta</title>
        <meta name="description" content="Cada material que reciclas cuenta. Convierte tus acciones ambientales en recompensas mientras contribuyes a un futuro más sostenible." />
      </Head>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                {React.createElement(Recycle, { className: "h-5 w-5 text-primary-foreground" })}
              </div>
              <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#inicio"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Inicio
              </a>
              <a
                href="#beneficios"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Beneficios
              </a>
              <a
                href="#materiales"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Materiales
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { if (authenticated) { window.location.href = '/dashboard' } else { login() } }}
                className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </header>

        <main>
          <HeroSection />
          <BenefitsSection />
          <MaterialsSection />
        </main>

        {/* Footer simple */}
        <footer className="border-t py-8 bg-muted/30">
          <div className="px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                {React.createElement(Recycle, { className: "h-4 w-4 text-primary-foreground" })}
              </div>
              <span className="font-bold text-foreground">AMBITECAPP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 AmbitecApp. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
