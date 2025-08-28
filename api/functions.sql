-- =====================================================
-- FUNCIONES RPC PARA SUPABASE
-- =====================================================
-- Funciones necesarias para el funcionamiento de la aplicación

-- =====================================================
-- FUNCIÓN RPC: get_available_slots
-- =====================================================
-- Obtiene los slots de tiempo disponibles para una fecha específica
-- Considera reservas existentes y horarios de trabajo

CREATE OR REPLACE FUNCTION get_available_slots(
    p_date DATE,
    p_specialist_id UUID DEFAULT NULL,
    p_duration INTEGER DEFAULT 60
)
RETURNS TABLE (
    slot_time TIME,
    available_specialists UUID[]
) 
LANGUAGE plpgsql
AS $$
DECLARE
    work_start TIME := '09:00';
    work_end TIME := '18:00';
    slot_interval INTEGER := 30; -- minutos entre slots
    current_time TIME;
    current_specialists UUID[];
BEGIN
    -- Generar slots de tiempo desde work_start hasta work_end
    current_time := work_start;
    
    WHILE current_time < work_end LOOP
        -- Obtener especialistas disponibles para este slot
        SELECT ARRAY_AGG(s.id)
        INTO current_specialists
        FROM specialists s
        WHERE s.is_active = true
        AND (p_specialist_id IS NULL OR s.id = p_specialist_id)
        AND NOT EXISTS (
            -- Verificar que no tenga una reserva en este horario
            SELECT 1 
            FROM bookings_new b
            WHERE b.specialist_id = s.id
            AND b.scheduled_date = p_date
            AND b.scheduled_time <= current_time
            AND (b.scheduled_time + INTERVAL '1 minute' * b.estimated_duration) > current_time
            AND b.status IN ('confirmed', 'in_progress')
        );
        
        -- Solo retornar el slot si hay especialistas disponibles
        IF current_specialists IS NOT NULL AND array_length(current_specialists, 1) > 0 THEN
            slot_time := current_time;
            available_specialists := current_specialists;
            RETURN NEXT;
        END IF;
        
        -- Avanzar al siguiente slot
        current_time := current_time + INTERVAL '1 minute' * slot_interval;
    END LOOP;
    
    RETURN;
END;
$$;

-- =====================================================
-- FUNCIÓN RPC: update_client_metrics  
-- =====================================================
-- Actualiza las métricas de un cliente basado en sus reservas

CREATE OR REPLACE FUNCTION update_client_metrics(p_client_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    total_bookings INTEGER;
    total_spent DECIMAL(10,2);
    avg_rating DECIMAL(3,2);
    last_visit DATE;
BEGIN
    -- Calcular métricas del cliente
    SELECT 
        COUNT(*),
        COALESCE(SUM(total), 0),
        COALESCE(AVG(rating), 0),
        MAX(scheduled_date)
    INTO total_bookings, total_spent, avg_rating, last_visit
    FROM bookings_new 
    WHERE client_id = p_client_id 
    AND status = 'completed';
    
    -- Actualizar el cliente con las nuevas métricas
    UPDATE clients_new 
    SET 
        total_bookings = COALESCE(total_bookings, 0),
        total_spent = COALESCE(total_spent, 0),
        avg_rating = COALESCE(avg_rating, 0),
        last_visit = last_visit,
        updated_at = NOW()
    WHERE id = p_client_id;
END;
$$;

-- =====================================================
-- FUNCIÓN RPC: get_booking_analytics
-- =====================================================
-- Obtiene análiticas de reservas para el dashboard

CREATE OR REPLACE FUNCTION get_booking_analytics(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    date DATE,
    total_bookings INTEGER,
    completed_bookings INTEGER,
    cancelled_bookings INTEGER,
    total_revenue DECIMAL(10,2),
    avg_service_duration INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si no se proporcionan fechas, usar el último mes
    IF p_start_date IS NULL THEN
        p_start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE;
    END IF;
    
    RETURN QUERY
    SELECT 
        b.scheduled_date as date,
        COUNT(*)::INTEGER as total_bookings,
        COUNT(CASE WHEN b.status = 'completed' THEN 1 END)::INTEGER as completed_bookings,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END)::INTEGER as cancelled_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(b.estimated_duration)::INTEGER, 0) as avg_service_duration
    FROM bookings_new b
    WHERE b.scheduled_date BETWEEN p_start_date AND p_end_date
    GROUP BY b.scheduled_date
    ORDER BY b.scheduled_date DESC;
END;
$$;
