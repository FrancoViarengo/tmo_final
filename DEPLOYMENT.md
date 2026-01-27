# Guía de Despliegue (Deployment) - Netlify

Esta guía explica cómo llevar tu proyecto **NeoManga** desde tu computadora local ("localhost") a Internet usando **Netlify**.

## Resumen del Flujo de Trabajo

Sí, **puedes trabajar todo en local** y luego subirlo.

1.  **Código (Frontend/Next.js)**: Trabajas en tu PC. Cuando terminas, "empujas" (push) el código a un repositorio (GitHub) y Netlify lo publica automáticamente.
2.  **Base de Datos (Supabase)**: Generalmente, ya estás usando la base de datos "en la nube" de Supabase, incluso mientras desarrollas en local.

---

## Pasos para Publicar en Netlify

### 1. Preparar el Código
Asegúrate de que todo funciona bien en local:
```bash
npm run build
# Si no hay errores, estás listo.
```

### 2. Subir a GitHub
Sube tu código a un repositorio de GitHub (si aún no lo has hecho).

### 3. Conectar con Netlify
1.  Ve a [Netlify.com](https://www.netlify.com/) y crea una cuenta.
2.  Haz clic en **"Add new site"** -> **"Import an existing project"**.
3.  Selecciona **GitHub**.
4.  Busca y selecciona tu repositorio de **NeoManga**.

### 4. Configurar el Build
Netlify suele detectar Next.js automáticamente, pero verifica esto:
*   **Build command**: `npm run build`
*   **Publish directory**: `.next` (Netlify usa un plugin de Next.js que maneja esto automáticamente, a veces verás `.next` o `out` si es estático, pero para SSR Next.js lo maneja solo).
    *   *Nota*: Netlify instalará automáticamente el plugin `@netlify/plugin-nextjs`.

### 5. Variables de Entorno (¡CRUCIAL!)
Antes de darle a "Deploy", busca el botón o sección **"Environment variables"**.
Tienes que añadir **todas** las variables que tienes en tu `.env.local`:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `tu-clave-anon-larga` |

*(Si tienes otras variables en .env, añádelas también)*.

Haz clic en **"Deploy site"**.

### 6. Configurar OAuth (Google/Discord)
Cuando tu sitio sea público (ej. `https://neomanga-cool.netlify.app`), avisa a los proveedores de login.

1.  **Supabase Auth**:
    *   Panel Supabase -> Authentication -> URL Configuration.
    *   Añade tu URL de Netlify en "Site URL" y "Redirect URLs".
    *   Ejemplo: `https://neomanga-cool.netlify.app/auth/callback`

2.  **Google Cloud / Discord Portal**:
    *   Actualiza los "Orígenes autorizados" y "URLs de redirección" con tu nuevo dominio de Netlify.

---

## Preguntas Frecuentes

**P: ¿Tengo que pagar?**
R: No. Netlify tiene un plan "Starter" gratuito muy bueno.

**P: ¿Tengo que cambiar algo en el código para Netlify?**
R: Generalmente no. El "Runtime de Next.js" en Netlify se encarga de adaptar tu código para que funcione en sus servidores (Edge Functions / Serverless Functions).

**P: ¿Cómo actualizo la página?**
R: Simplemente haz cambios en tu PC, haz `git push` a GitHub, y Netlify detectará el cambio y volverá a construir y publicar tu sitio automáticamente.
