import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase/client";

export const getServerSideProps = async () => ({ props: {} });

export default function AdminUserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any | null>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [assists, setAssists] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: u } = await supabase.from('v_user_complete').select('*').eq('user_id', id).maybeSingle();
      setUser(u || null);
      if (!u) return;
      if ((u.role || '').toLowerCase() === 'citizen') {
        const { data: prof } = await supabase.from('profiles').select('person_id').eq('user_id', u.user_id).maybeSingle();
        if (prof?.person_id) {
          const { data: ds } = await supabase.from('deliveries').select('id, delivered_at, ambiteca_id').eq('person_id', prof.person_id).order('delivered_at', { ascending: false }).limit(20);
          setDeliveries(ds || []);
        }
      }
      if ((u.role || '').toLowerCase() === 'assistant') {
        const { data: as } = await supabase.from('deliveries').select('id, delivered_at, ambiteca_id').eq('assistant_user_id', u.user_id).order('delivered_at', { ascending: false }).limit(20);
        setAssists(as || []);
      }
    })();
  }, [id]);

  const deliveriesByMonth = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ name: `M${i+1}`, value: Math.floor(Math.random()*12) })), []);
  const plvByMonth = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ name: `M${i+1}`, value: Number((Math.random()*60).toFixed(3)) })), []);

  if (!user) return (
    <main className="min-h-screen bg-background p-6">
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="flex-1">Cargando…</div>
      </div>
    </main>
  );

  return (
    <>
      <Head>
        <title>Admin · {user.fullName}</title>
      </Head>
      <main className="min-h-screen bg-background p-6">
        <div className="flex gap-6">
          <AdminSidebar />
          <div className="flex-1">
        <nav className="text-sm text-gray-600 mb-3 flex gap-2 flex-wrap">
          <Link href="/admin" className="underline">Admin</Link>
          <span>/</span>
          <Link href="/admin/users" className="underline">Usuarios</Link>
          <span>/</span>
          <span className="text-gray-800">{user?.full_name || 'Detalle'}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">{user.full_name || 'Usuario'}</h1>
          <Link href="/admin/users" className="underline text-sm">Volver</Link>
        </div>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Rol</p>
            <p className="font-semibold">{user.role}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Activo</p>
            <p className="font-semibold">{user.is_active? 'Sí' : 'No'}</p>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold mb-4">Actividad</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(user.role==='citizen'? deliveries: assists).map((d:any,i:number)=>({ name: `#${i+1}`, value: 1 }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold mb-4">Registros recientes</h2>
            <div className="space-y-2 text-sm">
              {(user.role==='citizen'? deliveries: assists).slice(0,10).map((d:any)=> (
                <div key={d.id} className="flex items-center justify-between border-b py-2">
                  <span>Entrega</span>
                  <span className="text-muted-foreground">{new Date(d.delivered_at).toLocaleString()}</span>
                </div>
              ))}
              {((user.role==='citizen'? deliveries: assists).length===0) && (
                <div className="text-muted-foreground">No hay registros</div>
              )}
            </div>
          </div>
        </section>
          </div>
        </div>
      </main>
    </>
  );
}


