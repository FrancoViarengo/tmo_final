# Guía de Configuración de Base de Datos (Supabase)

Para que la aplicación funcione correctamente, necesitas configurar la base de datos y los buckets de almacenamiento en Supabase.

## 1. Ejecutar el Script SQL
He preparado un archivo `database_setup.sql` en la raíz del proyecto que contiene toda la estructura necesaria.

1.  Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2.  Entra en la sección **SQL Editor**.
3.  Crea una **New Query**.
4.  Copia y pega el contenido del archivo `database_setup.sql`.
5.  Haz clic en **Run**.

Esto creará todas las tablas (`series`, `chapters`, `groups`, `lists`, etc.) y configurará las políticas de seguridad básicas.

## 2. Verificar Buckets de Almacenamiento
El script intenta crear los buckets automáticamente, pero a veces es necesario hacerlo manual o verificarlo.
Ve a la sección **Storage** y asegúrate de que existan los siguientes buckets públicos:

*   `pages`: Para las imágenes de los capítulos.
*   `covers`: Para las portadas de las series.
*   `avatars`: Para fotos de perfil.
*   `banners`: Para banners de series/perfiles.

Si no existen, créalos y asegúrate de marcar "Public bucket".

## 3. Roles de Usuario
Por defecto, los nuevos usuarios tienen el rol `user`. Para subir contenido o moderar, necesitas asignar roles especiales (`uploader`, `editor`, `admin`).

Puedes hacerlo manualmente en la tabla `profiles` desde el **Table Editor** de Supabase, cambiando la columna `role` de tu usuario a `admin` o `superadmin`.
