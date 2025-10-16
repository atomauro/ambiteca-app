import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Search, Filter, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMaterials() {
  const router = useRouter();
  const { isLoading, isAuthorized } = useAdminGuard();
  const [materials, setMaterials] = useState<any[]>([]);
  const [ambs, setAmbs] = useState<any[]>([]);
  const [ambSel, setAmbSel] = useState<string>("");
  const [saving, setSaving] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [onlyActive, setOnlyActive] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newMat, setNewMat] = useState({ name: '', unit: 'kg' });

  useEffect(() => {
    const url = new URL('/api/admin/materials', window.location.origin);
    if (ambSel) url.searchParams.set('ambiteca_id', ambSel);
    fetch(url.toString()).then(r => r.json()).then(d => {
      setMaterials(d.materials || []);
      setAmbs(d.ambitecas || []);
    });
  }, [ambSel]);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch = !searchTerm || (m.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesActive = onlyActive === 'all' || (onlyActive === 'active' ? m.is_active : !m.is_active);
      return matchesSearch && matchesActive;
    });
  }, [materials, searchTerm, onlyActive]);

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
    return null; // El hook maneja la redirección
  }

  return (
    <>
      <Head>
        <title>Admin · Materiales</title>
      </Head>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Package className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Gestión de Materiales</h1>
                <p className="text-sm text-muted-foreground">{filtered.length} materiales</p>
              </div>
            </div>
            <div className="ml-auto">
              <Link href="/admin">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="flex gap-6">
            <AdminSidebar />
            <div className="flex-1">
              {/* Filtros */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Filtros</CardTitle>
                  <CardDescription>Busca y filtra materiales por nombre, estado y ambiteca</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Buscar material..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select value={onlyActive} onChange={(e)=> setOnlyActive(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background">
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Ambiteca:</span>
                      <select value={ambSel} onChange={(e)=> setAmbSel(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background">
                        <option value="">Global (todas)</option>
                        {ambs.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div className="ml-auto">
                      <Button size="sm" onClick={()=>setShowCreate(true)}>Nuevo material</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabla */}
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Material</th>
                      <th className="text-left p-3 font-medium">Tarifa (PPV / unidad)</th>
                      <th className="text-left p-3 font-medium">Estado</th>
                      <th className="text-left p-3 font-medium">Imagen</th>
                      <th className="text-right p-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.unit || 'kg'} · ID: {m.id}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <input
                              defaultValue={m.ppv_per_kg}
                              onChange={(e) => setMaterials(prev => prev.map(x => x.id===m.id? { ...x, ppv_per_kg: e.target.value }: x))}
                              className="w-24 rounded border px-2 py-1 text-sm"
                            />
                            <button
                              disabled={saving===m.id}
                              onClick={async () => {
                                setSaving(m.id);
                                try {
                                  const res = await fetch('/api/admin/materials', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: m.id, ppv_per_kg: m.ppv_per_kg, ambiteca_id: ambSel || null }) });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data?.error || 'Error');
                                  toast.success('Tarifa guardada');
                                } catch (e: any) {
                                  toast.error(e.message || 'No se pudo guardar');
                                }
                                setSaving(null);
                              }}
                              className="rounded bg-green-600 text-white px-3 py-1 text-xs disabled:opacity-60"
                            >
                              {saving===m.id? 'Guardando…' : 'Guardar'}
                            </button>
                          </div>
                        </td>
                        <td className="p-3">{m.is_active ? 'Activo' : 'Inactivo'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {m.image_url ? (<img src={m.image_url} alt="img" className="h-10 w-10 object-cover rounded" />) : (
                              <span className="text-xs text-muted-foreground">Sin imagen</span>
                            )}
                            <label className="text-xs underline cursor-pointer">
                              Subir
                              <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const f=e.target.files?.[0]; if (!f) return; try { const sign = await fetch('/api/admin/materials-sign-upload',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fileName: f.name })}); const signed = await sign.json(); if (!sign.ok) throw new Error(signed?.error||'No se pudo firmar'); const put = await fetch(signed.uploadUrl, { method:'PUT', headers:{'Content-Type': f.type}, body: f }); if (!put.ok) throw new Error('Fallo al subir'); const res = await fetch('/api/admin/materials', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: m.id, image_url: signed.publicUrl }) }); if (!res.ok) throw new Error('Fallo al actualizar'); setMaterials(prev => prev.map(x=>x.id===m.id? { ...x, image_url: signed.publicUrl }: x)); } catch(e:any){ toast.error(e.message || 'No se pudo subir'); }} } />
                            </label>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/materials/${m.id}`} className="px-3 py-1 rounded border">Ver</Link>
                            <button onClick={async ()=>{ if(!confirm('¿Eliminar material?')) return; const res = await fetch('/api/admin/materials', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: m.id }) }); if(res.ok) setMaterials(prev=>prev.filter(x=>x.id!==m.id)); }} className="px-3 py-1 rounded border text-red-600">Eliminar</button>
                            <button
                              onClick={async ()=>{
                                try {
                                  const res = await fetch('/api/admin/materials', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: m.id, is_active: !m.is_active })});
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data?.error || 'Error');
                                  setMaterials(prev => prev.map(x => x.id===m.id? { ...x, is_active: !m.is_active }: x));
                                } catch(e:any) {
                                  toast.error(e.message || 'No se pudo actualizar');
                                }
                              }}
                              className="px-3 py-1 rounded border"
                            >{m.is_active? 'Desactivar':'Activar'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length===0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No se encontraron materiales</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {showCreate && (
                <div className="fixed inset-0 bg-black/30 grid place-items-center">
                  <div className="bg-card rounded-md border w-full max-w-md p-4">
                    <h3 className="text-lg font-semibold mb-3">Nuevo material</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Nombre</label>
                        <input value={newMat.name} onChange={(e)=>setNewMat(s=>({ ...s, name: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Unidad</label>
                        <select value={newMat.unit} onChange={(e)=>setNewMat(s=>({ ...s, unit: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background">
                          <option value="kg">kg</option>
                          <option value="unidad">unidad</option>
                          <option value="litro">litro</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={()=>setShowCreate(false)}>Cancelar</Button>
                      <Button size="sm" onClick={async ()=>{ if(!newMat.name.trim()) return; const res = await fetch('/api/admin/materials', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newMat) }); const d = await res.json(); if(res.ok){ setShowCreate(false); setMaterials(prev=> [{ id: d.id, name: newMat.name, unit: newMat.unit, is_active: true, ppv_per_kg: 1 }, ...prev]); setNewMat({ name:'', unit:'kg' }); } }}>Crear</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}


