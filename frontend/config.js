// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================

// IMPORTANTE: Reemplaza estos valores con los de tu proyecto de Supabase
const SUPABASE_CONFIG = {
    url: 'https://kwgjkhlpswjrzdpoewxx.supabase.coL', // Ejemplo: https://abcdefghijklmnop.supabase.co
    anonKey: 'sb_publishable_BEgCcvdUCM_kNWUb089Dvg_UB99FcTQ' // Es la clave pública, es seguro exponerla
};

// Inicializar cliente de Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Alias global para usar en otros archivos
window.supabase = supabaseClient;

// ============================================
// CONFIGURACIÓN DEL MAPA
// ============================================

const MAP_CONFIG = {
    defaultCenter: [14.0723, -87.1921], // Tegucigalpa por defecto
    defaultZoom: 13,
    maxZoom: 18,
    minZoom: 10,
    
    // Configuración de auto-centrado
    autoCenterEnabled: true,
    autoCenterZoom: 14,
    
    // Radio de búsqueda de conductores (km)
    radioBusquedaConductores: 5,
    
    // Configuración de rutas
    osrmServer: 'https://router.project-osrm.org',
    multiplicadorTrafico: 1.3, // 30% más de tiempo por tráfico
    
    // Estilos de marcadores
    iconos: {
        conductor: {
            disponible: '🟢',
            ocupado: '🟡',
            inactivo: '⚪'
        },
        origen: '📍',
        destino: '🏁',
        base: '🏠'
    }
};

// ============================================
// CONFIGURACIÓN DE PRECIOS
// ============================================

const PRICING_CONFIG = {
    precioBaseKm: 15, // Lempiras por km
    precioMinimo: 30, // Precio mínimo de carrera
    
    // Se puede sobreescribir desde la base de datos
    async cargarDesdeDB() {
        try {
            const { data, error } = await window.supabase
                .from('configuracion')
                .select('clave, valor')
                .in('clave', ['precio_base_km', 'precio_minimo']);
            
            if (data && !error) {
                data.forEach(config => {
                    if (config.clave === 'precio_base_km') {
                        this.precioBaseKm = parseFloat(config.valor);
                    }
                    if (config.clave === 'precio_minimo') {
                        this.precioMinimo = parseFloat(config.valor);
                    }
                });
            }
        } catch (e) {
            console.error('Error cargando configuración de precios:', e);
        }
    },
    
    calcularPrecio(distanciaKm) {
        const precio = distanciaKm * this.precioBaseKm;
        return Math.max(precio, this.precioMinimo);
    }
};

// ============================================
// CONFIGURACIÓN DE ACTUALIZACIÓN
// ============================================

const UPDATE_CONFIG = {
    // Intervalo de actualización de ubicaciones (ms)
    intervaloUbicaciones: 5000, // 5 segundos
    
    // Intervalo de actualización de pedidos (ms)
    intervaloPedidos: 3000, // 3 segundos
    
    // Intervalo de actualización de conductores (ms)
    intervaloConductores: 10000, // 10 segundos
};

// ============================================
// CIUDADES
// ============================================

const CIUDADES = {
    async cargarCiudades() {
        try {
            const { data, error } = await window.supabase
                .from('ciudades')
                .select('*')
                .eq('activo', true)
                .order('nombre');
            
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error cargando ciudades:', e);
            // Ciudades por defecto si falla
            return [
                { id: 1, nombre: 'Tegucigalpa', latitud: 14.0723, longitud: -87.1921, radio_km: 15 },
                { id: 2, nombre: 'San Pedro Sula', latitud: 15.5048, longitud: -88.0250, radio_km: 12 },
                { id: 3, nombre: 'Choloma', latitud: 15.6100, longitud: -87.9500, radio_km: 10 }
            ];
        }
    }
};

// ============================================
// UTILIDADES
// ============================================

const UTILS = {
    formatearFecha(fecha) {
        if (!fecha) return '-';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-HN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatearPrecio(precio) {
        return `L ${parseFloat(precio).toFixed(2)}`;
    },
    
    formatearDistancia(km) {
        return `${parseFloat(km).toFixed(2)} km`;
    },
    
    formatearTiempo(minutos) {
        if (minutos < 60) {
            return `${Math.round(minutos)} min`;
        }
        const horas = Math.floor(minutos / 60);
        const mins = Math.round(minutos % 60);
        return `${horas}h ${mins}min`;
    },
    
    calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    
    mostrarNotificacion(titulo, mensaje, tipo = 'info') {
        // Implementar notificaciones (toast)
        console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
        
        // Si el navegador soporta notificaciones
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(titulo, {
                body: mensaje,
                icon: '/icon-192.png'
            });
        }
    },
    
    async solicitarPermisoNotificaciones() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }
};

// Cargar configuración de precios al inicio
PRICING_CONFIG.cargarDesdeDB();
