import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import { cropAndCompressImageSquare } from "@/lib/utils-client";

export const getServerSideProps = async () => ({ props: {} });

export default function AdminAmbitecaDetail() {
  const router = useRouter();
  const { id } = router.query;
  const ambId = Array.isArray(id) ? id[0] : (id ? String(id) : '');
  const [amb, setAmb] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, isAuthorized } = useAdminGuard();

  useEffect(() => {
    if (!ambId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/ambitecas?id=${encodeURIComponent(ambId)}`);
        const d = await res.json();
        if (!res.ok) throw new Error(d?.error || 'No se pudo cargar');
        setAmb(d.ambiteca);
      } catch(e:any) {
        setError(e.message || 'Error desconocido');
      }
      setLoading(false);
    })();
  }, [ambId]);

  if (isLoading || loading) return (
    <main className="min-h-screen bg-background p-6">
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="flex-1">Cargando…</div>
      </div>
    </main>
  );

  if (!isAuthorized) return null;

  if (!amb) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="flex gap-6">
          <AdminSidebar />
          <div className="flex-1">
            <div className="rounded-lg border p-6">
              <p className="text-sm text-red-600">No se encontró la ambiteca.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const patch = async (fields: Record<string, any>) => {
    if (!ambId) return;
    try {
      const res = await fetch('/api/admin/ambitecas', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: ambId, ...fields }) });
      if (!res.ok) throw new Error('No se pudo guardar');
      setAmb((prev:any) => ({ ...prev, ...fields }));
    } catch(e) { /* noop simple */ }
  };

  return (
    <>
      <Head>
        <title>Admin · {amb?.name || 'Ambiteca'}</title>
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
              {error ? (
                <div className="mb-4 text-sm text-red-600">{error}</div>
              ) : null}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-600">Dirección</p>
                  <input defaultValue={amb.address || ''} onBlur={(e)=>patch({ address: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-600">Contacto</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    <input defaultValue={amb.contact_name || ''} placeholder="Nombre" onBlur={(e)=>patch({ contact_name: e.target.value })} className="px-3 py-2 border rounded-md bg-background" />
                    <input defaultValue={amb.phone || ''} placeholder="Teléfono" onBlur={(e)=>patch({ phone: e.target.value })} className="px-3 py-2 border rounded-md bg-background" />
                    <input defaultValue={amb.email || ''} placeholder="Email" onBlur={(e)=>patch({ email: e.target.value })} className="px-3 py-2 border rounded-md bg-background sm:col-span-2" />
                  </div>
                </div>
                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-600">Horario</p>
                  <input defaultValue={amb.opening_hours || ''} onBlur={(e)=>patch({ opening_hours: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md bg-background" />
                </div>
              </section>

              <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-lg border p-5">
                  <p className="text-sm text-gray-600 mb-2">Imagen</p>
                  <div className="flex items-center gap-3">
                    {amb.image_url ? (<img src={amb.image_url} alt="img" className="h-16 w-16 object-cover rounded" />) : (<div className="h-16 w-16 grid place-items-center text-xs text-muted-foreground border rounded">Sin imagen</div>)}
                    <label className="text-xs underline cursor-pointer">
                      Subir
                      <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const raw=e.target.files?.[0]; if (!raw) return; try { setUploading(true); const f = await cropAndCompressImageSquare(raw, { maxSize: 800, quality: 0.85 }); const sign = await fetch('/api/admin/ambitecas-sign-upload',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fileName: f.name })}); const signed = await sign.json(); if (!sign.ok) throw new Error(signed?.error||'No se pudo firmar'); const put = await fetch(signed.uploadUrl, { method:'PUT', headers:{'Content-Type': f.type}, body: f }); if (!put.ok) throw new Error('Fallo al subir'); const res = await fetch('/api/admin/ambitecas', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: ambId, image_url: signed.publicUrl }) }); if (!res.ok) throw new Error('Fallo al actualizar'); setAmb((prev:any)=> ({ ...prev, image_url: signed.publicUrl })); } finally { setUploading(false);} }} />
                    </label>
                  </div>
                </div>
                <div className="rounded-lg border p-5 sm:col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Notas</p>
                  <textarea defaultValue={amb.notes || ''} onBlur={(e)=>patch({ notes: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" rows={3} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


