import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase/client";

interface Ambiteca {
  id: string;
  name: string;
  is_active: boolean;
}

export default function AdminAmbitecas() {
  const [ambs, setAmbs] = useState<Ambiteca[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('ambitecas').select('id,name,is_active').order('name');
      if (!error) setAmbs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = ambs.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = async (id: string, is_active: boolean) => {
    const prev = ambs;
    setAmbs(prev.map(a => a.id===id? { ...a, is_active: !is_active } : a));
    const { error } = await supabase.from('ambitecas').update({ is_active: !is_active }).eq('id', id);
    if (error) setAmbs(prev); // rollback
  };

  return (
    <>
      <Head>
        <title>Admin · Ambitecas</title>
      </Head>
      <div className="min-h-screen bg-background">
        <main className="p-6">
          <div className="flex gap-6">
            <AdminSidebar />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h1 className="text-2xl font-extrabold">Ambitecas</h1>
                <Link href="/admin" className="underline text-sm">Volver al panel</Link>
              </div>

              <div className="mb-4">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar ambiteca..." className="w-full sm:w-80 rounded border px-3 py-2 text-sm" />
              </div>

              {loading ? (
                <div className="h-40 grid place-items-center text-sm text-muted-foreground">Cargando…</div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Nombre</th>
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-right p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="p-3">{a.name}</td>
                          <td className="p-3">{a.is_active ? 'Activa' : 'Inactiva'}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/ambitecas/${a.id}`} className="px-3 py-1 rounded border">Ver</Link>
                              <button onClick={()=>toggleActive(a.id, a.is_active)} className="px-3 py-1 rounded border">{a.is_active? 'Desactivar':'Activar'}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length===0 && (
                        <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No se encontraron ambitecas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

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


