// ============================================
// APP.JS - APLICACIÓN PRINCIPAL
// ============================================

class MototaxisApp {
    constructor() {
        this.intervalos = {};
        this.ciudadActual = null;
        this.pedidoSeleccionado = null;
        this.modoSeleccion = null; // 'origen' o 'destino'
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Iniciando aplicación de Mototaxis...');
        
        // Mostrar loader
        this.mostrarLoader(true);
        
        try {
            // Solicitar permisos de notificación
            await UTILS.solicitarPermisoNotificaciones();
            
            // Cargar ciudades
            await this.cargarCiudades();
            
            // Inicializar tabs
            this.initTabs();
            
            // Inicializar eventos
            this.initEventos();
            
            // Cargar datos iniciales
            await this.cargarDatosIniciales();
            
            // Iniciar actualizaciones automáticas
            this.iniciarActualizaciones();
            
            console.log('✅ Aplicación iniciada correctamente');
        } catch (error) {
            console.error('❌ Error al iniciar aplicación:', error);
            UTILS.mostrarNotificacion('Error', 'Error al iniciar la aplicación', 'error');
        } finally {
            this.mostrarLoader(false);
        }
    }
    
    // ============================================
    // CIUDADES
    // ============================================
    
    async cargarCiudades() {
        try {
            const ciudades = await CIUDADES.cargarCiudades();
            const select = document.getElementById('selectCiudad');
            
            select.innerHTML = '<option value="">Seleccionar ciudad...</option>';
            ciudades.forEach(ciudad => {
                const option = document.createElement('option');
                option.value = ciudad.id;
                option.textContent = ciudad.nombre;
                option.dataset.lat = ciudad.latitud;
                option.dataset.lng = ciudad.longitud;
                option.dataset.radio = ciudad.radio_km;
                select.appendChild(option);
            });
            
            // Seleccionar primera ciudad por defecto
            if (ciudades.length > 0) {
                select.value = ciudades[0].id;
                this.cambiarCiudad(ciudades[0]);
            }
        } catch (error) {
            console.error('Error cargando ciudades:', error);
        }
    }
    
    cambiarCiudad(ciudad) {
        this.ciudadActual = ciudad;
        if (window.mapaManager) {
            window.mapaManager.centrarMapa(ciudad.latitud, ciudad.longitud);
        }
    }
    
    // ============================================
    // TABS
    // ============================================
    
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover active de todos
                tabButtons.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Activar actual
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }
    
    // ============================================
    // EVENTOS
    // ============================================
    
    initEventos() {
        // Botón de refrescar
        document.getElementById('btnRefresh').addEventListener('click', () => {
            this.cargarDatosIniciales();
        });
        
        // Selector de ciudad
        document.getElementById('selectCiudad').addEventListener('change', (e) => {
            const option = e.target.selectedOptions[0];
            if (option.dataset.lat) {
                this.cambiarCiudad({
                    id: e.target.value,
                    nombre: option.textContent,
                    latitud: parseFloat(option.dataset.lat),
                    longitud: parseFloat(option.dataset.lng),
                    radio_km: parseFloat(option.dataset.radio)
                });
            }
        });
        
        // Toggle sidebar (mobile)
        const btnToggle = document.getElementById('btnToggleSidebar');
        const btnClose = document.getElementById('btnCloseSidebar');
        const sidebar = document.getElementById('sidebar');
        
        if (btnToggle) {
            btnToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        }
        
        // Filtros
        document.getElementById('filterEstado').addEventListener('change', () => {
            if (window.pedidosManager) {
                window.pedidosManager.aplicarFiltros();
            }
        });
        
        document.getElementById('filterFecha').addEventListener('change', () => {
            if (window.pedidosManager) {
                window.pedidosManager.aplicarFiltros();
            }
        });
        
        // Modal
        document.getElementById('btnCloseModal').addEventListener('click', () => {
            this.cerrarModal();
        });
        
        document.getElementById('modalDetallePedido').addEventListener('click', (e) => {
            if (e.target.id === 'modalDetallePedido') {
                this.cerrarModal();
            }
        });
    }
    
    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    async cargarDatosIniciales() {
        try {
            await Promise.all([
                window.pedidosManager?.cargarPedidos(),
                window.conductoresManager?.cargarConductores()
            ]);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }
    
    // ============================================
    // ACTUALIZACIONES AUTOMÁTICAS
    // ============================================
    
    iniciarActualizaciones() {
        // Actualizar pedidos cada 3 segundos
        this.intervalos.pedidos = setInterval(() => {
            if (window.pedidosManager) {
                window.pedidosManager.cargarPedidos();
            }
        }, UPDATE_CONFIG.intervaloPedidos);
        
        // Actualizar conductores cada 10 segundos
        this.intervalos.conductores = setInterval(() => {
            if (window.conductoresManager) {
                window.conductoresManager.cargarConductores();
            }
        }, UPDATE_CONFIG.intervaloConductores);
        
        // Actualizar ubicaciones en tiempo real cada 5 segundos
        this.intervalos.ubicaciones = setInterval(() => {
            if (window.mapaManager) {
                window.mapaManager.actualizarUbicaciones();
            }
        }, UPDATE_CONFIG.intervaloUbicaciones);
    }
    
    detenerActualizaciones() {
        Object.values(this.intervalos).forEach(intervalo => {
            clearInterval(intervalo);
        });
        this.intervalos = {};
    }
    
    // ============================================
    // UI HELPERS
    // ============================================
    
    mostrarLoader(mostrar) {
        const loader = document.getElementById('loader');
        if (mostrar) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }
    
    mostrarModal(titulo, contenido) {
        const modal = document.getElementById('modalDetallePedido');
        const modalTitulo = document.getElementById('modalTitulo');
        const modalBody = document.getElementById('modalBody');
        
        modalTitulo.textContent = titulo;
        modalBody.innerHTML = contenido;
        modal.classList.add('active');
    }
    
    cerrarModal() {
        document.getElementById('modalDetallePedido').classList.remove('active');
    }
    
    // ============================================
    // LIMPIEZA
    // ============================================
    
    destroy() {
        this.detenerActualizaciones();
        if (window.mapaManager) {
            window.mapaManager.destroy();
        }
    }
}

// ============================================
// INICIALIZAR APLICACIÓN
// ============================================

let app;

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new MototaxisApp();
    });
} else {
    app = new MototaxisApp();
}

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});
