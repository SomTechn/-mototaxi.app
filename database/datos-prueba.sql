-- ============================================
-- DATOS DE PRUEBA PARA EL SISTEMA DE MOTOTAXIS
-- ============================================

-- Este archivo contiene datos de ejemplo para probar el sistema
-- Ejecuta estos comandos en el SQL Editor de Supabase después de crear las tablas

-- ============================================
-- CONDUCTORES DE PRUEBA
-- ============================================

INSERT INTO conductores (nombre, telefono, placa, estado, latitud, longitud) VALUES
-- Tegucigalpa
('Carlos Martínez', '9999-1111', 'ABC-001', 'disponible', 14.0850, -87.2063),
('Luis Hernández', '9999-2222', 'DEF-002', 'disponible', 14.0680, -87.1900),
('José García', '9999-3333', 'GHI-003', 'ocupado', 14.0920, -87.2100),
('Miguel Flores', '9999-4444', 'JKL-004', 'disponible', 14.0600, -87.2000),
('Pedro López', '9999-5555', 'MNO-005', 'inactivo', 14.0800, -87.1850),

-- San Pedro Sula
('Roberto Gómez', '9999-6666', 'PQR-006', 'disponible', 15.5100, -88.0300),
('Alberto Sánchez', '9999-7777', 'STU-007', 'disponible', 15.5000, -88.0200),
('Javier Ramírez', '9999-8888', 'VWX-008', 'ocupado', 15.5150, -88.0350),

-- Choloma
('Fernando Cruz', '9999-9999', 'YZA-009', 'disponible', 15.6050, -87.9450),
('Ricardo Morales', '9999-0000', 'BCD-010', 'disponible', 15.6100, -87.9500);

-- ============================================
-- CLIENTES DE PRUEBA
-- ============================================

INSERT INTO clientes (nombre, telefono, direccion) VALUES
('Ana Rodríguez', '8888-1111', 'Col. Palmira, Tegucigalpa'),
('María González', '8888-2222', 'Col. Kennedy, Tegucigalpa'),
('Carmen Díaz', '8888-3333', 'Barrio La Granja, SPS'),
('Laura Martínez', '8888-4444', 'Col. Alameda, Tegucigalpa'),
('Sofia Hernández', '8888-5555', 'Col. Torocagua, Tegucigalpa'),
('Isabel López', '8888-6666', 'Barrio El Centro, SPS'),
('Patricia García', '8888-7777', 'Col. Las Minitas, Tegucigalpa'),
('Valentina Ruiz', '8888-8888', 'Col. San Rafael, Choloma');

-- ============================================
-- PEDIDOS DE PRUEBA
-- ============================================

-- Pedido 1: Pendiente en Tegucigalpa
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
    estado,
    notas
) VALUES (
    (SELECT id FROM clientes WHERE nombre = 'Ana Rodríguez'),
    'Centro Comercial Multiplaza',
    14.0723,
    -87.1921,
    'Aeropuerto Internacional Toncontín',
    14.0608,
    -87.2172,
    5.2,
    20,
    78.00,
    'pendiente',
    'Cliente con equipaje'
);

-- Pedido 2: Asignado en Tegucigalpa
INSERT INTO pedidos (
    cliente_id,
    conductor_id,
    origen_direccion,
    origen_lat,
    origen_lng,
    destino_direccion,
    destino_lat,
    destino_lng,
    distancia_km,
    tiempo_estimado_min,
    precio,
    estado,
    fecha_asignacion
) VALUES (
    (SELECT id FROM clientes WHERE nombre = 'María González'),
    (SELECT id FROM conductores WHERE nombre = 'José García'),
    'Hospital San Felipe',
    14.0950,
    -87.2050,
    'Universidad Nacional Autónoma de Honduras',
    14.0850,
    -87.1650,
    4.8,
    18,
    72.00,
    'asignado',
    NOW()
);

-- Pedido 3: En camino en San Pedro Sula
INSERT INTO pedidos (
    cliente_id,
    conductor_id,
    origen_direccion,
    origen_lat,
    origen_lng,
    destino_direccion,
    destino_lat,
    destino_lng,
    distancia_km,
    tiempo_estimado_min,
    precio,
    estado,
    fecha_asignacion,
    fecha_inicio
) VALUES (
    (SELECT id FROM clientes WHERE nombre = 'Carmen Díaz'),
    (SELECT id FROM conductores WHERE nombre = 'Javier Ramírez'),
    'Mercado Guamilito',
    15.5048,
    -88.0250,
    'Mall Multiplaza',
    15.5100,
    -88.0350,
    2.5,
    12,
    50.00,
    'en_camino',
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '5 minutes'
);

