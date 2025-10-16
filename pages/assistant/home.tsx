import Head from "next/head";
import Link from "next/link";
import { Recycle, UserPlus, LogIn, Clock, ArrowRight, Users, ShoppingBag } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import UserMenu from "@/components/UserMenu";

export default function AssistantHome() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const [loading, setLoading] = useState(true);
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [monthCount, setMonthCount] = useState<number>(0);

  const avatarUrl = (user as any)?.google?.profilePictureUrl || (user as any)?.apple?.profilePictureUrl || "/images/avatar.png";
  const displayName = (user as any)?.google?.name || (user as any)?.apple?.name || ((user as any)?.email?.address ? (user as any)?.email?.address.split('@')[0] : 'Usuario');
  const emailAddr = (user as any)?.email?.address || '';

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      router.replace('/');
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        // Cargar últimas 8 entregas atendidas por el asistente actual
        // Nota: se requiere RLS que permita filtrar por assistant_user_id = auth.uid()
        const { data: deliveries } = await supabase
          .from('deliveries')
          .select('id, delivered_at, ambiteca_id')
          .order('delivered_at', { ascending: false })
          .limit(8);
        setRecentDeliveries(deliveries || []);

        // Conteos simples de hoy y del mes (mock si RLS no permite aggregate)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const { data: deliveriesToday } = await supabase
          .from('deliveries')
          .select('id')
          .gte('delivered_at', startOfDay.toISOString());
        setTodayCount(deliveriesToday?.length || 0);

        const { data: deliveriesMonth } = await supabase
          .from('deliveries')
          .select('id')
          .gte('delivered_at', startOfMonth.toISOString());
        setMonthCount(deliveriesMonth?.length || 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ready, authenticated, router]);
  return (
    <>
      <Head>
        <title>AMBITECA APP · ¿Qué quieres hacer hoy?</title>
      </Head>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                {React.createElement(Recycle, { className: "h-5 w-5 text-primary-foreground" })}
              </div>
              <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
            </div>

            {/* <nav className="hidden md:flex items-center gap-6">
              <a
                href="/#inicio"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Inicio
              </a>
              <a
                href="/#beneficios"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Beneficios
              </a>
              <a
                href="/#materiales"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Materiales
              </a>
            </nav> */}

            <div className="flex items-center gap-4"><UserMenu /></div>
          </div>
        </header>

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">Panel del asistente</h1>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Entregas de hoy</CardTitle>
                <Clock className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-bold">{todayCount}</div>}
                <CardDescription className="mt-2">Recibidas por ti hoy</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Este mes</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-bold">{monthCount}</div>}
                <CardDescription className="mt-2">Entregas atendidas</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Accesos rápidos</CardTitle>
                <ArrowRight className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Link href="/assistant/login" className="col-span-2 rounded-md bg-green-600 hover:bg-green-700 text-white p-3 transition-colors flex items-center gap-2">
                    <LogIn className="size-4 text-white" /> Cargar material
                  </Link>
                  <Link href="/assistant/history" className="rounded-md bg-orange-600 hover:bg-orange-700 text-white p-3 transition-colors flex items-center gap-2">
                    <Clock className="size-4 text-white" /> Historial
                  </Link>
                  <Link href="/assistant/rewards" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white p-3 transition-colors flex items-center gap-2">
                    <ShoppingBag className="size-4 text-white" /> PPV y recompensas
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Entregas recientes</CardTitle>
                  <CardDescription>Últimas 8 entregas atendidas</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : recentDeliveries.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-center">
                    <div>
                      <Clock className="mx-auto size-8 text-muted-foreground" />
                      <div className="mt-3 font-medium">No has registrado entregas aún</div>
                      <div className="text-sm text-muted-foreground">Cuando registres, aparecerán aquí.</div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentDeliveries.map((d) => (
                      <div key={d.id} className="py-3 flex items-center justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">Entrega</span>
                          <span className="text-muted-foreground">{new Date(d.delivered_at).toLocaleString()}</span>
                        </div>
                        <div className="text-muted-foreground">ID {d.id.slice(0, 8)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}


