// ============================================
// MAPA.JS - GESTIÓN DEL MAPA
// ============================================

class MapaManager {
    constructor() {
        this.mapa = null;
        this.marcadores = {
            conductores: {},
            pedidos: {},
            base: null
        };
        this.capas = {
            conductores: null,
            rutas: null
        };
        this.rutaActual = null;
        
        this.init();
    }
    
    init() {
        console.log('🗺️ Inicializando mapa...');
        
        // Crear mapa
        this.mapa = L.map('map').setView(
            MAP_CONFIG.defaultCenter,
            MAP_CONFIG.defaultZoom
        );
        
        // Agregar capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: MAP_CONFIG.maxZoom,
            minZoom: MAP_CONFIG.minZoom
        }).addTo(this.mapa);
        
        // Crear grupos de capas
        this.capas.conductores = L.layerGroup().addTo(this.mapa);
        this.capas.rutas = L.layerGroup().addTo(this.mapa);
        
        // Eventos del mapa
        this.initEventos();
        
        console.log('✅ Mapa inicializado');
    }
    
    initEventos() {
        // Click en el mapa para seleccionar origen/destino
        this.mapa.on('click', (e) => {
            if (app.modoSeleccion) {
                this.seleccionarUbicacion(e.latlng);
            }
        });
        
        // Botones de control
        document.getElementById('btnCenterMap').addEventListener('click', () => {
            this.centrarEnConductores();
        });
        
        document.getElementById('btnMyLocation').addEventListener('click', () => {
            this.obtenerUbicacionActual();
        });
    }
    
    // ============================================
    // CONDUCTORES
    // ============================================
    
    actualizarConductores(conductores) {
        // Limpiar marcadores antiguos
        this.capas.conductores.clearLayers();
        this.marcadores.conductores = {};
        
        conductores.forEach(conductor => {
            if (conductor.latitud && conductor.longitud) {
                this.agregarMarcadorConductor(conductor);
            }
        });
        
        // Auto-centrar si está habilitado
        if (MAP_CONFIG.autoCenterEnabled && conductores.length > 0) {
            this.centrarEnConductores();
        }
    }
    
    agregarMarcadorConductor(conductor) {
        const estado = conductor.estado || 'disponible';
        const color = estado === 'disponible' ? '#10b981' : 
                      estado === 'ocupado' ? '#f59e0b' : '#9ca3af';
        
        const icono = L.divIcon({
            className: 'conductor-marker',
            html: `
                <div style="
                    width: 40px;
                    height: 40px;
                    background: ${color};
                    border: 3px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    cursor: pointer;
                ">
                    🏍️
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const marcador = L.marker([conductor.latitud, conductor.longitud], {
            icon: icono,
            title: conductor.nombre
        });
        
        // Popup con información
        marcador.bindPopup(`
            <div style="min-width: 200px;">
                <strong>${conductor.nombre}</strong><br>
                <span style="color: ${color};">● ${this.traducirEstado(estado)}</span><br>
                ${conductor.telefono ? `📱 ${conductor.telefono}<br>` : ''}
                ${conductor.placa ? `🏍️ ${conductor.placa}` : ''}
            </div>
        `);
        
        marcador.addTo(this.capas.conductores);
        this.marcadores.conductores[conductor.id] = marcador;
    }
    
    // ============================================
    // RUTAS
    // ============================================
    
    async dibujarRuta(origenLat, origenLng, destinoLat, destinoLng) {
        try {
            // Limpiar ruta anterior
            this.capas.rutas.clearLayers();
            
            // Obtener ruta de OSRM
            const url = `${MAP_CONFIG.osrmServer}/route/v1/driving/${origenLng},${origenLat};${destinoLng},${destinoLat}?overview=full&geometries=geojson`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const ruta = data.routes[0];
                const coordenadas = ruta.geometry.coordinates.map(c => [c[1], c[0]]);
                
                // Dibujar línea de ruta
                const lineaRuta = L.polyline(coordenadas, {
                    color: '#2563eb',
                    weight: 4,
                    opacity: 0.7
                }).addTo(this.capas.rutas);
                
                // Marcador de origen
                const markerOrigen = L.marker([origenLat, origenLng], {
                    icon: L.divIcon({
                        html: '📍',
                        className: 'marker-emoji',
                        iconSize: [30, 30]
                    })
                }).addTo(this.capas.rutas);
                
                markerOrigen.bindPopup('<strong>Origen</strong>');
                
                // Marcador de destino
                const markerDestino = L.marker([destinoLat, destinoLng], {
                    icon: L.divIcon({
                        html: '🏁',
                        className: 'marker-emoji',
                        iconSize: [30, 30]
                    })
                }).addTo(this.capas.rutas);
                
                markerDestino.bindPopup('<strong>Destino</strong>');
                
                // Centrar mapa en la ruta
                this.mapa.fitBounds(lineaRuta.getBounds(), { padding: [50, 50] });
                
                // Calcular distancia y tiempo
                const distanciaKm = ruta.distance / 1000;
                const tiempoMin = (ruta.duration / 60) * MAP_CONFIG.multiplicadorTrafico;
                
                this.rutaActual = {
                    distancia: distanciaKm,
                    tiempo: tiempoMin,
                    geometria: coordenadas
                };
                
                return this.rutaActual;
            } else {
                throw new Error('No se pudo calcular la ruta');
            }
        } catch (error) {
            console.error('Error dibujando ruta:', error);
            UTILS.mostrarNotificacion('Error', 'No se pudo calcular la ruta', 'error');
            return null;
        }
    }
    
    limpiarRuta() {
        this.capas.rutas.clearLayers();
        this.rutaActual = null;
    }
    
    // ============================================
    // UBICACIÓN
    // ============================================
    
    async seleccionarUbicacion(latlng) {
        try {
            // Obtener dirección usando geocodificación inversa
            const direccion = await this.obtenerDireccion(latlng.lat, latlng.lng);
            
            if (app.modoSeleccion === 'origen') {
                document.getElementById('origenDireccion').value = direccion;
                document.getElementById('origenDireccion').dataset.lat = latlng.lat;
                document.getElementById('origenDireccion').dataset.lng = latlng.lng;
                
                // Agregar marcador temporal
                if (this.marcadores.origenTemp) {
                    this.mapa.removeLayer(this.marcadores.origenTemp);
                }
                this.marcadores.origenTemp = L.marker(latlng, {
                    icon: L.divIcon({
                        html: '📍',
                        className: 'marker-emoji',
                        iconSize: [30, 30]
                    })
                }).addTo(this.mapa);
                
            } else if (app.modoSeleccion === 'destino') {
                document.getElementById('destinoDireccion').value = direccion;
                document.getElementById('destinoDireccion').dataset.lat = latlng.lat;
                document.getElementById('destinoDireccion').dataset.lng = latlng.lng;
                
                // Agregar marcador temporal
                if (this.marcadores.destinoTemp) {
                    this.mapa.removeLayer(this.marcadores.destinoTemp);
                }
                this.marcadores.destinoTemp = L.marker(latlng, {
                    icon: L.divIcon({
                        html: '🏁',
                        className: 'marker-emoji',
                        iconSize: [30, 30]
                    })
                }).addTo(this.mapa);
            }
            
            app.modoSeleccion = null;
            document.body.style.cursor = 'default';
            
            // Si ambos están seleccionados, calcular ruta
            const origenLat = document.getElementById('origenDireccion').dataset.lat;
            const destinoLat = document.getElementById('destinoDireccion').dataset.lat;
            
            if (origenLat && destinoLat) {
                window.pedidosManager?.calcularRutaPedido();
            }
            
        } catch (error) {
            console.error('Error seleccionando ubicación:', error);
        }
    }
    
    async obtenerDireccion(lat, lng) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            console.error('Error obteniendo dirección:', error);
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    }
    
    obtenerUbicacionActual() {
        if ('geolocation' in navigator) {
            this.mapa.locate({
                setView: true,
                maxZoom: 16
            });
            
            this.mapa.on('locationfound', (e) => {
                L.circle(e.latlng, {
                    radius: e.accuracy / 2,
                    color: '#2563eb',
                    fillColor: '#2563eb',
                    fillOpacity: 0.2
                }).addTo(this.mapa);
                
                UTILS.mostrarNotificacion('Ubicación', 'Te encontramos en el mapa', 'success');
            });
            
            this.mapa.on('locationerror', () => {
                UTILS.mostrarNotificacion('Error', 'No se pudo obtener tu ubicación', 'error');
            });
        } else {
            UTILS.mostrarNotificacion('Error', 'Tu navegador no soporta geolocalización', 'error');
        }
    }
    
    // ============================================
    // UTILIDADES
    // ============================================
    
    centrarMapa(lat, lng, zoom = MAP_CONFIG.autoCenterZoom) {
        this.mapa.setView([lat, lng], zoom);
    }
    
    centrarEnConductores() {
        const marcadores = Object.values(this.marcadores.conductores);
        if (marcadores.length > 0) {
            const grupo = L.featureGroup(marcadores);
            this.mapa.fitBounds(grupo.getBounds(), { padding: [50, 50] });
        }
    }
    
    traducirEstado(estado) {
        const traducciones = {
            'disponible': 'Disponible',
            'ocupado': 'Ocupado',
            'inactivo': 'Inactivo'
        };
        return traducciones[estado] || estado;
    }
    
    async actualizarUbicaciones() {
        // Actualizar ubicaciones en tiempo real
        // Esta función se puede expandir para escuchar cambios en tiempo real
        if (window.conductoresManager) {
            await window.conductoresManager.cargarConductores();
        }
    }
    
    destroy() {
        if (this.mapa) {
            this.mapa.remove();
        }
    }
}

// Inicializar cuando el DOM esté listo
window.mapaManager = new MapaManager();
