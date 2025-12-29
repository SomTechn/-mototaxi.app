# 📘 Guía Completa de Configuración de Supabase

Esta guía te llevará paso a paso para configurar tu base de datos en Supabase.

## 📋 Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Inicia sesión con GitHub (recomendado) o email
4. Acepta los términos de servicio

## 🏗️ Paso 2: Crear un Nuevo Proyecto

1. Click en "New Project"
2. Selecciona tu organización (si es tu primera vez, se creará automáticamente)
3. Llena el formulario:
   - **Name**: `mototaxis-app` (o el nombre que prefieras)
   - **Database Password**: Elige una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana a Honduras:
     - `South America (São Paulo)` - Recomendado
     - `US East (N. Virginia)` - Alternativa
   - **Pricing Plan**: Free (Gratis)

4. Click en "Create new project"
5. **Espera 1-2 minutos** mientras se crea tu base de datos

## 💾 Paso 3: Ejecutar el Script SQL

1. En el menú lateral izquierdo, click en **SQL Editor**
2. Click en el botón "New query" (o presiona `Ctrl+Enter`)
3. Abre el archivo `database/schema.sql` de este proyecto
4. **Copia TODO el contenido** del archivo
5. **Pega** en el editor SQL de Supabase
6. Click en el botón **RUN** (o presiona `Ctrl+Enter`)
7. Deberías ver el mensaje: "Success. No rows returned"

### ✅ Verificar que se creó correctamente

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver estas tablas:
   - ✅ ciudades
   - ✅ clientes
   - ✅ conductores
   - ✅ configuracion
   - ✅ pedidos
   - ✅ ubicaciones_tiempo_real

3. Click en la tabla `ciudades`
4. Deberías ver 3 ciudades pre-cargadas:
   - Tegucigalpa
   - San Pedro Sula
   - Choloma

Si ves todo esto, ¡perfecto! La base de datos está lista.

## 🔑 Paso 4: Obtener las Credenciales

1. Ve a **Settings** → **API** en el menú lateral
2. Copia estos dos valores:

### URL del Proyecto
```
https://xxxxxxxxxxxxxx.supabase.co
```

### Clave Pública (anon key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

**IMPORTANTE**: 
- ⚠️ La clave `anon public` es segura para usar en el frontend
- ⚠️ NUNCA expongas la clave `service_role` - es solo para backend
- ✅ Puedes compartir la clave `anon public` sin problemas

## 📝 Paso 5: Configurar el Frontend

1. Abre el archivo `frontend/config.js`
2. Busca estas líneas:

```javascript
const SUPABASE_CONFIG = {
    url: 'TU_SUPABASE_URL',
    anonKey: 'TU_SUPABASE_ANON_KEY'
};
```

3. Reemplaza con tus valores:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxxxxxxxxxxx.supabase.co',  // ← Pega tu URL aquí
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← Pega tu anon key aquí
};
```

4. **Guarda el archivo**

## 🧪 Paso 6: Probar la Conexión

1. Abre `frontend/index.html` en tu navegador
2. Abre la Consola de Desarrollo (F12)
3. Deberías ver estos mensajes:
   ```
   🚀 Iniciando aplicación de Mototaxis...
   🗺️ Inicializando mapa...
   📋 Inicializando gestor de pedidos...
   👤 Inicializando gestor de conductores...
   ✅ Aplicación iniciada correctamente
   ```

4. **Si ves errores**, revisa:
   - ¿Pegaste correctamente el URL y la key?
   - ¿El URL tiene `https://` al inicio?
   - ¿La key está completa (es muy larga)?

## 📊 Paso 7: Insertar Datos de Prueba (Opcional)

Para probar el sistema, puedes agregar conductores de prueba:

1. Ve a **SQL Editor** en Supabase
2. Ejecuta este script:

