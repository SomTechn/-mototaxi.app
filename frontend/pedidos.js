// ============================================
// PEDIDOS.JS - GESTIÓN DE PEDIDOS
// ============================================

class PedidosManager {
    constructor() {
        this.pedidos = [];
        this.pedidosFiltrados = [];
        this.init();
    }
    
    init() {
        console.log('📋 Inicializando gestor de pedidos...');
        this.initEventos();
    }
    
    initEventos() {
        // Formulario de nuevo pedido
        const form = document.getElementById('formNuevoPedido');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.crearPedido();
        });
        
        // Botones de selección de ubicación
        document.getElementById('btnSeleccionarOrigen').addEventListener('click', () => {
            app.modoSeleccion = 'origen';
            document.body.style.cursor = 'crosshair';
            UTILS.mostrarNotificacion('Mapa', 'Haz click en el mapa para seleccionar el origen', 'info');
        });
        
        document.getElementById('btnSeleccionarDestino').addEventListener('click', () => {
            app.modoSeleccion = 'destino';
            document.body.style.cursor = 'crosshair';
            UTILS.mostrarNotificacion('Mapa', 'Haz click en el mapa para seleccionar el destino', 'info');
        });
    }
    
    // ============================================
    // CARGAR PEDIDOS
    // ============================================
    
    async cargarPedidos() {
        try {
            const { data, error } = await supabase
                .from('vista_pedidos_completa')
                .select('*')
                .order('fecha_pedido', { ascending: false })
                .limit(100);
            
            if (error) throw error;
            
            this.pedidos = data || [];
            this.aplicarFiltros();
            
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            UTILS.mostrarNotificacion('Error', 'No se pudieron cargar los pedidos', 'error');
        }
    }
    
    aplicarFiltros() {
        const filtroEstado = document.getElementById('filterEstado').value;
        const filtroFecha = document.getElementById('filterFecha').value;
        
        this.pedidosFiltrados = this.pedidos.filter(pedido => {
            let cumpleFiltros = true;
            
            if (filtroEstado && pedido.estado !== filtroEstado) {
                cumpleFiltros = false;
            }
            
            if (filtroFecha) {
                const fechaPedido = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
                if (fechaPedido !== filtroFecha) {
                    cumpleFiltros = false;
                }
            }
            
            return cumpleFiltros;
        });
        
        this.renderizarPedidos();
    }
    
    renderizarPedidos() {
        const lista = document.getElementById('listaPedidos');
        
        if (this.pedidosFiltrados.length === 0) {
            lista.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--gray-600);">
                    No hay pedidos para mostrar
                </div>
            `;
            return;
        }
        
        lista.innerHTML = this.pedidosFiltrados.map(pedido => `
            <div class="item-card" onclick="window.pedidosManager.verDetallePedido('${pedido.id}')">
                <div class="item-header">
                    <div class="item-title">${pedido.numero_pedido || 'Sin número'}</div>
                    <span class="item-badge badge-${pedido.estado}">${this.traducirEstado(pedido.estado)}</span>
                </div>
                <div class="item-info">
                    <div><strong>Cliente:</strong> ${pedido.nombre_cliente || 'N/A'}</div>
                    ${pedido.nombre_conductor ? `<div><strong>Conductor:</strong> ${pedido.nombre_conductor}</div>` : ''}
                    <div><strong>Origen:</strong> ${this.truncarTexto(pedido.origen_direccion, 40)}</div>
                    <div><strong>Destino:</strong> ${this.truncarTexto(pedido.destino_direccion, 40)}</div>
                    ${pedido.distancia_km ? `<div><strong>Distancia:</strong> ${UTILS.formatearDistancia(pedido.distancia_km)}</div>` : ''}
                    ${pedido.precio ? `<div><strong>Precio:</strong> ${UTILS.formatearPrecio(pedido.precio)}</div>` : ''}
                    <div><strong>Fecha:</strong> ${UTILS.formatearFecha(pedido.fecha_pedido)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // ============================================
    // CREAR PEDIDO
    // ============================================
    
    async crearPedido() {
        try {
            // Validar datos
            const clienteNombre = document.getElementById('clienteNombre').value.trim();
            const clienteTelefono = document.getElementById('clienteTelefono').value.trim();
            const origenDireccion = document.getElementById('origenDireccion').value.trim();
            const destinoDireccion = document.getElementById('destinoDireccion').value.trim();
            const notas = document.getElementById('pedidoNotas').value.trim();
            
            const origenLat = parseFloat(document.getElementById('origenDireccion').dataset.lat);
            const origenLng = parseFloat(document.getElementById('origenDireccion').dataset.lng);
            const destinoLat = parseFloat(document.getElementById('destinoDireccion').dataset.lat);
            const destinoLng = parseFloat(document.getElementById('destinoDireccion').dataset.lng);
            
            if (!clienteNombre || !origenDireccion || !destinoDireccion) {
                UTILS.mostrarNotificacion('Error', 'Por favor completa todos los campos requeridos', 'error');
                return;
            }
            
            if (!origenLat || !origenLng || !destinoLat || !destinoLng) {
                UTILS.mostrarNotificacion('Error', 'Selecciona las ubicaciones en el mapa', 'error');
                return;
            }
            
            app.mostrarLoader(true);
            
            // Crear o buscar cliente
            let clienteId = null;
            
            // Buscar cliente existente por teléfono
            if (clienteTelefono) {
                const { data: clientesExistentes } = await supabase
                    .from('clientes')
                    .select('id')
                    .eq('telefono', clienteTelefono)
                    .limit(1);
                
                if (clientesExistentes && clientesExistentes.length > 0) {
                    clienteId = clientesExistentes[0].id;
                }
            }
            
            // Si no existe, crear nuevo cliente
            if (!clienteId) {
                const { data: nuevoCliente, error: errorCliente } = await supabase
                    .from('clientes')
                    .insert({
                        nombre: clienteNombre,
                        telefono: clienteTelefono || null
                    })
                    .select()
                    .single();
                
                if (errorCliente) throw errorCliente;
                clienteId = nuevoCliente.id;
            }
            
            // Obtener datos de la ruta
            const distancia = window.mapaManager.rutaActual?.distancia || 
                             UTILS.calcularDistancia(origenLat, origenLng, destinoLat, destinoLng);
            const tiempo = window.mapaManager.rutaActual?.tiempo || (distancia / 30 * 60); // Asume 30 km/h
            const precio = PRICING_CONFIG.calcularPrecio(distancia);
            
            // Crear pedido
            const { data: nuevoPedido, error: errorPedido } = await supabase
                .from('pedidos')
                .insert({
                    cliente_id: clienteId,
                    origen_direccion: origenDireccion,
                    origen_lat: origenLat,
                    origen_lng: origenLng,
                    destino_direccion: destinoDireccion,
                    destino_lat: destinoLat,
                    destino_lng: destinoLng,
                    distancia_km: distancia,
                    tiempo_estimado_min: Math.round(tiempo),
                    precio: precio,
                    estado: 'pendiente',
                    notas: notas || null
                })
                .select()
                .single();
            
            if (errorPedido) throw errorPedido;
            
            UTILS.mostrarNotificacion('Éxito', 'Pedido creado correctamente', 'success');
            
            // Limpiar formulario
            document.getElementById('formNuevoPedido').reset();
            document.getElementById('origenDireccion').dataset.lat = '';
            document.getElementById('origenDireccion').dataset.lng = '';
            document.getElementById('destinoDireccion').dataset.lat = '';
            document.getElementById('destinoDireccion').dataset.lng = '';
            document.getElementById('resumenPedido').classList.add('hidden');
            
            // Limpiar marcadores temporales
            if (window.mapaManager.marcadores.origenTemp) {
                window.mapaManager.mapa.removeLayer(window.mapaManager.marcadores.origenTemp);
            }
            if (window.mapaManager.marcadores.destinoTemp) {
                window.mapaManager.mapa.removeLayer(window.mapaManager.marcadores.destinoTemp);
            }
            window.mapaManager.limpiarRuta();
            
            // Recargar lista de pedidos
            await this.cargarPedidos();
            
            // Cambiar a tab de pedidos
            document.querySelector('[data-tab="pedidos"]').click();
            
        } catch (error) {
            console.error('Error creando pedido:', error);
            UTILS.mostrarNotificacion('Error', 'No se pudo crear el pedido', 'error');
        } finally {
            app.mostrarLoader(false);
        }
    }
    
    async calcularRutaPedido() {
        const origenLat = parseFloat(document.getElementById('origenDireccion').dataset.lat);
        const origenLng = parseFloat(document.getElementById('origenDireccion').dataset.lng);
        const destinoLat = parseFloat(document.getElementById('destinoDireccion').dataset.lat);
        const destinoLng = parseFloat(document.getElementById('destinoDireccion').dataset.lng);
        
        if (origenLat && origenLng && destinoLat && destinoLng) {
            const ruta = await window.mapaManager.dibujarRuta(origenLat, origenLng, destinoLat, destinoLng);
            
            if (ruta) {
                const precio = PRICING_CONFIG.calcularPrecio(ruta.distancia);
                
                document.getElementById('resumenDistancia').textContent = UTILS.formatearDistancia(ruta.distancia);
                document.getElementById('resumenTiempo').textContent = UTILS.formatearTiempo(ruta.tiempo);
                document.getElementById('resumenPrecio').textContent = UTILS.formatearPrecio(precio);
                document.getElementById('resumenPedido').classList.remove('hidden');
            }
        }
    }
    
    // ============================================
    // DETALLE DE PEDIDO
    // ============================================
    
    async verDetallePedido(pedidoId) {
        try {
            const pedido = this.pedidos.find(p => p.id === pedidoId);
            if (!pedido) return;
            
            const contenido = `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <strong>Número de Pedido:</strong><br>
                        ${pedido.numero_pedido || 'N/A'}
                    </div>
                    
                    <div>
                        <strong>Estado:</strong><br>
                        <span class="item-badge badge-${pedido.estado}">${this.traducirEstado(pedido.estado)}</span>
                    </div>
                    
                    <div>
                        <strong>Cliente:</strong><br>
                        ${pedido.nombre_cliente || 'N/A'}
                        ${pedido.telefono_cliente ? `<br>📱 ${pedido.telefono_cliente}` : ''}
                    </div>
                    
                    ${pedido.nombre_conductor ? `
                        <div>
                            <strong>Conductor:</strong><br>
                            ${pedido.nombre_conductor}
                            ${pedido.telefono_conductor ? `<br>📱 ${pedido.telefono_conductor}` : ''}
                            ${pedido.placa_conductor ? `<br>🏍️ ${pedido.placa_conductor}` : ''}
                        </div>
                    ` : ''}
                    
                    <div>
                        <strong>Origen:</strong><br>
                        ${pedido.origen_direccion || 'N/A'}
                    </div>
                    
                    <div>
                        <strong>Destino:</strong><br>
                        ${pedido.destino_direccion || 'N/A'}
                    </div>
                    
                    ${pedido.distancia_km ? `
                        <div>
                            <strong>Distancia:</strong> ${UTILS.formatearDistancia(pedido.distancia_km)}
                        </div>
                    ` : ''}
                    
                    ${pedido.tiempo_estimado_min ? `
                        <div>
                            <strong>Tiempo estimado:</strong> ${UTILS.formatearTiempo(pedido.tiempo_estimado_min)}
                        </div>
                    ` : ''}
                    
                    ${pedido.precio ? `
                        <div>
                            <strong>Precio:</strong> ${UTILS.formatearPrecio(pedido.precio)}
                        </div>
                    ` : ''}
                    
                    ${pedido.notas ? `
                        <div>
                            <strong>Notas:</strong><br>
                            ${pedido.notas}
                        </div>
                    ` : ''}
                    
                    <div>
                        <strong>Fecha del pedido:</strong><br>
                        ${UTILS.formatearFecha(pedido.fecha_pedido)}
                    </div>
                    
                    ${pedido.fecha_completado ? `
                        <div>
                            <strong>Fecha de completado:</strong><br>
                            ${UTILS.formatearFecha(pedido.fecha_completado)}
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        ${pedido.estado === 'pendiente' ? `
                            <button class="btn-primary" onclick="window.pedidosManager.asignarConductor('${pedido.id}')">
                                Asignar Conductor
                            </button>
                        ` : ''}
                        
                        ${pedido.origen_lat && pedido.destino_lat ? `
                            <button class="btn-secondary" onclick="window.pedidosManager.verEnMapa('${pedido.id}')">
                                Ver en Mapa
                            </button>
                        ` : ''}
                        
                        ${['pendiente', 'asignado'].includes(pedido.estado) ? `
                            <button class="btn-secondary" onclick="window.pedidosManager.cancelarPedido('${pedido.id}')" 
                                    style="background: var(--danger-color); color: white; border: none;">
                                Cancelar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            
            app.mostrarModal(`Pedido: ${pedido.numero_pedido}`, contenido);
            
        } catch (error) {
            console.error('Error mostrando detalle de pedido:', error);
        }
    }
    
    async verEnMapa(pedidoId) {
        const pedido = this.pedidos.find(p => p.id === pedidoId);
        if (pedido && pedido.origen_lat && pedido.destino_lat) {
            app.cerrarModal();
            await window.mapaManager.dibujarRuta(
                pedido.origen_lat,
                pedido.origen_lng,
                pedido.destino_lat,
                pedido.destino_lng
            );
        }
    }
    
    async asignarConductor(pedidoId) {
        // TODO: Implementar asignación de conductor
        UTILS.mostrarNotificacion('Info', 'Función de asignación en desarrollo', 'info');
    }
    
    async cancelarPedido(pedidoId) {
        if (!confirm('¿Estás seguro de cancelar este pedido?')) return;
        
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado: 'cancelado' })
                .eq('id', pedidoId);
            
            if (error) throw error;
            
            UTILS.mostrarNotificacion('Éxito', 'Pedido cancelado', 'success');
            app.cerrarModal();
            await this.cargarPedidos();
            
        } catch (error) {
            console.error('Error cancelando pedido:', error);
            UTILS.mostrarNotificacion('Error', 'No se pudo cancelar el pedido', 'error');
        }
    }
    
    // ============================================
    // UTILIDADES
    // ============================================
    
    traducirEstado(estado) {
        const traducciones = {
            'pendiente': 'Pendiente',
            'asignado': 'Asignado',
            'en_camino': 'En Camino',
            'completado': 'Completado',
            'cancelado': 'Cancelado'
        };
        return traducciones[estado] || estado;
    }
    
    truncarTexto(texto, maxLength) {
        if (!texto) return 'N/A';
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    }
}

// Inicializar
window.pedidosManager = new PedidosManager();
