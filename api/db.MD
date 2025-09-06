-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.barberos (
comision_base numeric DEFAULT 0,
id_barbero uuid NOT NULL,
especialidades ARRAY,
biografia text,
horario_inicio time without time zone DEFAULT '09:00:00'::time without time zone,
horario_fin time without time zone DEFAULT '18:00:00'::time without time zone,
dias_trabajo ARRAY DEFAULT ARRAY['lunes'::text, 'martes'::text, 'miercoles'::text, 'jueves'::text, 'viernes'::text, 'sabado'::text],
tiempo_descanso integer DEFAULT 10,
activo boolean DEFAULT true,
calificacion_promedio numeric DEFAULT 0,
total_cortes integer DEFAULT 0,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT barberos_pkey PRIMARY KEY (id_barbero),
CONSTRAINT barberos_id_barbero_fkey FOREIGN KEY (id_barbero) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.bloqueos_horarios (
id_barbero uuid,
fecha_inicio date NOT NULL,
fecha_fin date NOT NULL,
hora_inicio time without time zone,
hora_fin time without time zone,
tipo text NOT NULL CHECK (tipo = ANY (ARRAY['vacaciones'::text, 'bloqueo'::text, 'mantenimiento'::text, 'capacitacion'::text, 'otro'::text])),
motivo text,
id_bloqueo uuid NOT NULL DEFAULT uuid_generate_v4(),
metadata jsonb DEFAULT '{}'::jsonb,
creado_at timestamp with time zone DEFAULT now(),
CONSTRAINT bloqueos_horarios_pkey PRIMARY KEY (id_bloqueo),
CONSTRAINT bloqueos_horarios_id_barbero_fkey FOREIGN KEY (id_barbero) REFERENCES public.barberos(id_barbero)
);
CREATE TABLE public.disponibilidad (
id_barbero uuid NOT NULL,
fecha_inicio timestamp with time zone NOT NULL,
fecha_fin timestamp with time zone NOT NULL,
tipo text NOT NULL CHECK (tipo = ANY (ARRAY['trabajo'::text, 'descanso'::text, 'vacaciones'::text, 'bloqueado'::text])),
descripcion text,
id_disponibilidad uuid NOT NULL DEFAULT uuid_generate_v4(),
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT disponibilidad_pkey PRIMARY KEY (id_disponibilidad),
CONSTRAINT disponibilidad_id_barbero_fkey FOREIGN KEY (id_barbero) REFERENCES public.barberos(id_barbero)
);
CREATE TABLE public.event_log (
actor text,
entidad text NOT NULL,
accion text NOT NULL,
id_evento bigint NOT NULL DEFAULT nextval('event_log_id_evento_seq'::regclass),
metadata jsonb DEFAULT '{}'::jsonb,
creado_at timestamp with time zone DEFAULT now(),
CONSTRAINT event_log_pkey PRIMARY KEY (id_evento)
);
CREATE TABLE public.notifications (
canal text NOT NULL,
destinatario text NOT NULL,
template text NOT NULL,
ultimo_intento timestamp with time zone,
id_notificacion bigint NOT NULL DEFAULT nextval('notifications_id_notificacion_seq'::regclass),
payload jsonb DEFAULT '{}'::jsonb,
estado text NOT NULL DEFAULT 'pendiente'::text,
intentos integer DEFAULT 0,
creado_at timestamp with time zone DEFAULT now(),
CONSTRAINT notifications_pkey PRIMARY KEY (id_notificacion)
);
CREATE TABLE public.reservas (
deleted_at timestamp with time zone,
id_cliente uuid NOT NULL,
id_barbero uuid NOT NULL,
id_servicio uuid NOT NULL,
fecha_reserva date NOT NULL,
hora_inicio time without time zone NOT NULL,
hora_fin time without time zone NOT NULL,
duracion_minutos integer NOT NULL,
precio_total integer NOT NULL CHECK (precio_total >= 0),
notas_cliente text,
notas_internas text,
motivo_cancelacion text,
confirmada_at timestamp with time zone,
completada_at timestamp with time zone,
cancelada_at timestamp with time zone,
id_reserva uuid NOT NULL DEFAULT uuid_generate_v4(),
estado text DEFAULT 'confirmada'::text CHECK (estado = ANY (ARRAY['pendiente'::text, 'confirmada'::text, 'en_progreso'::text, 'completada'::text, 'cancelada'::text, 'no_show'::text])),
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT reservas_pkey PRIMARY KEY (id_reserva),
CONSTRAINT reservas_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario),
CONSTRAINT reservas_id_servicio_fkey FOREIGN KEY (id_servicio) REFERENCES public.servicios(id_servicio),
CONSTRAINT reservas_id_barbero_fkey FOREIGN KEY (id_barbero) REFERENCES public.barberos(id_barbero)
);
CREATE TABLE public.servicios (
nombre text NOT NULL,
descripcion text,
precio integer NOT NULL CHECK (precio >= 0),
duracion integer NOT NULL CHECK (duracion > 0),
categoria text,
id_servicio uuid NOT NULL DEFAULT uuid_generate_v4(),
activo boolean DEFAULT true,
color text DEFAULT '#3B82F6'::text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT servicios_pkey PRIMARY KEY (id_servicio)
);
CREATE TABLE public.usuarios (
nombre text NOT NULL,
email text NOT NULL UNIQUE,
telefono text,
rol text NOT NULL CHECK (rol = ANY (ARRAY['cliente'::text, 'barbero'::text, 'admin'::text])),
avatar_url text,
id_usuario uuid NOT NULL DEFAULT uuid_generate_v4(),
fecha_registro timestamp with time zone DEFAULT now(),
activo boolean DEFAULT true,
configuracion jsonb DEFAULT '{}'::jsonb,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.waitlist (
id_cliente uuid NOT NULL,
id_servicio uuid,
id_barbero uuid,
fecha_deseada date,
duracion_minutos integer,
asignada_at timestamp with time zone,
id_waitlist bigint NOT NULL DEFAULT nextval('waitlist_id_waitlist_seq'::regclass),
prioridad integer DEFAULT 0,
estado text NOT NULL DEFAULT 'activa'::text,
creado_at timestamp with time zone DEFAULT now(),
CONSTRAINT waitlist_pkey PRIMARY KEY (id_waitlist),
CONSTRAINT waitlist_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario),
CONSTRAINT waitlist_id_barbero_fkey FOREIGN KEY (id_barbero) REFERENCES public.barberos(id_barbero),
CONSTRAINT waitlist_id_servicio_fkey FOREIGN KEY (id_servicio) REFERENCES public.servicios(id_servicio)
);
