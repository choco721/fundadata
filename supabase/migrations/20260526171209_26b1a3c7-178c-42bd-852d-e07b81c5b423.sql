
-- =============== ENUMS ===============
CREATE TYPE public.app_role AS ENUM ('admin', 'operador');
CREATE TYPE public.dispositivo_tipo AS ENUM ('ninez', 'dia');
CREATE TYPE public.vinculo_estado AS ENUM ('activo', 'egresado', 'inasistencia_prolongada');
CREATE TYPE public.sexo_tipo AS ENUM ('F', 'M', 'X');

-- =============== DISPOSITIVO ===============
CREATE TABLE public.dispositivo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  tipo public.dispositivo_tipo NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dispositivo TO authenticated;
GRANT ALL ON public.dispositivo TO service_role;
ALTER TABLE public.dispositivo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth lee dispositivos" ON public.dispositivo FOR SELECT TO authenticated USING (true);

-- =============== USER ROLES ===============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user lee su rol" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin gestiona roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============== USER DISPOSITIVO (operador -> centro) ===============
CREATE TABLE public.user_dispositivo (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dispositivo_id uuid NOT NULL REFERENCES public.dispositivo(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_dispositivo TO authenticated;
GRANT ALL ON public.user_dispositivo TO service_role;
ALTER TABLE public.user_dispositivo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user lee su centro" ON public.user_dispositivo FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin asigna centros" ON public.user_dispositivo FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.user_dispositivo_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT dispositivo_id FROM public.user_dispositivo WHERE user_id = _user_id LIMIT 1
$$;

-- =============== PERSONA ===============
CREATE TABLE public.persona (
  dni text PRIMARY KEY,
  nombre text NOT NULL,
  apellido text NOT NULL,
  fecha_nacimiento date NOT NULL,
  sexo public.sexo_tipo NOT NULL,
  barrio text NOT NULL,
  nombre_completo text GENERATED ALWAYS AS (nombre || ' ' || apellido) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.persona TO authenticated;
GRANT ALL ON public.persona TO service_role;
ALTER TABLE public.persona ENABLE ROW LEVEL SECURITY;

-- =============== VINCULO ===============
CREATE TABLE public.vinculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dni text NOT NULL REFERENCES public.persona(dni) ON DELETE RESTRICT,
  dispositivo_id uuid NOT NULL REFERENCES public.dispositivo(id) ON DELETE RESTRICT,
  fecha_alta date NOT NULL DEFAULT CURRENT_DATE,
  fecha_baja date,
  estado public.vinculo_estado NOT NULL DEFAULT 'activo',
  motivo_egreso text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);
CREATE UNIQUE INDEX vinculo_activo_unico ON public.vinculo (dni, dispositivo_id) WHERE estado = 'activo';
CREATE INDEX vinculo_dispositivo_idx ON public.vinculo (dispositivo_id);
CREATE INDEX vinculo_estado_idx ON public.vinculo (estado);
GRANT SELECT, INSERT, UPDATE ON public.vinculo TO authenticated;
GRANT ALL ON public.vinculo TO service_role;
ALTER TABLE public.vinculo ENABLE ROW LEVEL SECURITY;

-- Persona policies (visible si tiene vínculo en el centro del operador, o admin)
CREATE POLICY "admin ve personas" ON public.persona FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "operador ve personas de su centro" ON public.persona FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vinculo v WHERE v.dni = persona.dni AND v.dispositivo_id = public.user_dispositivo_id(auth.uid()))
);
CREATE POLICY "auth busca persona por dni" ON public.persona FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth inserta persona" ON public.persona FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin u operador actualiza persona" ON public.persona FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.vinculo v WHERE v.dni = persona.dni AND v.dispositivo_id = public.user_dispositivo_id(auth.uid()))
);

-- Vinculo policies
CREATE POLICY "admin ve vinculos" ON public.vinculo FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "operador ve vinculos de su centro" ON public.vinculo FOR SELECT TO authenticated USING (dispositivo_id = public.user_dispositivo_id(auth.uid()));
CREATE POLICY "operador crea vinculo en su centro" ON public.vinculo FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR dispositivo_id = public.user_dispositivo_id(auth.uid())
);
CREATE POLICY "operador edita vinculo de su centro" ON public.vinculo FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR dispositivo_id = public.user_dispositivo_id(auth.uid())
);

