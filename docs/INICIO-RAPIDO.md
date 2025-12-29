# ⚡ Inicio Rápido - 5 Minutos

Esta es la guía más rápida para poner en funcionamiento tu sistema de mototaxis.

## 🎯 En 5 Pasos

### 1️⃣ Supabase (2 minutos)

1. Ve a [supabase.com](https://supabase.com) → Crea cuenta
2. Nuevo proyecto → Espera que se cree
3. SQL Editor → Pega `database/schema.sql` → RUN
4. Settings → API → Copia URL y anon key

### 2️⃣ Configurar (30 segundos)

Abre `frontend/config.js`:

```javascript
const SUPABASE_CONFIG = {
    url: 'PEGA_TU_URL_AQUÍ',
    anonKey: 'PEGA_TU_KEY_AQUÍ'
};
```

### 3️⃣ Probar Localmente (30 segundos)

```bash
cd frontend
python -m http.server 8000
```

Abre: `http://localhost:8000`

### 4️⃣ Datos de Prueba (1 minuto)

En Supabase SQL Editor, pega y ejecuta:
```sql
-- Copiar contenido de database/datos-prueba.sql
```

### 5️⃣ Subir a Internet (1 minuto)

1. [vercel.com](https://vercel.com) → New Project
2. Import Git Repository (sube a GitHub primero) o arrastra carpeta
3. Root Directory: `frontend`
4. Deploy → ¡Listo! 🎉

## 🎮 Probar el Sistema

1. ✅ Abre la app
2. ✅ Deberías ver conductores en el mapa
3. ✅ Ve a "Nuevo Pedido"
4. ✅ Crea un pedido de prueba
5. ✅ Verifica que aparece en la lista

## 📱 Instalar como App

**En Móvil:**
- Chrome: Menú → "Agregar a pantalla de inicio"
- Safari: Compartir → "Agregar a pantalla de inicio"

## 🆘 Algo Salió Mal?

### No veo conductores
→ Ejecuta `database/datos-prueba.sql`

### Error de conexión
→ Verifica config.js tiene las credenciales correctas

### Mapa no carga
→ Verifica conexión a internet

## 📚 Documentación Completa

- 📖 [README completo](../README.md)
- 🗄️ [Guía de Supabase](SUPABASE.md)
- 🚀 [Guía de Deploy](DEPLOY.md)

## ✅ Checklist

- [ ] Supabase configurado
- [ ] Credenciales en config.js
- [ ] Schema.sql ejecutado
- [ ] App funciona localmente
- [ ] Datos de prueba cargados
- [ ] Desplegado en Vercel
- [ ] PWA instalada en móvil

---

**¿Todo listo?** ¡Empieza a usar tu sistema! 🎉

**¿Necesitas ayuda?** Lee la documentación completa.