-- Pedido 4: Completado en Tegucigalpa (hoy)
INSERT INTO pedidos (
    cliente_id,
    conductor_id,
    origen_direccion,
    origen_lat,
    origen_lng,
    destino_direccion,
    destino_lat,
    destino_lng,
    distancia_km,
    tiempo_estimado_min,
    precio,
    estado,
    fecha_pedido,
    fecha_asignacion,
    fecha_inicio,
    fecha_completado
) VALUES (
    (SELECT id FROM clientes WHERE nombre = 'Laura Martínez'),
    (SELECT id FROM conductores WHERE nombre = 'Carlos Martínez'),
    'Estadio Nacional',
    14.0890,
    -87.1950,
    'Catedral Metropolitana',
    14.1050,
    -87.2050,
    3.2,
    15,
    58.00,
    'completado',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 50 minutes',
    NOW() - INTERVAL '1 hour 45 minutes',
    NOW() - INTERVAL '1 hour 30 minutes'
);

-- Pedido 5: Completado en Tegucigalpa (ayer)
INSERT INTO pedidos (
    cliente_id,
    conductor_id,
    origen_direccion,
    origen_lat,
    origen_lng,
    destino_direccion,
    destino_lat,
    destino_lng,
    distancia_km,
    tiempo_estimado_min,
    precio,
    estado,
    fecha_pedido,
    fecha_asignacion,
    fecha_inicio,
    fecha_completado
) VALUES (
    (SELECT id FROM clientes WHERE nombre = 'Sofia Hernández'),
    (SELECT id FROM conductores WHERE nombre = 'Luis Hernández'),
    'Terminal de Buses Comayagüela',
    14.0850,
    -87.2150,
    'Boulevard Morazán',
    14.0950,
    -87.1850,
    4.0,
    16,
    65.00,
    'completado',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '5 minutes',
    NOW() - INTERVAL '1 day' + INTERVAL '10 minutes',
    NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'
);

-- Pedido 6: Cancelado
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
    estado,
    notas
) VALUES (
    (SELECT id FROM clientes WHERE nombre = 'Patricia García'),
    'Parque La Leona',
    14.1000,
    -87.1900,
    'Zona Viva',
    14.0850,
    -87.1750,
    3.8,
    15,
    62.00,
    'cancelado',
    'Cliente no respondió'
);

-- ============================================
-- UBICACIONES EN TIEMPO REAL
-- ============================================

-- Insertar algunas ubicaciones de ejemplo para el conductor en camino
INSERT INTO ubicaciones_tiempo_real (conductor_id, pedido_id, latitud, longitud, velocidad, timestamp) VALUES
(
    (SELECT id FROM conductores WHERE nombre = 'Javier Ramírez'),
    (SELECT id FROM pedidos WHERE estado = 'en_camino' LIMIT 1),
    15.5060,
    -88.0270,
    25.5,
    NOW() - INTERVAL '3 minutes'
),
(
    (SELECT id FROM conductores WHERE nombre = 'Javier Ramírez'),
    (SELECT id FROM pedidos WHERE estado = 'en_camino' LIMIT 1),
    15.5075,
    -88.0290,
    28.0,
    NOW() - INTERVAL '2 minutes'
),
(
    (SELECT id FROM conductores WHERE nombre = 'Javier Ramírez'),
    (SELECT id FROM pedidos WHERE estado = 'en_camino' LIMIT 1),
    15.5090,
    -88.0310,
    30.0,
    NOW() - INTERVAL '1 minute'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar cuántos registros se crearon
SELECT 'Conductores' as tabla, COUNT(*) as total FROM conductores
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'Ubicaciones', COUNT(*) FROM ubicaciones_tiempo_real
UNION ALL
SELECT 'Ciudades', COUNT(*) FROM ciudades
UNION ALL
SELECT 'Configuración', COUNT(*) FROM configuracion;

-- Ver resumen de pedidos por estado
SELECT estado, COUNT(*) as cantidad
FROM pedidos
GROUP BY estado
ORDER BY estado;

-- Ver conductores por estado
SELECT estado, COUNT(*) as cantidad
FROM conductores
GROUP BY estado
ORDER BY estado;
