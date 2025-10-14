import React from "react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserSync } from "@/lib/hooks/useUserSync";
import { Recycle } from "lucide-react";
import { getRoleLabel } from "@/lib/utils-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Clock, Coins } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, logout, user } = usePrivy();
  const { userProfile, isLoading: profileLoading } = useUserSync();

  const [loadingCitizenData, setLoadingCitizenData] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  // Redirección por rol al ingresar al dashboard
  useEffect(() => {
    if (!ready || !authenticated) return;
    const roleLower = (userProfile?.role || '').toLowerCase();
    if (!roleLower) return;
    if (roleLower === 'assistant' || roleLower === 'asistente') {
      router.replace('/assistant/home');
    } else if (roleLower === 'admin') {
      router.replace('/admin');
    }
  }, [ready, authenticated, userProfile?.role, router]);

  // Cargar datos de ciudadano: historial y catálogo
  useEffect(() => {
    const loadCitizen = async () => {
      if (!authenticated || userProfile?.role !== 'citizen') return;
      try {
        setLoadingCitizenData(true);
        // Buscar person_id desde profiles
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('person_id')
          .eq('user_id', userProfile?.user_id as string)
          .maybeSingle();

        const personId = profileRow?.person_id as string | null | undefined;

        if (personId) {
          // Cargar entregas por persona (básico)
          const { data: deliveriesData } = await supabase
            .from('deliveries')
            .select('id, delivered_at, ambiteca_id')
            .eq('person_id', personId)
            .order('delivered_at', { ascending: false })
            .limit(10);
          setDeliveries(deliveriesData || []);
        } else {
          setDeliveries([]);
        }

        // Cargar catálogo activo para marketplace
        const { data: rewardsData } = await supabase
          .from('rewards_catalog')
          .select('id, title, description, cost_plv, image_url, is_active')
          .eq('is_active', true)
          .order('cost_plv', { ascending: true })
          .limit(8);
        setRewards(rewardsData || []);
      } finally {
        setLoadingCitizenData(false);
      }
    };
    loadCitizen();
  }, [authenticated, userProfile?.role, userProfile?.user_id]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>AMBITECA APP</title>
      </Head>
      <div className="min-h-screen bg-background">
        {ready && authenticated ? (
          <>
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    {React.createElement(Recycle, { className: "h-5 w-5 text-primary-foreground" })}
                  </div>
                  <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
                </div>

               {/*  <nav className="hidden md:flex items-center gap-6">
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
                </nav>*/}

                <div className="flex items-center gap-4">
                 {/*  <nav className="hidden sm:flex items-center gap-2">
                    <Link href="/assistant" className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors">
                      Asistente
                    </Link>
                    <Link href="/admin" className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors">
                      Admin
                    </Link>
                  </nav> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={(user as any)?.google?.profilePictureUrl || (user as any)?.apple?.profilePictureUrl || "/images/avatar.png"} alt={userProfile?.full_name || "Usuario"} />
                          <AvatarFallback>{(userProfile?.full_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="hidden md:flex flex-col items-start leading-tight">
                          <span className="text-sm font-medium max-w-[160px] truncate">{userProfile?.full_name || (user as any)?.google?.name || 'Usuario'}</span>
                          <span className="text-xs text-muted-foreground max-w-[180px] truncate">{userProfile?.email || (user as any)?.email?.address || ''}</span>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={(user as any)?.google?.profilePictureUrl || (user as any)?.apple?.profilePictureUrl || "/images/avatar.png"} alt={userProfile?.full_name || "Usuario"} />
                            <AvatarFallback>{(userProfile?.full_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium leading-none">{userProfile?.full_name || user?.google?.name || "Usuario"}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[160px]">{userProfile?.email || user?.email?.address || ""}</div>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
                      </Link>
                      <Link href="/dashboard"><DropdownMenuItem className="cursor-pointer">Dashboard</DropdownMenuItem></Link>

                      {/* <Link href="/assistant">
                        <DropdownMenuItem className="cursor-pointer">Asistente</DropdownMenuItem>
                      </Link>
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">Admin</DropdownMenuItem>
                      </Link> */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={async () => { try { await logout(); window.location.href = '/'; } catch(e) { console.error(e);} }}>Cerrar sesión</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Hola, {userProfile?.full_name || user?.google?.name || 'Usuario'}
              </h1>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Cada material que reciclas cuenta. ¡Haz la diferencia hoy!
              </p>
              {userProfile && (
                <div className="mt-4 text-sm text-gray-500">
                  Rol: <span className="font-semibold">{getRoleLabel(userProfile.role)}</span>
                </div>
              )}
              
            </section>

            {/* Contenido por rol: Ciudadano (mostrar skeleton mientras carga) */}
            {(profileLoading || (
              (() => {
                const r = (userProfile?.role || '').toLowerCase();
                return r !== 'assistant' && r !== 'asistente' && r !== 'admin';
              })()
            )) && (
              <div className="px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Tus puntos</CardTitle>
                      <Coins className="size-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      {profileLoading ? (
                        <Skeleton className="h-8 w-32" />
                      ) : (
                        <div className="text-3xl font-bold">{userProfile?.plv_balance ?? 0} PPV</div>
                      )}
                      <CardDescription className="mt-2">Acumula puntos reciclando materiales.</CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Historial de entregas</CardTitle>
                      <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {profileLoading || loadingCitizenData ? (
                        <div className="space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : deliveries.length === 0 ? (
                        <div className="flex items-center justify-center py-10 text-center">
                          <div>
                            <Clock className="mx-auto size-8 text-muted-foreground" />
                            <div className="mt-3 font-medium">Aún no tienes entregas registradas</div>
                            <div className="text-sm text-muted-foreground">Cuando recicles, verás tu historial aquí.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {deliveries.map((d) => (
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

                <div className="mt-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Marketplace</CardTitle>
                        <CardDescription>Canjea tus puntos por recompensas</CardDescription>
                      </div>
                      <ShoppingBag className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {profileLoading || loadingCitizenData ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full" />
                          ))}
                        </div>
                      ) : rewards.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-center">
                          <div>
                            <ShoppingBag className="mx-auto size-8 text-muted-foreground" />
                            <div className="mt-3 font-medium">No hay recompensas disponibles aún</div>
                            <div className="text-sm text-muted-foreground">Pronto habrá opciones para canjear tus puntos.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {rewards.map((r) => (
                            <div key={r.id} className="border rounded-lg p-4">
                              <div className="aspect-video bg-muted rounded mb-3 overflow-hidden">
                                {r.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                                ) : null}
                              </div>
                              <div className="font-medium">{r.title}</div>
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</div>
                              <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="font-semibold">{r.cost_plv} PPV</span>
                                <button className="px-2 py-1 rounded bg-muted text-foreground cursor-not-allowed opacity-60">Canjear</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
{/* 
            <section className="px-6 sm:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="aspect-video bg-gray-200 rounded-md grid place-items-center">
                <div className="w-0 h-0 border-t-[18px] border-t-transparent border-l-[28px] border-l-gray-500 border-b-[18px] border-b-transparent" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">¿Cómo canjear tu reciclaje?</h2>
                <ol className="mt-6 space-y-4 list-decimal list-inside text-gray-700">
                  <li>Selecciona el material que vas a reciclar en la app: cartón, papel, plástico, vidrio, etc.</li>
                  <li>Lleva el material al punto de reciclaje habilitado y pésalo con la ayuda de la báscula conectada.</li>
                  <li>La app registrará el peso y te mostrará cuántos puntos has ganado.</li>
                  <li>Acumula puntos cada vez que recicles.</li>
                  <li>Cuando tengas suficientes puntos, ve a “Canjear puntos” y elige entre productos o beneficios.</li>
                  <li>¡Confirma tu canje y listo! Estás ayudando al planeta y ganando recompensas.</li>
                </ol>
              </div>
            </section>

            <section className="px-6 sm:px-12 py-12">
              <h2 className="text-2xl font-extrabold">Tipos de material reciclable</h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                  { title: "Papel", desc: "Hojas usadas, cuadernos, periódicos, revistas, folletos. Evita papeles sucios o plastificados." },
                  { title: "Cartón", desc: "Cajas limpias, empaques, tubos de cartón. Debe estar seco y sin restos de comida." },
                  { title: "Plástico", desc: "Envases limpios, botellas y tapas. Evita plásticos sucios o con residuos." },
                  { title: "Vidrio", desc: "Botellas y frascos. Evita vidrio roto o espejos." },
                  { title: "Metal", desc: "Latas de gaseosa o cerveza, envases de alimentos. Aplástalas para facilitar el reciclaje." },
                  { title: "Aceite usado", desc: "Aceite de cocina en botellas plásticas. No mezclar con agua ni otros residuos." },
                  { title: "Residuos electrónicos", desc: "Celulares, cargadores, pilas, pequeños electrodomésticos." },
                ].map((item) => (
                  <div key={item.title} className="grid grid-cols-[120px_1fr] items-start gap-6">
                    <div className="w-[120px] h-[90px] bg-gray-200 rounded" />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-700 mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="px-6 sm:px-12 pb-16">
              <button onClick={() => router.push("/onboarding")} className="w-full sm:w-auto block mx-auto rounded-full bg-black text-white px-6 py-3 text-sm font-semibold">
                Onboarding
              </button>
            </div> */}
          </>
        ) : null}
      </div>
    </>
  );
}
