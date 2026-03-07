# 🚴 XERPA AI — Plataforma de Inteligencia Deportiva

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 📖 Acerca del Proyecto

**XERPA AI** es una plataforma móvil de inteligencia deportiva diseñada para maximizar el rendimiento de atletas de alto rendimiento, con especial enfoque en disciplinas como el **MTB XCO (Cross Country Olímpico)**.

La plataforma conecta a **Atletas**, **Entrenadores** y **Tutores** en un ecosistema inteligente que va más allá del simple seguimiento de entrenamientos. Su núcleo es **XERPA COACH**, un agente de Inteligencia Artificial que guía a los usuarios desde el primer momento, actuando como entrenador virtual personalizado para quienes no tienen uno humano asignado.

> _"Tu guía invisible hacia el rendimiento máximo."_

---

## ✨ Características Principales

- 🤖 **XERPA COACH (IA)** — Agente conversacional con IA (Gemini) que realiza el onboarding del usuario mediante chat natural y actúa como entrenador virtual.
- 🔐 **Autenticación segura** — Registro e inicio de sesión con Supabase Auth (email/contraseña).
- 👥 **Sistema de roles** — Gestión de perfiles diferenciados: `Atleta`, `Entrenador` y `Tutor`.
- 🔗 **Códigos de vinculación** — Sistema de códigos para que Entrenadores y Tutores se vinculen a sus atletas.
- 📊 **Dashboard de rendimiento** — Vista personalizada según el rol del usuario.
- 📝 **Gestión de perfil** — Edición de nombre, rol y configuración personal.
- 📱 **Experiencia móvil nativa** — UI optimizada para iOS y Android con React Native + Expo.

---

## 🏗️ Arquitectura y Tecnologías

| Capa | Tecnología | Uso |
|---|---|---|
| 📱 **Mobile / Frontend** | React Native + Expo | Interfaz de usuario multiplataforma (iOS & Android) |
| 🗄️ **Base de Datos** | Supabase (PostgreSQL) | Almacenamiento de usuarios, perfiles y datos deportivos |
| 🔑 **Autenticación** | Supabase Auth | Registro, login y gestión de sesiones |
| 🛡️ **Seguridad** | Supabase RLS | Row Level Security — cada usuario solo accede a sus datos |
| 🧠 **Orquestación IA** | n8n + Gemini AI | Flujos de automatización, lógica del agente XERPA COACH |
| 🌐 **Webhooks** | n8n (ngrok en dev) | Comunicación entre la app móvil y el agente de IA |

### Flujo de Arquitectura

```
App Móvil (React Native)
        │
        ▼
Supabase Auth & DB ◄──── Row Level Security (RLS)
        │
        ▼
n8n Webhook Endpoint
        │
        ▼
AI Agent (n8n) ──► Google Gemini ──► Respuesta al usuario
```

---

## ✅ Requisitos Previos

