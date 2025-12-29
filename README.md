# 🏍️ Sistema de Mototaxis

Sistema completo de gestión de mototaxis con seguimiento GPS en tiempo real, desarrollado con Supabase (PostgreSQL) y JavaScript vanilla.

## ✨ Características

- 📍 **Seguimiento GPS en tiempo real** de conductores
- 🗺️ **Mapa interactivo** con Leaflet y OpenStreetMap
- 📱 **PWA** - Funciona como aplicación nativa
- 🚀 **Cálculo automático de rutas** con OSRM
- 💰 **Cálculo automático de precios**
- 📊 **Panel de control** con estadísticas
- 🔄 **Actualizaciones en tiempo real**
- 📴 **Funciona offline** (PWA)

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL + APIs REST automáticas)
- **Mapas**: Leaflet + OpenStreetMap
- **Rutas**: OSRM (Open Source Routing Machine)
- **PWA**: Service Workers + Manifest
- **Hosting**: Vercel / Netlify (Gratis)

## 📋 Requisitos Previos

- Navegador web moderno
- Cuenta gratuita en [Supabase](https://supabase.com)
- Cuenta gratuita en [Vercel](https://vercel.com) o [Netlify](https://netlify.com) (opcional)

## 🚀 Instalación Rápida (5 minutos)

### Paso 1: Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se inicialice (1-2 minutos)
4. Ve a **SQL Editor** en el menú lateral
5. Copia y pega todo el contenido del archivo `database/schema.sql`
6. Haz click en **RUN** para ejecutar el script
7. Ve a **Settings** → **API**
8. Copia estos dos valores:
   - **Project URL** (ejemplo: https://abcdefgh.supabase.co)
   - **anon public** key (es seguro exponerla)

### Paso 2: Configurar el Código

1. Descarga o clona este repositorio
2. Abre el archivo `frontend/config.js`
3. Reemplaza las credenciales:

```javascript
const SUPABASE_CONFIG = {
    url: 'TU_SUPABASE_URL',  // ← Pega aquí tu Project URL
    anonKey: 'TU_SUPABASE_ANON_KEY'  // ← Pega aquí tu anon key
};
```

### Paso 3: Ejecutar Localmente

**Opción A - Con Live Server (VS Code)**
1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `frontend/index.html`
3. Selecciona "Open with Live Server"

**Opción B - Con Python**
```bash
cd frontend
python -m http.server 8000
# Abre http://localhost:8000
```

**Opción C - Con Node.js**
```bash
cd frontend
npx serve
```

### Paso 4: Subir a Internet (Gratis)

**Opción A - Vercel (Recomendado)**
1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Click en "Add New" → "Project"
3. Conecta tu cuenta de GitHub
4. Selecciona este repositorio
5. En "Root Directory" pon: `frontend`
6. Click en "Deploy"
7. ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

**Opción B - Netlify**
1. Ve a [netlify.com](https://netlify.com) y crea una cuenta
2. Arrastra la carpeta `frontend` a Netlify Drop
3. ¡Listo!

## 📱 Instalar como App en el Móvil

### iOS (iPhone/iPad)
1. Abre la app en Safari
2. Toca el botón de "Compartir" 
3. Selecciona "Agregar a pantalla de inicio"
4. Dale un nombre y toca "Agregar"

### Android
1. Abre la app en Chrome
2. Toca el menú (tres puntos)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma la instalación

## 📊 Estructura del Proyecto

```
mototaxis-app/
├── frontend/
│   ├── index.html          # Página principal
│   ├── styles.css          # Estilos
│   ├── config.js           # Configuración de Supabase
│   ├── app.js              # Lógica principal
│   ├── mapa.js             # Gestión del mapa
│   ├── pedidos.js          # Gestión de pedidos
│   ├── conductores.js      # Gestión de conductores
│   ├── manifest.json       # Configuración PWA
│   └── service-worker.js   # Service worker para offline
├── database/
│   └── schema.sql          # Estructura de la base de datos
└── docs/
    └── README.md           # Esta documentación
```

## 🎮 Cómo Usar el Sistema

### Crear un Pedido

1. Click en la pestaña "➕ Nuevo Pedido"
2. Ingresa el nombre del cliente
3. Click en "📍 Seleccionar en Mapa" para origen
4. Click en el mapa donde está el cliente
5. Click en "📍 Seleccionar en Mapa" para destino
6. Click en el mapa donde va el cliente
7. El sistema calculará automáticamente:
   - Distancia
   - Tiempo estimado (con tráfico)
   - Precio
8. Click en "Crear Pedido"

### Ver Conductores en el Mapa

- **Verde** 🟢 = Disponible
- **Amarillo** 🟡 = Ocupado
- **Gris** ⚪ = Inactivo

### Gestionar Pedidos

1. Ve a la pestaña "📋 Pedidos"
2. Click en cualquier pedido para ver detalles
3. Puedes:
   - Ver en el mapa
   - Asignar conductor
   - Cancelar pedido

## 🔧 Configuración Avanzada

### Cambiar Precios

En Supabase, ve a la tabla `configuracion`:

```sql
UPDATE configuracion SET valor = '20' WHERE clave = 'precio_base_km';
UPDATE configuracion SET valor = '50' WHERE clave = 'precio_minimo';
```

### Agregar Más Ciudades

```sql
INSERT INTO ciudades (nombre, latitud, longitud, radio_km) 
VALUES ('La Ceiba', 15.7833, -86.8000, 10);
```

### Agregar Conductores Manualmente

```sql
INSERT INTO conductores (nombre, telefono, placa, estado)
VALUES ('Juan Pérez', '9999-9999', 'ABC-123', 'disponible');
```

## 🐛 Solución de Problemas

### Error: "No se puede conectar a Supabase"
- Verifica que hayas pegado correctamente el URL y la Key en `config.js`
- Asegúrate de que el proyecto de Supabase esté activo
- Revisa la consola del navegador (F12) para ver el error exacto

### El mapa no carga
- Verifica tu conexión a internet
- Limpia el caché del navegador
- Asegúrate de que Leaflet se haya cargado correctamente

### Los pedidos no se guardan
- Verifica que ejecutaste el script SQL completo
- Revisa en Supabase → Table Editor que las tablas existan
- Verifica que las políticas RLS estén habilitadas

## 📈 Próximas Funcionalidades

- [ ] Asignación automática de conductores
- [ ] Notificaciones push en tiempo real
- [ ] Chat entre conductor y cliente
- [ ] Historial de ganancias
- [ ] Reportes y estadísticas avanzadas
- [ ] Integración con WhatsApp
- [ ] Sistema de calificaciones

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Eres libre de usarlo, modificarlo y distribuirlo.

## 💡 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de "Solución de Problemas"
2. Abre un Issue en GitHub
3. Consulta la documentación de [Supabase](https://supabase.com/docs)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend as a Service
- [Leaflet](https://leafletjs.com) - Librería de mapas
- [OpenStreetMap](https://www.openstreetmap.org) - Datos de mapas
- [OSRM](http://project-osrm.org) - Cálculo de rutas

---

Hecho con ❤️ para la comunidad de mototaxistas
