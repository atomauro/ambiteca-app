import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import toast from "react-hot-toast";
import { usePrivy } from "@privy-io/react-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserMenu from "@/components/UserMenu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { isLoading, isAuthorized } = useAdminGuard();
  const [users, setUsers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [ambs, setAmbs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({users:0,ambitecas:0,deliveries:0,ppv:0,materialsWithRate:0,rewardsActive:0,rewardsOutOfStock:0,topMaterials:[]});
  const [metricsLoading, setMetricsLoading] = useState(true);
  const { user, logout } = usePrivy();
  const avatarUrl = (user as any)?.google?.profilePictureUrl || (user as any)?.apple?.profilePictureUrl || "/images/avatar.png";
  const displayName = (user as any)?.google?.name || (user as any)?.apple?.name || ((user as any)?.email?.address ? (user as any)?.email?.address.split('@')[0] : 'Usuario');
  const emailAddr = (user as any)?.email?.address || '';

  const [ambSel, setAmbSel] = useState<string>("");
  const refreshAll = async () => {
    try {
      setMetricsLoading(true);
      fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users || []));
      fetch("/api/admin/materials").then(r => r.json()).then(d => { setMaterials(d.materials || []); setAmbs(d.ambitecas || []); });
      const url = new URL('/api/admin/metrics', window.location.origin);
      if (ambSel) url.searchParams.set('ambiteca_id', ambSel);
      const res = await fetch(url.toString());
      const d = await res.json();
      if (!res.ok || d?.error) throw new Error(d?.error || 'No se pudieron cargar métricas');
      setMetrics(d || {});
      toast.success('Actualizado');
    } catch (e:any) {
      toast.error(e.message || 'Error al actualizar');
    } finally {
      setMetricsLoading(false);
    }
  };
  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users || []));
    fetch("/api/admin/materials").then(r => r.json()).then(d => { setMaterials(d.materials || []); setAmbs(d.ambitecas || []); });
    const url = new URL('/api/admin/metrics', window.location.origin);
    if (ambSel) url.searchParams.set('ambiteca_id', ambSel);
    setMetricsLoading(true);
    fetch(url.toString()).then(async r => { const d = await r.json(); if (!r.ok || d?.error) { toast.error(d?.error || 'No se pudieron cargar métricas'); return; } setMetrics(d || {}); }).finally(()=> setMetricsLoading(false));
  }, [ambSel]);

  const usersKpi = {
    total: users.length,
    activos: users.filter(u => u.is_active).length,
    asistentes: users.filter(u => u.role==='assistant').length,
  };

  const dataDeliveries = users.map(u => ({ name: (u.fullName || u.full_name || 'Usuario').split(" ")[0], value: u.deliveries ?? 0 }));
  const dataPlv = users.map(u => ({ name: (u.fullName || u.full_name || 'Usuario').split(" ")[0], value: u.ppv ?? u.plv ?? 0 }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // El hook ya maneja la redirección
  }

  return (
    <>
      <Head>
        <title>Admin · Panel</title>
      </Head>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Recycle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
            </div>

            <div className="flex items-center gap-4"><UserMenu /></div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <AdminSidebar />
          <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Panel administrativo</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ambiteca:</span>
            <select value={ambSel} onChange={(e)=>setAmbSel(e.target.value)} className="px-3 py-2 border rounded-md bg-background">
              <option value="">Global</option>
              {ambs.map((a:any)=> (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={refreshAll} disabled={metricsLoading}>Actualizar</Button>
          </div>
        </div>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Usuarios</p>
            {metricsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold">{metrics.users || 0}</p>}
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Ambitecas</p>
            {metricsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold">{metrics.ambitecas || 0}</p>}
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Entregas</p>
            {metricsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold">{metrics.deliveries || 0}</p>}
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">PPV total</p>
            {metricsLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-extrabold">{Number.isFinite(Number(metrics.ppv)) ? Number(metrics.ppv).toFixed(2) : '0.00'} PPV</p>}
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Materiales con tarifa vigente</p>
            {metricsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold">{metrics.materialsWithRate ?? 0}</p>}
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Recompensas activas</p>
            {metricsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold">{metrics.rewardsActive ?? 0}</p>}
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Sin stock</p>
            {metricsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-extrabold">{metrics.rewardsOutOfStock ?? 0}</p>}
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold mb-4">Entregas por usuario</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataDeliveries}>
                  <XAxis dataKey="name" hide={false} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold mb-4">PPV acumulado por usuario</h2>
            {metricsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataPlv}>
                    <XAxis dataKey="name" hide={false} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-lg border p-5">
          <h2 className="font-semibold mb-4">Top materiales por PPV (últimos 30 días)</h2>
          {metricsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Array.isArray((metrics as any).topMaterials) ? (metrics as any).topMaterials : []}>
                  <XAxis dataKey="name" hide={false} tick={{ fontSize: 12 }} interval={0} angle={-20} height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-lg border p-5">
          <h2 className="font-semibold mb-4">Materiales (tarifa PPV por kg)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {materials.map(m => (
              <div key={m.id} className="rounded border p-4">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-600 mt-1">{m.ppv_per_kg} PPV/kg</p>
              </div>
            ))}
          </div>
        </section>

        {/* Secciones de acceso rápido y creación de ambiteca removidas a solicitud */}
          </div>
        </div>
      </main>
      </div>
    </>
  );
}

// Componente de creación rápida eliminado


