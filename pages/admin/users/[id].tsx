import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { GetServerSideProps } from "next";
import { createSupabaseServer } from "../../../lib/supabase/server";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createSupabaseServer(ctx.req as any);
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return { redirect: { destination: "/auth/login", permanent: false }, props: {} };
  const { data: profile } = await supabase.from("profiles").select("role,is_active").eq("user_id", userId).maybeSingle();
  if (!profile || profile.role !== "admin" || profile.is_active === false) {
    return { redirect: { destination: "/", permanent: false }, props: {} };
  }
  return { props: {} };
};

export default function AdminUserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      const found = (d.users || []).find((u: any) => u.id === id);
      setUser(found || null);
    });
  }, [id]);

  const deliveriesByMonth = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ name: `M${i+1}`, value: Math.floor(Math.random()*12) })), []);
  const plvByMonth = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ name: `M${i+1}`, value: Number((Math.random()*60).toFixed(3)) })), []);

  if (!user) return (
    <main className="min-h-screen bg-white px-6 sm:px-12 py-10">
      <p>Cargando…</p>
    </main>
  );

  return (
    <>
      <Head>
        <title>Admin · {user.fullName}</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 py-10">
        <nav className="text-sm text-gray-600 mb-3 flex gap-2 flex-wrap">
          <Link href="/admin" className="underline">Admin</Link>
          <span>/</span>
          <Link href="/admin/users" className="underline">Usuarios</Link>
          <span>/</span>
          <span className="text-gray-800">{user?.fullName || 'Detalle'}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
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
            <h2 className="font-semibold mb-4">Entregas por mes</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveriesByMonth}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold mb-4">PLV por mes</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={plvByMonth}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


