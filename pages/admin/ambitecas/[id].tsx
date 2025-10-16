import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";

export const getServerSideProps = async () => ({ props: {} });

export default function AdminAmbitecaDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [amb, setAmb] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/admin/ambitecas?id=${id}`);
      const d = await res.json();
      if (res.ok) setAmb(d.ambiteca);
    })();
  }, [id]);

  if (!amb) return (
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
        <title>Admin · {amb.name}</title>
      </Head>
      <main className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{amb.name}</h1>
                <p className="text-sm text-muted-foreground">{amb.city || 'San Luis'}, {amb.state || 'Antioquia'}</p>
              </div>
            </div>
            <div className="ml-auto">
              <Link href="/admin">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="p-6">
          <div className="flex gap-6">
            <AdminSidebar />
            <div className="flex-1">
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-semibold">{amb.address || '—'}</p>
                </div>
                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-600">Contacto</p>
                  <p className="font-semibold">{amb.contact_name || '—'} {amb.phone ? `· ${amb.phone}` : ''}</p>
                </div>
                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-600">Horario</p>
                  <p className="font-semibold">{amb.opening_hours || '—'}</p>
                </div>
              </section>

              <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-600 mb-2">Imagen</p>
                  <div className="flex items-center gap-3">
                    {amb.image_url ? (<img src={amb.image_url} alt="img" className="h-16 w-16 object-cover rounded" />) : (<div className="h-16 w-16 grid place-items-center text-xs text-muted-foreground border rounded">Sin imagen</div>)}
                    <label className="text-xs underline cursor-pointer">
                      Subir
                      <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const f=e.target.files?.[0]; if (!f) return; try { setUploading(true); const sign = await fetch('/api/admin/ambitecas-sign-upload',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fileName: f.name })}); const signed = await sign.json(); if (!sign.ok) throw new Error(signed?.error||'No se pudo firmar'); const put = await fetch(signed.uploadUrl, { method:'PUT', headers:{'Content-Type': f.type}, body: f }); if (!put.ok) throw new Error('Fallo al subir'); const res = await fetch('/api/admin/ambitecas', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, image_url: signed.publicUrl }) }); if (!res.ok) throw new Error('Fallo al actualizar'); setAmb((prev:any)=> ({ ...prev, image_url: signed.publicUrl })); } finally { setUploading(false);} }} />
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


