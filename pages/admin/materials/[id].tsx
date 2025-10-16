import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const getServerSideProps = async () => ({ props: {} });

export default function AdminMaterialDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [material, setMaterial] = useState<any | null>(null);
  const [ambs, setAmbs] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/admin/materials?id=${id}`);
      const data = await res.json();
      if (res.ok) {
        setMaterial(data.material);
        setAmbs(data.ambitecas || []);
        setRates(data.rates || []);
      }
    })();
  }, [id]);

  if (!material) return (
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
        <title>Admin · {material.name}</title>
      </Head>
      <main className="min-h-screen bg-background p-6">
        <div className="flex gap-6">
          <AdminSidebar />
          <div className="flex-1">
        <nav className="text-sm text-gray-600 mb-3 flex gap-2 flex-wrap">
          <Link href="/admin" className="underline">Admin</Link>
          <span>/</span>
          <Link href="/admin/materials" className="underline">Materiales</Link>
          <span>/</span>
          <span className="text-gray-800">{material?.name || 'Detalle'}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">{material.name}</h1>
          <Link href="/admin/materials" className="underline text-sm">Volver</Link>
        </div>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Unidad</p>
            <p className="font-semibold">{material.unit}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Estado</p>
            <p className="font-semibold">{material.is_active? 'Activo' : 'Inactivo'}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-600">Tarifa vigente (global)</p>
            <p className="font-semibold">{(() => {
              const today = new Date().toISOString().slice(0,10);
              const current = rates.find((r:any) => !r.ambiteca_id && r.valid_from <= today && (!r.valid_to || r.valid_to >= today));
              return current ? `${current.plv_per_kg} PPV/kg` : '—';
            })()}</p>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-lg border p-5 sm:col-span-1">
            <p className="text-sm text-gray-600 mb-2">Imagen</p>
            <div className="flex items-center gap-3">
              {material.image_url ? (<img src={material.image_url} alt="img" className="h-16 w-16 object-cover rounded" />) : (<div className="h-16 w-16 grid place-items-center text-xs text-muted-foreground border rounded">Sin imagen</div>)}
              <label className="text-xs underline cursor-pointer">
                Subir
                <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const f=e.target.files?.[0]; if (!f) return; try { setUploading(true); const sign = await fetch('/api/admin/materials-sign-upload',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fileName: f.name })}); const signed = await sign.json(); if (!sign.ok) throw new Error(signed?.error||'No se pudo firmar'); const put = await fetch(signed.uploadUrl, { method:'PUT', headers:{'Content-Type': f.type}, body: f }); if (!put.ok) throw new Error('Fallo al subir'); const res = await fetch('/api/admin/materials', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, image_url: signed.publicUrl }) }); if (!res.ok) throw new Error('Fallo al actualizar'); setMaterial((prev:any)=> ({ ...prev, image_url: signed.publicUrl })); } finally { setUploading(false);} }} />
              </label>
            </div>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold mb-4">Historial de tarifas (global y por ambiteca)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Ámbito</th>
                    <th className="text-left p-3">PPV/kg</th>
                    <th className="text-left p-3">Desde</th>
                    <th className="text-left p-3">Hasta</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r:any) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3">{r.ambiteca_id ? (ambs.find(a=>a.id===r.ambiteca_id)?.name || '—') : 'Global'}</td>
                      <td className="p-3">{r.plv_per_kg}</td>
                      <td className="p-3">{r.valid_from}</td>
                      <td className="p-3">{r.valid_to || '—'}</td>
                    </tr>
                  ))}
                  {rates.length===0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Sin tarifas registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border p-5">
            <h2 className="font-semibold mb-4">Tarifas por ambiteca vigentes</h2>
            <div className="space-y-2 text-sm">
              {ambs.map((a:any) => {
                const today = new Date().toISOString().slice(0,10);
                const current = rates.find((r:any) => r.ambiteca_id===a.id && r.valid_from <= today && (!r.valid_to || r.valid_to >= today));
                return (
                  <div key={a.id} className="flex items-center justify-between border-b py-2">
                    <span>{a.name}</span>
                    <span className="text-muted-foreground">{current ? `${current.plv_per_kg} PPV/kg` : '—'}</span>
                  </div>
                );
              })}
              {ambs.length===0 && (
                <div className="text-muted-foreground">Sin ambitecas activas</div>
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