Asegúrate de tener instalado lo siguiente antes de comenzar:

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Expo Go](https://expo.dev/go) en tu dispositivo móvil (o un emulador iOS/Android)
- Cuenta en [Supabase](https://supabase.com/) (plan gratuito suficiente)
- Instancia de [n8n](https://n8n.io/) (self-hosted con Docker o n8n Cloud)
- [ngrok](https://ngrok.com/) (para exponer n8n en desarrollo local)

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/edwinfernando/xerpa-app.git
cd xerpa-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_supabase_anon_key

# URL del webhook de n8n (ngrok en desarrollo, dominio real en producción)
N8N_CHAT_ENDPOINT=https://tu-subdominio.ngrok-free.app/webhook/chat
```

> ⚠️ **Importante:** Nunca subas el archivo `.env` a GitHub. Asegúrate de que está en tu `.gitignore`.

### 4. Configurar Supabase

En tu proyecto de Supabase, ejecuta el siguiente SQL para crear la estructura base:

```sql
-- Tabla de usuarios (sin entrenador_id; relaciones en tabla separada)
CREATE TABLE usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre TEXT,
  email TEXT,
  rol TEXT CHECK (rol IN ('Atleta', 'Entrenador', 'Tutor')) DEFAULT 'Atleta',
  codigo_vinculacion TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla relacional atleta-entrenador/tutor
CREATE TABLE relaciones_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  vinculado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_vinculo TEXT NOT NULL CHECK (tipo_vinculo IN ('Entrenador', 'Tutor')),
  parentesco TEXT,
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Activo', 'Inactivo', 'Pendiente')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(atleta_id, vinculado_id)
);

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE relaciones_usuarios ENABLE ROW LEVEL SECURITY;

-- Política: cada usuario solo puede leer y editar su propio perfil
CREATE POLICY "Acceso propio" ON usuarios
  FOR ALL USING (auth.uid() = id);

-- Ver supabase/migrations/ para políticas de relaciones_usuarios.
```

### 5. Levantar n8n (Docker)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Luego importa el flujo de XERPA COACH desde la carpeta `/n8n-flows` (si está disponible en el repo).

### 6. Exponer n8n con ngrok (desarrollo local)

```bash
ngrok http 5678
```

Copia la URL HTTPS generada y úsala como valor de `N8N_CHAT_ENDPOINT` en tu `.env`.

### 7. Iniciar la aplicación

```bash
npx expo start
```

Escanea el QR con **Expo Go** en tu dispositivo o presiona `i` (iOS) / `a` (Android) para abrir en emulador.

---

## 🗃️ Estructura de la Base de Datos

La base de datos principal reside en **Supabase (PostgreSQL)** y está protegida con **Row Level Security (RLS)**.

### Tabla `usuarios`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `UUID` | Clave primaria, vinculada a `auth.users` |
| `nombre` | `TEXT` | Nombre del usuario |
| `email` | `TEXT` | Correo electrónico |
| `rol` | `TEXT` | `Atleta`, `Entrenador` o `Tutor` |
| `codigo_vinculacion` | `TEXT` | Código único para vincular atletas con su entrenador/tutor |
| `created_at` | `TIMESTAMPTZ` | Fecha de registro |

### Tabla `relaciones_usuarios`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `UUID` | Clave primaria |
| `atleta_id` | `UUID` | FK a `usuarios` (el atleta) |
| `vinculado_id` | `UUID` | FK a `usuarios` (entrenador o tutor) |
| `tipo_vinculo` | `TEXT` | `Entrenador` o `Tutor` |
| `parentesco` | `TEXT` | Opcional (ej. Padre, Madre) |
| `estado` | `TEXT` | `Activo`, `Inactivo` o `Pendiente` |
| `created_at` | `TIMESTAMPTZ` | Fecha de creación |

> El sistema de **códigos de vinculación** permite que un Entrenador o Tutor comparta su código único con sus atletas. Al ingresar el código, se crea un registro en `relaciones_usuarios` con estado `Pendiente`.

---

## 📁 Estructura del Proyecto

```
xerpa-app/
├── src/
│   ├── navigation/
│   │   ├── AuthStack.js          # Navegación para usuarios no autenticados
│   │   └── MainTabNavigator.js   # Navegación principal con tabs
│   └── screens/
│       ├── Login/                # Pantalla de autenticación
│       ├── Dashboard/            # Dashboard de rendimiento
│       ├── XerpaAI/              # Chat con XERPA COACH (IA)
│       ├── Plan/                 # Plan de entrenamiento
│       └── Perfil/               # Perfil del usuario
├── supabase.js                   # Configuración del cliente Supabase
├── App.js                        # Punto de entrada, gestión de sesión
└── .env                          # Variables de entorno (no incluido en el repo)
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si quieres proponer mejoras:

1. Haz un fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a tu rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.

---

<p align="center">
  Hecho con 💪 y mucho café por <strong>edwinfernando</strong>
</p>
