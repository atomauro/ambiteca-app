import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function AdminAmbitecas() {
  const [ambs, setAmbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => fetch('/api/admin/ambitecas').then(r => r.json()).then(d => setAmbs(d.ambitecas || []));
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, is_active: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ambitecas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, is_active }) });
      if (!res.ok) throw new Error('No se pudo actualizar');
      setAmbs(prev => prev.map(a => a.id===id? { ...a, is_active }: a));
      toast.success(is_active? 'Ambiteca activada':'Ambiteca desactivada');
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Admin · Ambitecas</title>
      </Head>
      <main className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-600 mb-3 flex gap-2 flex-wrap">
          <Link href="/admin" className="underline">Admin</Link>
          <span>/</span>
          <span className="text-gray-800">Ambitecas</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Ambitecas</h1>
          <nav className="text-sm flex gap-3">
            <Link href="/admin" className="underline">Panel</Link>
            <Link href="/admin/materials" className="underline">Materiales</Link>
            <Link href="/admin/users" className="underline">Usuarios</Link>
          </nav>
        </div>

        <div className="mt-8 overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-center">Activo</th>
              </tr>
            </thead>
            <tbody>
              {ambs.map(a => (
                <tr key={a.id} className="border-b">
                  <td className="p-3">{a.name}</td>
                  <td className="p-3">{a.id}</td>
                  <td className="p-3 text-center">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={a.is_active} onChange={(e) => toggle(a.id, e.target.checked)} disabled={loading} />
                      <span className="text-xs">{a.is_active? 'Sí':'No'}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}


