import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { createSupabaseServer } from "../lib/supabase/server";
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

export default function AdminMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [ambs, setAmbs] = useState<any[]>([]);
  const [ambSel, setAmbSel] = useState<string>("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/materials').then(r => r.json()).then(d => {
      setMaterials(d.materials || []);
      setAmbs(d.ambitecas || []);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Admin · Materiales</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 py-10">
        <nav className="text-sm text-gray-600 mb-3 flex gap-2 flex-wrap">
          <Link href="/admin" className="underline">Admin</Link>
          <span>/</span>
          <span className="text-gray-800">Materiales</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Materiales</h1>
          <Link href="/admin" className="underline text-sm">Volver al panel</Link>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <label className="text-sm">Ambiteca:</label>
          <select value={ambSel} onChange={(e)=> setAmbSel(e.target.value)} className="rounded border px-2 py-1 text-sm">
            <option value="">Global (todas)</option>
            {ambs.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(m => (
            <div key={m.id} className="rounded-lg border p-5">
              <p className="font-semibold">{m.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Tarifa:</span>
                <input
                  defaultValue={m.plv_per_kg}
                  onChange={(e) => setMaterials(prev => prev.map(x => x.id===m.id? { ...x, plv_per_kg: e.target.value }: x))}
                  className="w-24 rounded border px-2 py-1 text-sm"
                />
                <span className="text-sm">PLV/kg</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  disabled={saving===m.id}
                  onClick={async () => {
                    setSaving(m.id);
                    try {
                      const res = await fetch('/api/admin/materials', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: m.id, plv_per_kg: m.plv_per_kg, ambiteca_id: ambSel || null }) });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data?.error || 'Error');
                      toast.success('Tarifa guardada');
                    } catch (e: any) {
                      toast.error(e.message || 'No se pudo guardar');
                    }
                    setSaving(null);
                  }}
                  className="rounded bg-green-600 text-white px-4 py-2 text-sm disabled:opacity-60"
                >
                  {saving===m.id? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}


