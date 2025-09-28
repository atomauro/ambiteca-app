import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Webhook, 
  ArrowLeft,
  Activity,
  Users,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

interface WebhookMetrics {
  total_users: number;
  users_with_wallets: number;
  total_sessions: number;
  avg_sessions_per_user: number;
  last_webhook_activity: string;
}

interface RecentSession {
  privy_user_id: string;
  session_started_at: string;
  created_at: string;
}

export default function WebhooksPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const [metrics, setMetrics] = useState<WebhookMetrics | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      loadWebhookData();
      setWebhookUrl(`${window.location.origin}/api/webhooks/privy`);
    }
  }, [authenticated]);

  const loadWebhookData = async () => {
    try {
      setLoading(true);
      
      // Cargar métricas de webhooks
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_webhook_metrics');

      if (metricsError) {
        console.error('Error loading webhook metrics:', metricsError);
      } else if (metricsData && metricsData.length > 0) {
        setMetrics(metricsData[0]);
      }

      // Cargar sesiones recientes
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('privy_user_id, session_started_at, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) {
        console.error('Error loading recent sessions:', sessionsError);
      } else {
        setRecentSessions(sessionsData || []);
      }

    } catch (error) {
      console.error('Error loading webhook data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL copiada al portapapeles');
  };

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/webhooks/privy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'privy-signature': 'test-signature'
        },
        body: JSON.stringify({
          event: 'test',
          data: { test: true }
        })
      });

      if (response.ok) {
        toast.success('Webhook endpoint respondió correctamente');
      } else {
        toast.error('Error en el webhook endpoint');
      }
    } catch (error) {
      toast.error('Error conectando con el webhook');
    }
  };

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Webhooks - AMBITECA Admin</title>
      </Head>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Webhook className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Webhooks de Privy</h1>
                <p className="text-sm text-muted-foreground">
                  Configuración y métricas de sincronización
                </p>
              </div>
            </div>
            
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loadWebhookData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
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
              {/* Configuración del Webhook */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Webhook</CardTitle>
                  <CardDescription>
                    URL para configurar en el panel de Privy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm">
                        {webhookUrl}
                      </div>
                      <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Estado del Endpoint</p>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">Activo</span>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" onClick={testWebhook}>
                        Probar Endpoint
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Eventos Configurados</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                        <div>• user.created</div>
                        <div>• user.updated</div>
                        <div>• wallet.created</div>
                        <div>• session.created</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuarios Sincronizados</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.total_users || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Total de usuarios de Privy
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wallets Registradas</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.users_with_wallets || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Usuarios con wallets embebidas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sesiones Totales</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.total_sessions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Logins registrados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Última Actividad</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">
                      {metrics?.last_webhook_activity 
                        ? new Date(metrics.last_webhook_activity).toLocaleDateString('es-CO')
                        : 'N/A'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Último webhook recibido
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actividad Reciente */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente de Webhooks</CardTitle>
                  <CardDescription>
                    Últimas sesiones registradas via webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.length > 0 ? (
                      recentSessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                              <Activity className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Usuario: {session.privy_user_id.slice(-8)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Sesión iniciada
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {new Date(session.session_started_at).toLocaleString('es-CO')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Webhook: {new Date(session.created_at).toLocaleString('es-CO')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay actividad reciente</h3>
                        <p className="text-muted-foreground">
                          Los webhooks aparecerán aquí cuando los usuarios interactúen con la aplicación
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instrucciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración en Privy</CardTitle>
                  <CardDescription>
                    Pasos para configurar los webhooks en tu panel de Privy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-medium">1. Accede a Privy Dashboard</h4>
                        <p className="text-sm text-muted-foreground">
                          Ve a <code className="bg-muted px-1 rounded">dashboard.privy.io</code> y selecciona tu aplicación
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">2. Configura el Webhook</h4>
                        <p className="text-sm text-muted-foreground">
                          Ve a Settings → Webhooks y agrega la URL mostrada arriba
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">3. Selecciona Eventos</h4>
                        <p className="text-sm text-muted-foreground">
                          Habilita los eventos: user.created, user.updated, wallet.created, session.created
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">4. Guarda el Secret</h4>
                        <p className="text-sm text-muted-foreground">
                          Copia el webhook secret y agrégalo a tu archivo <code className="bg-muted px-1 rounded">.env.local</code>
                        </p>
                      </div>
                    </div>
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


