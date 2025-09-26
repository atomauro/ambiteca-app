# 🔗 Configuración de Webhooks Privy + Supabase

Esta guía explica cómo configurar los webhooks de Privy para mantener sincronizada la información entre Privy y Supabase.

## 🎯 ¿Por qué usar Webhooks?

Los webhooks nos permiten:
- ✅ **Sincronización automática** de usuarios entre Privy y Supabase
- ✅ **Registro automático** de wallets embebidas
- ✅ **Tracking de sesiones** para analytics
- ✅ **Consistencia de datos** sin polling manual
- ✅ **Creación automática** de PLV wallets

## 📋 Configuración Paso a Paso

### 1. Configurar Webhook en Privy Dashboard

1. Ve a [Privy Dashboard](https://dashboard.privy.io)
2. Selecciona tu aplicación
3. Ve a **Settings** → **Webhooks**
4. Crea un nuevo webhook:
   - **URL**: `https://tu-dominio.com/api/webhooks/privy`
   - **Events**: Selecciona los siguientes eventos:
     - `user.created`
     - `user.updated` 
     - `user.deleted`
     - `wallet.created`
     - `session.created`

### 2. Obtener Webhook Secret

1. En la configuración del webhook, copia el **Webhook Secret**
2. Agrégalo a tu `.env.local`:
   ```bash
   PRIVY_WEBHOOK_SECRET=whsec_tu_secret_aqui
   ```

### 3. Configurar Supabase Service Role

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** → **API**
3. Copia la **service_role key** (¡mantén secreta!)
4. Agrégala a tu `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   ```

### 4. Ejecutar Migraciones de Base de Datos

Ejecuta la migración para crear las tablas necesarias:

```sql
-- En Supabase SQL Editor, ejecuta:
-- supabase/migrations/20250926_privy_integration.sql
```

O usando CLI de Supabase:
```bash
supabase db push
```

### 5. Probar la Integración

1. **Deploy tu aplicación** con las nuevas variables de entorno
2. **Registra un usuario nuevo** en tu app
3. **Verifica en Supabase** que se creó:
   - Registro en `profiles`
   - Registro en `user_wallets`
   - Registro en `plv_wallets`

## 🔍 Eventos Soportados

### `user.created`
```json
{
  "event": "user.created",
  "data": {
    "id": "did:privy:...",
    "email": { "address": "user@example.com" },
    "phone": { "number": "+1234567890" },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```
**Acción**: Crea perfil en Supabase + PLV wallet

### `user.updated`
```json
{
  "event": "user.updated", 
  "data": {
    "id": "did:privy:...",
    "email": { "address": "newemail@example.com" }
  }
}
```
**Acción**: Actualiza perfil en Supabase

### `wallet.created`
```json
{
  "event": "wallet.created",
  "data": {
    "userId": "did:privy:...",
    "address": "0x...",
    "chainType": "ethereum",
    "walletClientType": "privy"
  }
}
```
**Acción**: Registra wallet en `user_wallets`

## 🛠️ Debugging

### Verificar Webhooks
```bash
# Ver logs de webhooks en tu aplicación
tail -f /var/log/your-app.log | grep "Privy webhook"
```

### Verificar Sincronización
```sql
-- En Supabase SQL Editor
SELECT 
  p.privy_user_id,
  p.email,
  p.created_at,
  uw.address,
  uw.is_embedded,
  plv.id as plv_wallet_id
FROM profiles p
LEFT JOIN user_wallets uw ON uw.user_id = p.user_id
LEFT JOIN plv_wallets plv ON plv.owner_id = p.user_id
WHERE p.created_at > now() - interval '1 hour'
ORDER BY p.created_at DESC;
```

### Logs Comunes

✅ **Éxito**:
```
Received Privy webhook: user.created
Profile created: { user_id: "...", email: "..." }
PLV wallet created for user: ...
```

❌ **Error de Firma**:
```
Invalid webhook signature
```
→ Verifica `PRIVY_WEBHOOK_SECRET`

❌ **Error de Base de Datos**:
```
Error creating profile: duplicate key value
```
→ Usuario ya existe, es normal

## 🔐 Seguridad

### Verificación de Firma
El webhook verifica automáticamente la firma usando `PRIVY_WEBHOOK_SECRET`:

```typescript
function verifyWebhookSignature(payload: string, signature: string, secret: string) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### Service Role Key
- ✅ Solo usar para webhooks server-side
- ✅ Nunca exponer en frontend
- ✅ Rotar periódicamente
- ✅ Usar RLS policies apropiadas

## 📊 Monitoreo

### Métricas Importantes
- **Tasa de éxito** de webhooks
- **Tiempo de respuesta** del endpoint
- **Usuarios sincronizados** vs total
- **Wallets registradas** por usuario

### Dashboard de Supabase
Crea queries para monitorear:

```sql
-- Usuarios registrados hoy
SELECT COUNT(*) FROM profiles 
WHERE created_at::date = CURRENT_DATE;

-- Wallets embebidas activas
SELECT COUNT(*) FROM user_wallets 
WHERE is_embedded = true AND is_active = true;

-- Últimas sesiones
SELECT privy_user_id, session_started_at 
FROM user_sessions 
ORDER BY session_started_at DESC 
LIMIT 10;
```

## 🚀 Próximos Pasos

Una vez configurados los webhooks:

1. **Implementar eventos blockchain** → Supabase
2. **Agregar notificaciones push** para nuevos tokens
3. **Crear dashboard de analytics** con datos de sesiones
4. **Implementar rate limiting** en webhooks
5. **Agregar retry logic** para fallos temporales

## 🆘 Troubleshooting

### Webhook no se ejecuta
1. Verifica la URL del webhook en Privy Dashboard
2. Asegúrate que tu app esté desplegada y accesible
3. Revisa los logs de tu aplicación

### Datos no se sincronizan
1. Verifica `SUPABASE_SERVICE_ROLE_KEY`
2. Revisa las RLS policies en Supabase
3. Verifica que las migraciones se ejecutaron correctamente

### Errores de permisos
1. Asegúrate que el service role tenga permisos de escritura
2. Verifica que las políticas RLS permitan inserción via service role
3. Revisa los logs de Supabase en el dashboard

¡Con esta configuración tendrás una sincronización perfecta entre Privy y Supabase! 🎉