```sql
-- Insertar conductores de prueba
INSERT INTO conductores (nombre, telefono, placa, estado, latitud, longitud) VALUES
('Carlos Martínez', '9999-1111', 'ABC-001', 'disponible', 14.0850, -87.2063),
('Luis Hernández', '9999-2222', 'DEF-002', 'disponible', 14.0680, -87.1900),
('José García', '9999-3333', 'GHI-003', 'ocupado', 14.0920, -87.2100),
('Miguel Flores', '9999-4444', 'JKL-004', 'disponible', 15.5100, -88.0300),
('Pedro López', '9999-5555', 'MNO-005', 'inactivo', 15.6050, -87.9450);

-- Insertar clientes de prueba
INSERT INTO clientes (nombre, telefono) VALUES
('Ana Rodríguez', '8888-1111'),
('María González', '8888-2222'),
('Carmen Díaz', '8888-3333');

-- Insertar un pedido de prueba
INSERT INTO pedidos (
    cliente_id,
    origen_direccion,
    origen_lat,
    origen_lng,
    destino_direccion,
    destino_lat,
    destino_lng,
    distancia_km,
    tiempo_estimado_min,
    precio,
    estado
) VALUES (
    (SELECT id FROM clientes LIMIT 1),
    'Centro de Tegucigalpa',
    14.0723,
    -87.1921,
    'Aeropuerto Toncontín',
    14.0608,
    -87.2172,
    5.2,
    20,
    78.00,
    'pendiente'
);
```

3. Recarga tu aplicación
4. Deberías ver:
   - 5 conductores en el mapa
   - 1 pedido en la lista
   - Estadísticas actualizadas

## 🔒 Paso 8: Seguridad (Row Level Security)

Las políticas RLS están configuradas para permitir acceso público en el plan gratuito.

**Para agregar autenticación más adelante:**

1. Habilita Autenticación en Supabase:
   - Settings → Authentication → Email/Password

2. Modifica las políticas RLS:
```sql
-- Ejemplo: Solo usuarios autenticados pueden crear pedidos
DROP POLICY "Permitir todo en pedidos" ON pedidos;

CREATE POLICY "Usuarios autenticados pueden crear pedidos"
ON pedidos FOR INSERT
TO authenticated
WITH CHECK (true);
```

## 📈 Paso 9: Monitoreo

Puedes ver el uso de tu base de datos en:

1. **Database** → **Database** → Uso de espacio
2. **Settings** → **Billing** → Uso del plan gratuito

**Límites del Plan Gratuito:**
- ✅ 500 MB de almacenamiento
- ✅ 2 GB de transferencia mensual
- ✅ 50,000 usuarios activos mensuales
- ✅ Actualizaciones en tiempo real ilimitadas

## 🎯 Próximos Pasos

1. ✅ Base de datos configurada
2. ✅ Frontend conectado
3. ⬜ Desplegar a internet (Vercel/Netlify)
4. ⬜ Personalizar precios y configuración
5. ⬜ Agregar más ciudades
6. ⬜ Invitar a tus conductores

## 🆘 Problemas Comunes

### Error: "Failed to fetch"
- ✅ Verifica tu conexión a internet
- ✅ Asegúrate de que el proyecto de Supabase esté activo
- ✅ Revisa que copiaste el URL correctamente (con `https://`)

### Error: "Invalid API key"
- ✅ Verifica que copiaste la clave `anon public` (NO la `service_role`)
- ✅ Asegúrate de que la clave esté completa (es muy larga)
- ✅ Verifica que no haya espacios al inicio o final

### Las tablas no aparecen
- ✅ Ejecuta nuevamente el script SQL completo
- ✅ Verifica que no haya errores en el SQL Editor
- ✅ Refresca la página del Table Editor

### No puedo insertar datos
- ✅ Verifica que las políticas RLS estén habilitadas
- ✅ Revisa la consola del navegador para ver el error exacto
- ✅ Asegúrate de que los campos requeridos estén llenos

## 📞 Soporte

- 📚 [Documentación de Supabase](https://supabase.com/docs)
- 💬 [Discord de Supabase](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)

---

¡Ya tienes tu base de datos lista! 🎉
