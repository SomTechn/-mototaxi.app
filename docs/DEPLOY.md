# 🚀 Guía de Despliegue en Vercel

Esta guía te mostrará cómo subir tu sistema de mototaxis a internet **completamente gratis** usando Vercel.

## ¿Por qué Vercel?

- ✅ **100% Gratis** para proyectos personales
- ✅ SSL automático (HTTPS)
- ✅ CDN global (carga rápida desde cualquier parte)
- ✅ Despliegue automático desde GitHub
- ✅ Dominio gratis (.vercel.app)
- ✅ Soporte para PWA

## 📋 Requisitos

- [ ] Cuenta de GitHub (gratuita)
- [ ] Cuenta de Vercel (gratuita)
- [ ] Proyecto configurado con Supabase

## 🎯 Opción 1: Despliegue Directo (Más Rápido)

### Paso 1: Preparar el Proyecto

1. Asegúrate de que `frontend/config.js` tenga tus credenciales de Supabase
2. Verifica que todos los archivos estén en la carpeta `frontend/`

### Paso 2: Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza a Vercel

### Paso 3: Desplegar

1. En Vercel, click en "Add New..." → "Project"
2. Click en "Continue with GitHub"
3. Busca tu repositorio o importa desde GitHub
4. Si no has subido a GitHub aún:
   - Click en "Import Git Repository"
   - Sube tu proyecto a GitHub primero (ver Opción 2)

5. Configura el proyecto:
   - **Project Name**: `mototaxis-app` (o el que prefieras)
   - **Framework Preset**: `Other`
   - **Root Directory**: `frontend` ← **IMPORTANTE**
   - **Build Command**: Dejar vacío
   - **Output Directory**: Dejar vacío

6. Click en "Deploy"

7. **Espera 1-2 minutos** mientras se despliega

8. ¡Listo! Tu app estará en:
   ```
   https://mototaxis-app.vercel.app
   ```
   (O el nombre que elegiste)

## 🔄 Opción 2: Despliegue con GitHub (Recomendado)

Esta opción permite actualizar automáticamente cada vez que hagas cambios.

### Paso 1: Subir a GitHub

1. Ve a [github.com](https://github.com) y crea una cuenta si no tienes
2. Click en el botón "+" arriba a la derecha
3. Selecciona "New repository"
4. Configura:
   - **Repository name**: `mototaxis-app`
   - **Visibility**: Public o Private (tu elección)
   - **NO marques** "Add a README"
5. Click en "Create repository"

### Paso 2: Subir tu Código

**Si usas VS Code:**

1. Abre tu proyecto en VS Code
2. Click en el ícono de Git (lado izquierdo)
3. Click en "Initialize Repository"
4. Escribe un mensaje: "Primer commit"
5. Click en el botón "Commit"
6. Click en "Publish Branch"
7. Selecciona tu repositorio en GitHub

**Si usas la Terminal:**

```bash
# Navega a tu carpeta del proyecto
cd mototaxis-app

# Inicializa Git
git init

# Agrega todos los archivos
git add .

# Haz commit
git commit -m "Primer commit"

# Conecta con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/mototaxis-app.git

# Sube los archivos
git branch -M main
git push -u origin main
```

### Paso 3: Conectar con Vercel

1. En [vercel.com](https://vercel.com), click en "Add New..." → "Project"
2. Selecciona tu repositorio `mototaxis-app`
3. Configura:
   - **Root Directory**: Click en "Edit" → Selecciona `frontend`
   - Deja todo lo demás como está
4. Click en "Deploy"
5. **Espera 1-2 minutos**
6. ¡Listo!

### Paso 4: Actualizaciones Automáticas

Ahora, cada vez que hagas cambios:

```bash
# Hacer cambios en tu código
# Guardar archivos

# Agregar cambios
git add .

# Commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push
```

**Vercel detectará automáticamente** los cambios y desplegará la nueva versión en 1-2 minutos.

## 🌐 Paso 4: Dominio Personalizado (Opcional)

### Usar Dominio de Vercel

Tu app ya tiene un dominio gratis:
```
https://tu-proyecto.vercel.app
```

### Usar tu Propio Dominio

Si tienes un dominio (ej: mototaxis.com):

1. En Vercel, ve a tu proyecto
2. Settings → Domains
3. Add Domain
4. Sigue las instrucciones para configurar DNS

## 📱 Verificar PWA

1. Abre tu app desplegada en Chrome (móvil o escritorio)
2. En el navegador debería aparecer un ícono de "Instalar app"
3. Click en instalar
4. ¡Tu app ahora funciona como aplicación nativa!

## 🔒 Variables de Entorno (Opcional)

Para mayor seguridad, puedes mover las credenciales de Supabase a variables de entorno:

1. En Vercel, ve a Settings → Environment Variables
2. Agrega:
   - `SUPABASE_URL` = tu URL de Supabase
   - `SUPABASE_ANON_KEY` = tu clave pública

3. Modifica `config.js`:

```javascript
const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || 'TU_URL_DE_RESPALDO',
    anonKey: process.env.SUPABASE_ANON_KEY || 'TU_KEY_DE_RESPALDO'
};
```

4. Re-despliega

## 📊 Monitorear tu App

### Analytics

1. En Vercel → tu proyecto → Analytics
2. Verás:
   - Visitas
   - Países de origen
   - Dispositivos
   - Performance

### Logs

1. Vercel → tu proyecto → Deployments
2. Click en cualquier despliegue
3. Click en "Functions" → Ver logs

## 🐛 Solución de Problemas

### Error 404

- ✅ Verifica que el Root Directory sea `frontend`
- ✅ Asegúrate de que `index.html` esté en `frontend/`

### La app no carga

- ✅ Abre la consola del navegador (F12)
- ✅ Verifica errores de CORS
- ✅ Revisa que las URLs de Supabase sean correctas

### Los cambios no se reflejan

- ✅ Espera 1-2 minutos después del deploy
- ✅ Limpia el caché del navegador (Ctrl+Shift+R)
- ✅ Verifica que los cambios estén en GitHub

### Error de Build

- ✅ Asegúrate de no tener archivos innecesarios
- ✅ Verifica que no haya errores de JavaScript
- ✅ Revisa los logs de Vercel

## 🎯 Checklist Final

Antes de compartir tu app, verifica:

- [ ] La app carga sin errores
- [ ] Los mapas se muestran correctamente
- [ ] Puedes crear pedidos
- [ ] Los conductores aparecen en el mapa
- [ ] La PWA se puede instalar
- [ ] El SSL está activo (candado verde en navegador)

## 🚀 Próximos Pasos

1. **Comparte tu app**: Envía el link a tus conductores
2. **Instala en móviles**: Guíalos para instalar como PWA
3. **Capacita**: Muéstrales cómo usar el sistema
4. **Monitorea**: Revisa el analytics de Vercel

## 📞 Recursos

- 📚 [Documentación de Vercel](https://vercel.com/docs)
- 💬 [Soporte de Vercel](https://vercel.com/support)
- 🎥 [Tutoriales en YouTube](https://www.youtube.com/results?search_query=vercel+deployment)

---

¡Tu app ya está en línea! 🎉

**URL de ejemplo**: https://mototaxis-app.vercel.app

Comparte este link con tus usuarios y ¡empieza a trabajar!
