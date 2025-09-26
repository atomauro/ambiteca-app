import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import toast from "react-hot-toast";

export default function AdminUsersList() {
  const { isLoading, isAuthorized } = useAdminGuard();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users || []));
  }, []);

  const toggleActive = async (id: string, is_active: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id, is_active }) });
      if (!res.ok) throw new Error('No se pudo actualizar');
      setUsers(prev => prev.map(u => u.id===id? { ...u, is_active }: u));
      toast.success(is_active? 'Usuario activado' : 'Usuario desactivado');
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

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
    return null;
  }

  return (
    <>
      <Head>
        <title>Admin · Usuarios</title>
      </Head>
      <main className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Usuarios</h1>
          <Link href="/admin" className="underline text-sm">Volver al panel</Link>
        </div>

        <div className="mt-8 overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Correo</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Entregas</th>
                <th className="p-3">PLV</th>
                <th className="p-3">Activo</th>
                <th className="p-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-center">{u.role}</td>
                  <td className="p-3 text-center">{u.deliveries}</td>
                  <td className="p-3 text-center">{u.plv}</td>
                  <td className="p-3 text-center">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={u.is_active} onChange={(e) => toggleActive(u.id, e.target.checked)} disabled={loading} />
                      <span className="text-xs">{u.is_active? 'Sí':'No'}</span>
                    </label>
                  </td>
                  <td className="p-3 text-center">
                    <Link href={`/admin/users/${u.id}`} className="underline">Ver</Link>
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


