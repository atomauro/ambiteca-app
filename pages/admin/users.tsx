import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRoleLabel } from '@/lib/utils-client';
import { 
  Users, 
  ArrowLeft,
  Wallet,
  Calendar,
  Mail,
  Phone,
  Activity,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

// Usar cliente compartido para evitar múltiples GoTrueClient

interface UserComplete {
  user_id: string;
  privy_user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string;
  primary_wallet_address: string;
  primary_wallet_chain: string;
  has_embedded_wallet: boolean;
  ppv_balance?: number;
  plv_balance?: number;
}

export default function UsersPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const [users, setUsers] = useState<UserComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      loadUsers();
    }
  }, [authenticated]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('v_user_complete')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, role }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al actualizar rol');
      await loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const updateUserActive = async (userId: string, is_active: boolean) => {
    try {
      const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, is_active }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al actualizar estado');
      await loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.primary_wallet_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'assistant': return 'secondary';
      case 'citizen': return 'default';
      default: return 'outline';
    }
  };

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Gestión de Usuarios - AMBITECA Admin</title>
      </Head>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Gestión de Usuarios</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length} usuarios encontrados
                </p>
              </div>
            </div>
            
            <div className="ml-auto">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
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
              <CardDescription>
                Busca y filtra usuarios por diferentes criterios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email o dirección..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="admin">Administradores</option>
                    <option value="assistant">Asistentes</option>
                    <option value="citizen">Ciudadanos</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Usuarios */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Usuario</th>
                      <th className="text-left p-3 font-medium">Rol</th>
                      <th className="text-left p-3 font-medium">PPV</th>
                      <th className="text-left p-3 font-medium">Wallet</th>
                      <th className="text-right p-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.user_id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{u.full_name || 'Sin nombre'}</div>
                          <div className="text-xs text-muted-foreground">{u.email || ''}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(u.role)}>{getRoleLabel(u.role)}</Badge>
                            {!u.is_active && (<Badge variant="outline">Inactivo</Badge>)}
                          </div>
                          <div className="mt-1 flex gap-2 text-xs">
                            <button onClick={() => updateUserRole(u.user_id, 'citizen')} className="underline">Ciudadano</button>
                            <button onClick={() => updateUserRole(u.user_id, 'assistant')} className="underline">Asistente</button>
                            <button onClick={() => updateUserRole(u.user_id, 'admin')} className="underline">Admin</button>
                          </div>
                        </td>
                        <td className="p-3">{Number(u.ppv_balance ?? u.plv_balance ?? 0).toFixed(2)} PPV</td>
                        <td className="p-3 text-xs text-muted-foreground font-mono">{u.primary_wallet_address ? `${u.primary_wallet_address.slice(0,6)}...${u.primary_wallet_address.slice(-4)}` : '—'}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/users/${u.user_id}`} className="px-3 py-1 rounded border">Ver</Link>
                            <button onClick={() => updateUserActive(u.user_id, !u.is_active)} className="px-3 py-1 rounded border">{u.is_active ? 'Desactivar' : 'Activar'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No se encontraron usuarios</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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