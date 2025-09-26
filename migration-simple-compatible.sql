-- ===================================================
-- MIGRACIÓN SIMPLIFICADA PARA ESTRUCTURA EXISTENTE
-- (Compatible con tu tabla bookings actual)
-- ===================================================

-- 1. Agregar campos a services para servicios destacados
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS bookings_count INTEGER DEFAULT 0;

-- 2. Agregar campos faltantes a bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_text TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 3. Agregar índice en contact_email de tenants para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tenants_contact_email ON tenants(contact_email) WHERE contact_email IS NOT NULL;

-- 4. Crear índices adicionales para optimizar queries
CREATE INDEX IF NOT EXISTS idx_services_tenant_featured ON services(tenant_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_services_tenant_active ON services(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_rating ON bookings(rating) WHERE rating IS NOT NULL;

-- 5. Función para actualizar estadísticas de servicios
CREATE OR REPLACE FUNCTION update_service_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar bookings_count y average_rating para el servicio
    UPDATE services 
    SET 
        bookings_count = (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
            AND status NOT IN ('cancelled', 'no_show')
        ),
        average_rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0.0)
            FROM bookings 
            WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
            AND rating IS NOT NULL
            AND status = 'completed'
        )
    WHERE id = COALESCE(NEW.service_id, OLD.service_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar stats de servicios
DROP TRIGGER IF EXISTS trigger_update_service_stats ON bookings;
CREATE TRIGGER trigger_update_service_stats
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_service_stats();

-- 6. Recalcular estadísticas para servicios existentes (si los hay)
-- Esto actualizará automáticamente los contadores basado en reservas reales existentes
DO $$
DECLARE
    service_record RECORD;
BEGIN
    FOR service_record IN SELECT id FROM services LOOP
        UPDATE services 
        SET 
            bookings_count = (
                SELECT COUNT(*) 
                FROM bookings 
                WHERE service_id = service_record.id 
                AND status NOT IN ('cancelled', 'no_show')
            ),
            average_rating = (
                SELECT COALESCE(AVG(rating::DECIMAL), 0.0)
                FROM bookings 
                WHERE service_id = service_record.id 
                AND rating IS NOT NULL
                AND status = 'completed'
            )
        WHERE id = service_record.id;
    END LOOP;
END
$$;

-- ✅ Listo! Ahora tienes:
-- - Campos is_featured, bookings_count, average_rating en services
-- - Campos rating, review_text, notes en bookings  
-- - Triggers automáticos para actualizar estadísticas
-- - Índices optimizados para consultas
-- - Sin datos mock - listos para poblar desde la app