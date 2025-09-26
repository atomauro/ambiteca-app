import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Recycle, 
  Coins, 
  TrendingUp, 
  Calendar,
  MapPin,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  Leaf,
  Wallet
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

interface DashboardStats {
  total_users: number;
  users_today: number;
  users_this_week: number;
  total_deliveries: number;
  deliveries_today: number;
  total_weight_kg: number;
  total_plv_issued: number;
  total_plv_redeemed: number;
  top_material: string;
  top_ambiteca: string;
}

interface RecentActivity {
  activity_type: string;
  activity_id: string;
  activity_date: string;
  user_name: string;
  ambiteca_name: string;
  description: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      loadDashboardData();
    }
  }, [authenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const { data: statsData, error: statsError } = await supabase
        .from('v_dashboard_stats')
        .select('*')
        .single();

      if (statsError) {
        console.error('Error loading stats:', statsError);
      } else {
        setStats(statsData);
      }

      // Cargar actividad reciente
      const { data: activityData, error: activityError } = await supabase
        .from('v_recent_activity')
        .select('*')
        .limit(10);

      if (activityError) {
        console.error('Error loading activity:', activityError);
      } else {
        setRecentActivity(activityData || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Panel Administrativo - AMBITECA</title>
      </Head>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <Leaf className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">AMBITECA Admin</h1>
                <p className="text-sm text-muted-foreground">Panel de Control</p>
              </div>
            </div>
            
            <div className="ml-auto flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/assistant')}>
                <Activity className="mr-2 h-4 w-4" />
                Asistente
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estadísticas Principales */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.users_today || 0} hoy
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Entregas</CardTitle>
                    <Recycle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.total_deliveries || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.deliveries_today || 0} hoy
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Material Reciclado</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.total_weight_kg ? `${Number(stats.total_weight_kg).toFixed(1)} kg` : '0 kg'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Material: {stats?.top_material || 'N/A'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tokens PPV</CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.total_plv_issued ? Number(stats.total_plv_issued).toFixed(0) : '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.total_plv_redeemed ? Number(stats.total_plv_redeemed).toFixed(0) : '0'} canjeados
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos y Actividad */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Actividad Reciente */}
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>
                      Últimas entregas de reciclaje registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                              <Recycle className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {activity.user_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {activity.description} en {activity.ambiteca_name}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(activity.activity_date).toLocaleDateString('es-CO')}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay actividad reciente
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Resumen de Ambitecas */}
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Ambitecas</CardTitle>
                    <CardDescription>
                      Puntos de reciclaje más activos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10">
                          <MapPin className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {stats?.top_ambiteca || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Más activa
                          </p>
                        </div>
                        <Badge variant="secondary">Top</Badge>
                      </div>
                      
                      <div className="pt-4">
                        <Button variant="outline" className="w-full" size="sm">
                          <MapPin className="mr-2 h-4 w-4" />
                          Ver todas las ambitecas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Acciones Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>
                    Herramientas administrativas principales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => router.push('/admin/users')}
                    >
                      <Users className="h-6 w-6" />
                      <span>Gestionar Usuarios</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <MapPin className="h-6 w-6" />
                      <span>Ambitecas</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Wallet className="h-6 w-6" />
                      <span>Tokens PPV</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => router.push('/admin/webhooks')}
                    >
                      <BarChart3 className="h-6 w-6" />
                      <span>Webhooks</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Webhook Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Integración</CardTitle>
                  <CardDescription>
                    Configuración de webhooks y servicios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Privy Webhooks</span>
                      <Badge variant="secondary">Configurar</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Supabase</span>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Contratos PPV</span>
                      <Badge variant="outline">Pendiente</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>URL del Webhook:</strong>
                    </p>
                    <code className="text-xs bg-background p-2 rounded border">
                      {typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com'}/api/webhooks/privy
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Configura esta URL en tu panel de Privy para habilitar la sincronización automática.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
