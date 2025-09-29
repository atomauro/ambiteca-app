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
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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
  plv_balance: number;
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
              {filteredUsers.map((user) => (
                <Card key={user.user_id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{user.full_name || 'Sin nombre'}</h3>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            {!user.is_active && (
                              <Badge variant="outline">Inactivo</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {user.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Registrado: {new Date(user.created_at).toLocaleDateString('es-CO')}</span>
                            </div>
                            {user.last_login_at && (
                              <div className="flex items-center space-x-1">
                                <Activity className="h-3 w-3" />
                                <span>Último acceso: {new Date(user.last_login_at).toLocaleDateString('es-CO')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        {user.has_embedded_wallet && (
                          <div className="flex items-center justify-end space-x-2">
                            <Wallet className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">Wallet embebida</span>
                          </div>
                        )}
                        
                        {user.plv_balance > 0 && (
                          <div className="text-sm">
                            <span className="font-semibold text-primary">
                              {Number(user.plv_balance).toFixed(2)} PPV
                            </span>
                          </div>
                        )}
                        
                        {user.primary_wallet_address && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {user.primary_wallet_address.slice(0, 6)}...{user.primary_wallet_address.slice(-4)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredUsers.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || roleFilter !== 'all' 
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'No hay usuarios registrados en el sistema'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}