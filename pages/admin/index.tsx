import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import type { GetServerSideProps } from "next";
import { createSupabaseServer } from "../../lib/supabase/server";
import toast from "react-hot-toast";

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

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users || []));
    fetch("/api/admin/materials").then(r => r.json()).then(d => setMaterials(d.materials || []));
  }, []);

  const usersKpi = {
    total: users.length,
    activos: users.filter(u => u.is_active).length,
    asistentes: users.filter(u => u.role==='assistant').length,
  };

  const dataDeliveries = users.map(u => ({ name: u.fullName.split(" ")[1] || u.fullName, value: u.deliveries }));
  const dataPlv = users.map(u => ({ name: u.fullName.split(" ")[1] || u.fullName, value: u.plv }));

  return (
    <>
      <Head>
        <title>Admin · Panel</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Panel administrativo</h1>
          <nav className="flex gap-3 text-sm">
            <Link href="/admin/users" className="underline">Usuarios</Link>
            <Link href="/admin/materials" className="underline">Materiales</Link>
            <Link href="/admin/ambitecas" className="underline">Ambitecas</Link>
          </nav>
        </div>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Usuarios</p>
            <p className="text-3xl font-extrabold">{usersKpi.total}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Activos</p>
            <p className="text-3xl font-extrabold">{usersKpi.activos}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Asistentes</p>
            <p className="text-3xl font-extrabold">{usersKpi.asistentes}</p>
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
            <h2 className="font-semibold mb-4">PLV acumulado por usuario</h2>
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
          </div>
        </section>

        <section className="mt-10 rounded-lg border p-5">
          <h2 className="font-semibold mb-4">Materiales (tarifa PLV por kg)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {materials.map(m => (
              <div key={m.id} className="rounded border p-4">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-600 mt-1">{m.plv_per_kg} PLV/kg</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-5">
            <h3 className="font-semibold mb-3">Accesos rápidos</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/admin/users" className="rounded bg-gray-100 px-4 py-2">Usuarios</Link>
              <Link href="/admin/materials" className="rounded bg-gray-100 px-4 py-2">Materiales</Link>
              <Link href="/admin/ambitecas" className="rounded bg-gray-100 px-4 py-2">Ambitecas</Link>
            </div>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-semibold mb-3">Crear nueva ambiteca</h3>
            <QuickCreateAmbiteca />
          </div>
        </section>
      </main>
    </>
  );
}

function QuickCreateAmbiteca() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ambitecas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');
      setOk(data.id || 'ok');
      setName("");
      toast.success('Ambiteca creada');
    } catch (e: any) {
      toast.error(e.message || 'No se pudo crear la ambiteca');
    }
    setLoading(false);
  };
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nombre de la ambiteca" className="rounded border px-3 py-2 text-sm flex-1" />
      <button onClick={submit} disabled={loading} className="rounded bg-green-600 text-white px-4 py-2 text-sm disabled:opacity-60">{loading? 'Creando…':'Crear'}</button>
      {ok ? <span className="text-xs text-green-700">Creada ({ok})</span> : null}
    </div>
  );
}


