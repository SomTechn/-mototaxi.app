-- ============================================
-- SISTEMA DE MOTOTAXIS - SCHEMA SUPABASE
-- ============================================

-- Tabla de Conductores
CREATE TABLE conductores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    placa VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'disponible', -- disponible, ocupado, inactivo
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    ultima_actualizacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Pedidos/Carreras
CREATE TABLE pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE,
    cliente_id UUID REFERENCES clientes(id),
    conductor_id UUID REFERENCES conductores(id),
    
    -- Origen
    origen_direccion TEXT,
    origen_lat DECIMAL(10, 8),
    origen_lng DECIMAL(11, 8),
    
    -- Destino
    destino_direccion TEXT,
    destino_lat DECIMAL(10, 8),
    destino_lng DECIMAL(11, 8),
    
    -- Información del viaje
    distancia_km DECIMAL(10, 2),
    tiempo_estimado_min INTEGER,
    precio DECIMAL(10, 2),
    
    -- Estado del pedido
    estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, asignado, en_camino, completado, cancelado
    
    -- Fechas
    fecha_pedido TIMESTAMP DEFAULT NOW(),
    fecha_asignacion TIMESTAMP,
    fecha_inicio TIMESTAMP,
    fecha_completado TIMESTAMP,
    
    -- Notas
    notas TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Ubicaciones en Tiempo Real (para tracking)
CREATE TABLE ubicaciones_tiempo_real (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conductor_id UUID REFERENCES conductores(id),
    pedido_id UUID REFERENCES pedidos(id),
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    velocidad DECIMAL(5, 2), -- km/h
    rumbo DECIMAL(5, 2), -- 0-360 grados
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabla de Ciudades/Zonas
CREATE TABLE ciudades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    radio_km DECIMAL(10, 2) DEFAULT 10,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar ciudades base de Honduras
INSERT INTO ciudades (nombre, latitud, longitud, radio_km) VALUES
('Tegucigalpa', 14.0723, -87.1921, 15),
('San Pedro Sula', 15.5048, -88.0250, 12),
('Choloma', 15.6100, -87.9500, 10);

-- Tabla de Configuración del Sistema
CREATE TABLE configuracion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('precio_base_km', '15', 'Precio base por kilómetro en Lempiras'),
('precio_minimo', '30', 'Precio mínimo de carrera en Lempiras'),
('multiplicador_trafico', '1.3', 'Multiplicador de tiempo por tráfico'),
('radio_busqueda_conductores', '5', 'Radio en km para buscar conductores disponibles');

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX idx_conductores_estado ON conductores(estado);
CREATE INDEX idx_conductores_ubicacion ON conductores(latitud, longitud);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_conductor ON pedidos(conductor_id);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_ubicaciones_conductor ON ubicaciones_tiempo_real(conductor_id);
CREATE INDEX idx_ubicaciones_pedido ON ubicaciones_tiempo_real(pedido_id);
CREATE INDEX idx_ubicaciones_timestamp ON ubicaciones_tiempo_real(timestamp);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para pedidos
CREATE TRIGGER update_pedidos_updated_at 
    BEFORE UPDATE ON pedidos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de pedido automático
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_pedido IS NULL THEN
        NEW.numero_pedido := 'PED-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('pedidos_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Secuencia para números de pedido
CREATE SEQUENCE IF NOT EXISTS pedidos_seq START 1;

-- Trigger para generar número de pedido
CREATE TRIGGER trigger_generar_numero_pedido
    BEFORE INSERT ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION generar_numero_pedido();

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones_tiempo_real ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciudades ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo por ahora - ajustar según necesites autenticación)
CREATE POLICY "Permitir todo en conductores" ON conductores FOR ALL USING (true);
CREATE POLICY "Permitir todo en clientes" ON clientes FOR ALL USING (true);
CREATE POLICY "Permitir todo en pedidos" ON pedidos FOR ALL USING (true);
CREATE POLICY "Permitir todo en ubicaciones" ON ubicaciones_tiempo_real FOR ALL USING (true);
CREATE POLICY "Permitir lectura en ciudades" ON ciudades FOR SELECT USING (true);
CREATE POLICY "Permitir lectura en configuracion" ON configuracion FOR SELECT USING (true);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de pedidos con información completa
CREATE OR REPLACE VIEW vista_pedidos_completa AS
SELECT 
    p.*,
    c.nombre as nombre_cliente,
    c.telefono as telefono_cliente,
    cond.nombre as nombre_conductor,
    cond.telefono as telefono_conductor,
    cond.placa as placa_conductor
FROM pedidos p
LEFT JOIN clientes c ON p.cliente_id = c.id
LEFT JOIN conductores cond ON p.conductor_id = cond.id;

-- Vista de conductores disponibles con última ubicación
CREATE OR REPLACE VIEW vista_conductores_disponibles AS
SELECT 
    c.*,
    (SELECT COUNT(*) FROM pedidos WHERE conductor_id = c.id AND estado IN ('asignado', 'en_camino')) as carreras_activas
FROM conductores c
WHERE c.estado = 'disponible';
