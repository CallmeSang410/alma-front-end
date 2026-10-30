# HorizonFlow Frontend

Frontend React/Vite de HorizonFlow, plataforma de gestión clínica para pacientes, citas, reportes y seguimiento.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Backend HorizonFlow disponible.

## Instalación local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Variables esperadas:

```env
VITE_GOOGLE_CLIENT_ID=tu-client-id-de-google
```

La URL del backend se selecciona en `src/api.js`: en producción usa `https://alma-backend-1.onrender.com` y en desarrollo `http://127.0.0.1:8000`.

## Comandos

```bash
npm run dev       # desarrollo
npm run lint      # validación ESLint
npm run build     # compilación de producción
npm run preview   # servir el build localmente
```

El pipeline debe detener el despliegue si `npm run lint` o `npm run build` fallan.

## Módulos principales

- Login, registro con Google y gestión de sesión.
- Directorio de pacientes y expedientes.
- Agenda y citas.
- Reportes clínicos y análisis asistido por IA.
- Dashboard, alertas y métricas.
- Encuestas públicas y experiencia.
- Ajustes de perfil.

## Producción

- Frontend: https://horizonflowai.vercel.app/
- Backend: https://alma-backend-1.onrender.com
- Health check: https://alma-backend-1.onrender.com/health
- OpenAPI: https://alma-backend-1.onrender.com/openapi.json

No se deben usar cuentas ni datos clínicos reales para pruebas. Solicita una cuenta de staging o una cuenta de prueba no productiva al equipo responsable.

## Smoke test

1. Abrir el frontend por HTTPS.
2. Confirmar que la interfaz inicial aparece en español.
3. Verificar validación de correo y contraseña.
4. Iniciar sesión con una cuenta de prueba.
5. Abrir pacientes, citas, reportes, dashboard y ajustes.
6. Confirmar que las rutas privadas no se muestran sin sesión.
7. Cerrar sesión y comprobar que el token se elimina del navegador.
8. Probar escritorio y móvil.
9. Revisar headers de seguridad:

```bash
curl -I https://horizonflowai.vercel.app/
```

## Despliegue en Vercel

El despliegue debe ejecutarse desde una rama revisada y con el build validado. Configura `VITE_GOOGLE_CLIENT_ID` como variable de entorno de Vercel. Nunca subas claves, tokens ni archivos `.env` al repositorio.

## Seguridad

La sesión se envía al backend con Bearer token. No se deben imprimir tokens en consola. La recuperación directa de contraseña permanece deshabilitada hasta disponer de un flujo seguro con token de un solo uso enviado por un canal verificado.

## Contribución

Antes de abrir un pull request:

```bash
npm ci
npm run lint
npm run build
```

Describe en el pull request los casos de prueba ejecutados, las rutas afectadas y cualquier cambio de configuración.
