# AMBITECA APP

Aplicación web en Next.js para gestionar reciclaje en puntos físicos (ambitecas). Permite que dos tipos de usuario interactúen:

- **Administrador**: sesión con Privy (para demo). Accede al panel y navegación general.
- **Asistente**: flujo operativo para registrar personas, materiales y pesos. Todo el flujo está maquetado y funciona en modo demo (sin backend real), con navegación entre pantallas y datos simulados.

## Rutas principales (demo)

- `/` Landing con accesos a los dos roles
- `/assistant` Inicio del flujo de Asistente (selección de ambiteca y hora)
  - `/assistant/home` ¿Qué quieres hacer hoy?
  - `/assistant/login` Identificar persona
  - `/assistant/register` Registrar persona nueva
  - `/assistant/materials` Selección de material
  - `/assistant/scale` Indicación de llevar a báscula
  - `/assistant/weight` Ingreso de peso
  - `/assistant/summary` Resumen del registro
  - `/assistant/more` ¿Pesar más materiales?
  - `/assistant/receipt` Recibo/agradecimiento
  - `/assistant/history` Entrada a históricos (por material / por persona)
  - `/assistant/rewards` Gestión de puntos (mock)
- `/dashboard` Panel para Administrador (con enlace al flujo de Asistente)
- `/onboarding` Pantalla de onboarding (demo)

## Instalación rápida

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

### Variables de entorno (opcional para login admin)

Si quieres probar el login del Administrador con Privy, crea un archivo `.env.local` con:

```
NEXT_PUBLIC_PRIVY_APP_ID=tu_app_id
PRIVY_APP_SECRET=tu_app_secret
```

El flujo de Asistente funciona sin estas variables (datos y acciones simuladas para demo).

## Estructura relevante

- `pages/assistant/*` Todas las pantallas del flujo del Asistente
- `pages/dashboard.tsx` Panel del Administrador con enlace a Asistente
- `pages/index.tsx` Landing y navegación a roles
- `pages/onboarding.tsx` Pantalla de onboarding

## Notas

- Este repositorio es un demo inicial para presentación. No hay integraciones reales a balanzas ni almacenamiento persistente.
- Los textos y estilos están en español y orientados a mostrar el flujo completo.

## Licencia

Ver archivo `LICENSE`.
