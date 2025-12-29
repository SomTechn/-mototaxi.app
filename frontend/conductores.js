// ============================================
// CONDUCTORES.JS - GESTIÓN DE CONDUCTORES
// ============================================

class ConductoresManager {
    constructor() {
        this.conductores = [];
        this.init();
    }
    
    init() {
        console.log('👤 Inicializando gestor de conductores...');
    }
    
    // ============================================
    // CARGAR CONDUCTORES
    // ============================================
    
    async cargarConductores() {
        try {
            const { data, error } = await supabase
                .from('conductores')
                .select('*')
                .order('nombre');
            
            if (error) throw error;
            
            this.conductores = data || [];
            this.renderizarConductores();
            this.actualizarEstadisticas();
            
            // Actualizar marcadores en el mapa
            if (window.mapaManager) {
                window.mapaManager.actualizarConductores(this.conductores);
            }
            
        } catch (error) {
            console.error('Error cargando conductores:', error);
            UTILS.mostrarNotificacion('Error', 'No se pudieron cargar los conductores', 'error');
        }
    }
    
    renderizarConductores() {
        const lista = document.getElementById('listaConductores');
        
        if (this.conductores.length === 0) {
            lista.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--gray-600);">
                    No hay conductores registrados
                </div>
            `;
            return;
        }
        
        lista.innerHTML = this.conductores.map(conductor => `
            <div class="item-card" onclick="window.conductoresManager.verDetalleConductor('${conductor.id}')">
                <div class="item-header">
                    <div class="item-title">${conductor.nombre}</div>
                    <span class="item-badge badge-${conductor.estado}">${this.traducirEstado(conductor.estado)}</span>
                </div>
                <div class="item-info">
                    ${conductor.telefono ? `<div>📱 ${conductor.telefono}</div>` : ''}
                    ${conductor.placa ? `<div>🏍️ ${conductor.placa}</div>` : ''}
                    ${conductor.ultima_actualizacion ? `<div><small>Última actualización: ${UTILS.formatearFecha(conductor.ultima_actualizacion)}</small></div>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    actualizarEstadisticas() {
        const disponibles = this.conductores.filter(c => c.estado === 'disponible').length;
        const ocupados = this.conductores.filter(c => c.estado === 'ocupado').length;
        
        document.getElementById('statDisponibles').textContent = disponibles;
        document.getElementById('statOcupados').textContent = ocupados;
    }
    
    // ============================================
    // DETALLE DE CONDUCTOR
    // ============================================
    
    async verDetalleConductor(conductorId) {
        try {
            const conductor = this.conductores.find(c => c.id === conductorId);
            if (!conductor) return;
            
            // Obtener pedidos del conductor
            const { data: pedidos } = await supabase
                .from('pedidos')
                .select('*')
                .eq('conductor_id', conductorId)
                .order('fecha_pedido', { ascending: false })
                .limit(5);
            
            const contenido = `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <strong>Nombre:</strong><br>
                        ${conductor.nombre}
                    </div>
                    
                    <div>
                        <strong>Estado:</strong><br>
                        <span class="item-badge badge-${conductor.estado}">${this.traducirEstado(conductor.estado)}</span>
                    </div>
                    
                    ${conductor.telefono ? `
                        <div>
                            <strong>Teléfono:</strong><br>
                            📱 <a href="tel:${conductor.telefono}">${conductor.telefono}</a>
                        </div>
                    ` : ''}
                    
                    ${conductor.placa ? `
                        <div>
                            <strong>Placa:</strong><br>
                            🏍️ ${conductor.placa}
                        </div>
                    ` : ''}
                    
                    ${conductor.latitud && conductor.longitud ? `
                        <div>
                            <strong>Última ubicación:</strong><br>
                            ${conductor.latitud.toFixed(6)}, ${conductor.longitud.toFixed(6)}
                        </div>
                    ` : ''}
                    
                    ${conductor.ultima_actualizacion ? `
                        <div>
                            <strong>Última actualización:</strong><br>
                            ${UTILS.formatearFecha(conductor.ultima_actualizacion)}
                        </div>
                    ` : ''}
                    
                    ${pedidos && pedidos.length > 0 ? `
                        <div>
                            <strong>Últimos pedidos:</strong><br>
                            <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                                ${pedidos.map(p => `
                                    <div style="font-size: 0.875rem; padding: 0.5rem; background: var(--gray-50); border-radius: 0.25rem;">
                                        <strong>${p.numero_pedido}</strong> - 
                                        <span class="item-badge badge-${p.estado}" style="font-size: 0.75rem;">${window.pedidosManager.traducirEstado(p.estado)}</span>
                                        <br>
                                        <small>${UTILS.formatearFecha(p.fecha_pedido)}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        ${conductor.latitud && conductor.longitud ? `
                            <button class="btn-primary" onclick="window.conductoresManager.verEnMapa('${conductor.id}')">
                                Ver en Mapa
                            </button>
                        ` : ''}
                        
                        <button class="btn-secondary" onclick="window.conductoresManager.cambiarEstado('${conductor.id}')">
                            Cambiar Estado
                        </button>
                    </div>
                </div>
            `;
            
            app.mostrarModal(`Conductor: ${conductor.nombre}`, contenido);
            
        } catch (error) {
            console.error('Error mostrando detalle de conductor:', error);
        }
    }
    
    verEnMapa(conductorId) {
        const conductor = this.conductores.find(c => c.id === conductorId);
        if (conductor && conductor.latitud && conductor.longitud) {
            app.cerrarModal();
            window.mapaManager.centrarMapa(conductor.latitud, conductor.longitud, 16);
            
            // Abrir popup del conductor
            const marcador = window.mapaManager.marcadores.conductores[conductorId];
            if (marcador) {
                marcador.openPopup();
            }
        }
    }
    
    async cambiarEstado(conductorId) {
        const conductor = this.conductores.find(c => c.id === conductorId);
        if (!conductor) return;
        
        const nuevoEstado = prompt(
            `Estado actual: ${this.traducirEstado(conductor.estado)}\n\n` +
            `Ingrese nuevo estado:\n` +
            `1 = Disponible\n` +
            `2 = Ocupado\n` +
            `3 = Inactivo`,
            conductor.estado === 'disponible' ? '1' : conductor.estado === 'ocupado' ? '2' : '3'
        );
        
        if (!nuevoEstado) return;
        
        const estados = {
            '1': 'disponible',
            '2': 'ocupado',
            '3': 'inactivo'
        };
        
        const estadoFinal = estados[nuevoEstado];
        if (!estadoFinal) {
            UTILS.mostrarNotificacion('Error', 'Estado inválido', 'error');
            return;
        }
        
        try {
            const { error } = await supabase
                .from('conductores')
                .update({ 
                    estado: estadoFinal,
                    ultima_actualizacion: new Date().toISOString()
                })
                .eq('id', conductorId);
            
            if (error) throw error;
            
            UTILS.mostrarNotificacion('Éxito', 'Estado actualizado', 'success');
            app.cerrarModal();
            await this.cargarConductores();
            
        } catch (error) {
            console.error('Error actualizando estado:', error);
            UTILS.mostrarNotificacion('Error', 'No se pudo actualizar el estado', 'error');
        }
    }
    
    // ============================================
    // CREAR CONDUCTOR
    // ============================================
    
    async crearConductor(datos) {
        try {
            const { data, error } = await supabase
                .from('conductores')
                .insert({
                    nombre: datos.nombre,
                    telefono: datos.telefono || null,
                    placa: datos.placa || null,
                    estado: 'disponible'
                })
                .select()
                .single();
            
            if (error) throw error;
            
            UTILS.mostrarNotificacion('Éxito', 'Conductor creado correctamente', 'success');
            await this.cargarConductores();
            
            return data;
            
        } catch (error) {
            console.error('Error creando conductor:', error);
            UTILS.mostrarNotificacion('Error', 'No se pudo crear el conductor', 'error');
            throw error;
        }
    }
    
    // ============================================
    // ACTUALIZAR UBICACIÓN
    // ============================================
    
    async actualizarUbicacion(conductorId, lat, lng) {
        try {
            const { error } = await supabase
                .from('conductores')
                .update({
                    latitud: lat,
                    longitud: lng,
                    ultima_actualizacion: new Date().toISOString()
                })
                .eq('id', conductorId);
            
            if (error) throw error;
            
            // Opcional: guardar en historial de ubicaciones
            await supabase
                .from('ubicaciones_tiempo_real')
                .insert({
                    conductor_id: conductorId,
                    latitud: lat,
                    longitud: lng
                });
            
        } catch (error) {
            console.error('Error actualizando ubicación:', error);
        }
    }
    
    // ============================================
    // UTILIDADES
    // ============================================
    
    traducirEstado(estado) {
        const traducciones = {
            'disponible': 'Disponible',
            'ocupado': 'Ocupado',
            'inactivo': 'Inactivo'
        };
        return traducciones[estado] || estado;
    }
    
    obtenerConductoresDisponibles() {
        return this.conductores.filter(c => c.estado === 'disponible');
    }
    
    encontrarConductorCercano(lat, lng, radioKm = 5) {
        const disponibles = this.obtenerConductoresDisponibles();
        
        const conductoresConDistancia = disponibles
            .filter(c => c.latitud && c.longitud)
            .map(c => ({
                ...c,
                distancia: UTILS.calcularDistancia(lat, lng, c.latitud, c.longitud)
            }))
            .filter(c => c.distancia <= radioKm)
            .sort((a, b) => a.distancia - b.distancia);
        
        return conductoresConDistancia[0] || null;
    }
}

// Inicializar
window.conductoresManager = new ConductoresManager();