-- =============== FICHAS ===============
CREATE TABLE public.ficha_ninez (
  vinculo_id uuid PRIMARY KEY REFERENCES public.vinculo(id) ON DELETE CASCADE,
  escolarizado boolean NOT NULL DEFAULT false,
  anio_escolar text,
  discapacidad boolean NOT NULL DEFAULT false,
  referenciado_salud boolean NOT NULL DEFAULT false,
  -- bloque condicional consumo
  consumo_activo boolean NOT NULL DEFAULT false,
  consumo_sustancias text,
  consumo_contexto text,
  -- bloque condicional violencia
  violencia_familiar boolean NOT NULL DEFAULT false,
  violencia_tipo text,
  violencia_observaciones text,
  observaciones text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
GRANT SELECT, INSERT, UPDATE ON public.ficha_ninez TO authenticated;
GRANT ALL ON public.ficha_ninez TO service_role;
ALTER TABLE public.ficha_ninez ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ficha_dia (
  vinculo_id uuid PRIMARY KEY REFERENCES public.vinculo(id) ON DELETE CASCADE,
  tiene_cud boolean NOT NULL DEFAULT false,
  limitacion_permanente boolean NOT NULL DEFAULT false,
  nivel_educativo text,
  situacion_habitacional text,
  consumo_activo boolean NOT NULL DEFAULT false,
  consumo_sustancias text,
  consumo_contexto text,
  violencia_familiar boolean NOT NULL DEFAULT false,
  violencia_tipo text,
  violencia_observaciones text,
  observaciones text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
GRANT SELECT, INSERT, UPDATE ON public.ficha_dia TO authenticated;
GRANT ALL ON public.ficha_dia TO service_role;
ALTER TABLE public.ficha_dia ENABLE ROW LEVEL SECURITY;

-- helper: vínculo accesible?
CREATE OR REPLACE FUNCTION public.can_access_vinculo(_vinculo_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.vinculo v WHERE v.id = _vinculo_id AND v.dispositivo_id = public.user_dispositivo_id(auth.uid())
  )
$$;

CREATE POLICY "ficha_ninez select" ON public.ficha_ninez FOR SELECT TO authenticated USING (public.can_access_vinculo(vinculo_id));
CREATE POLICY "ficha_ninez insert" ON public.ficha_ninez FOR INSERT TO authenticated WITH CHECK (public.can_access_vinculo(vinculo_id));
CREATE POLICY "ficha_ninez update" ON public.ficha_ninez FOR UPDATE TO authenticated USING (public.can_access_vinculo(vinculo_id));

CREATE POLICY "ficha_dia select" ON public.ficha_dia FOR SELECT TO authenticated USING (public.can_access_vinculo(vinculo_id));
CREATE POLICY "ficha_dia insert" ON public.ficha_dia FOR INSERT TO authenticated WITH CHECK (public.can_access_vinculo(vinculo_id));
CREATE POLICY "ficha_dia update" ON public.ficha_dia FOR UPDATE TO authenticated USING (public.can_access_vinculo(vinculo_id));

-- =============== HISTORIAL DE CAMBIOS ===============
CREATE TABLE public.historial_cambio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla text NOT NULL,
  registro_id text NOT NULL,
  vinculo_id uuid REFERENCES public.vinculo(id) ON DELETE CASCADE,
  operacion text NOT NULL,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX historial_vinculo_idx ON public.historial_cambio (vinculo_id, created_at DESC);
GRANT SELECT, INSERT ON public.historial_cambio TO authenticated;
GRANT ALL ON public.historial_cambio TO service_role;
ALTER TABLE public.historial_cambio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "historial admin" ON public.historial_cambio FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "historial operador" ON public.historial_cambio FOR SELECT TO authenticated USING (vinculo_id IS NOT NULL AND public.can_access_vinculo(vinculo_id));
CREATE POLICY "historial insert" ON public.historial_cambio FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger genérico
CREATE OR REPLACE FUNCTION public.log_historial()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  reg_id text;
BEGIN
  IF TG_TABLE_NAME = 'vinculo' THEN
    v_id := COALESCE(NEW.id, OLD.id);
    reg_id := v_id::text;
  ELSIF TG_TABLE_NAME IN ('ficha_ninez','ficha_dia') THEN
    v_id := COALESCE(NEW.vinculo_id, OLD.vinculo_id);
    reg_id := v_id::text;
  ELSE
    reg_id := COALESCE(NEW::text, OLD::text);
  END IF;

  INSERT INTO public.historial_cambio (tabla, registro_id, vinculo_id, operacion, datos_anteriores, datos_nuevos, user_id)
  VALUES (
    TG_TABLE_NAME,
    reg_id,
    v_id,
    TG_OP,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_hist_vinculo AFTER INSERT OR UPDATE ON public.vinculo FOR EACH ROW EXECUTE FUNCTION public.log_historial();
CREATE TRIGGER trg_hist_ficha_ninez AFTER INSERT OR UPDATE ON public.ficha_ninez FOR EACH ROW EXECUTE FUNCTION public.log_historial();
CREATE TRIGGER trg_hist_ficha_dia AFTER INSERT OR UPDATE ON public.ficha_dia FOR EACH ROW EXECUTE FUNCTION public.log_historial();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_persona_upd BEFORE UPDATE ON public.persona FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_vinculo_upd BEFORE UPDATE ON public.vinculo FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============== SEED 10 DISPOSITIVOS ===============
INSERT INTO public.dispositivo (nombre, tipo) VALUES
  ('Centro de Niñez N° 1', 'ninez'),
  ('Centro de Niñez N° 2', 'ninez'),
  ('Centro de Niñez N° 3', 'ninez'),
  ('Centro de Niñez N° 4', 'ninez'),
  ('Centro de Niñez N° 5', 'ninez'),
  ('Centro de Día N° 1', 'dia'),
  ('Centro de Día N° 2', 'dia'),
  ('Centro de Día N° 3', 'dia'),
  ('Centro de Día N° 4', 'dia'),
  ('Centro de Día N° 5', 'dia');

-- Auto-asignar rol al primer usuario que se registre (admin si no hay nadie aún)
CREATE OR REPLACE FUNCTION public.on_first_user_make_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_first_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.on_first_user_make_admin();
