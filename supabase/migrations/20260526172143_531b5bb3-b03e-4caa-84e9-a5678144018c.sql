
-- 1. Fix persona SELECT: remove permissive "auth busca persona por dni"
DROP POLICY IF EXISTS "auth busca persona por dni" ON public.persona;

-- 2. Restrict persona INSERT to admin or operators with an assigned dispositivo
DROP POLICY IF EXISTS "auth inserta persona" ON public.persona;
CREATE POLICY "admin u operador inserta persona" ON public.persona
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.user_dispositivo_id(auth.uid()) IS NOT NULL
  );

-- 3. Lock down historial_cambio insert (trigger uses SECURITY DEFINER and bypasses RLS)
DROP POLICY IF EXISTS "historial insert" ON public.historial_cambio;
CREATE POLICY "historial insert deny" ON public.historial_cambio
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- 4. Safe RPC for DNI lookup (returns only minimal info)
CREATE OR REPLACE FUNCTION public.buscar_persona_por_dni(_dni text)
RETURNS TABLE (dni text, nombre_completo text, existe boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.dni, p.nombre_completo, true
  FROM public.persona p
  WHERE p.dni = _dni
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.buscar_persona_por_dni(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buscar_persona_por_dni(text) TO authenticated;

-- 5. Fix mutable search_path on tg_set_updated_at
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 6. Revoke EXECUTE on internal trigger/setup SECURITY DEFINER functions from public/anon/authenticated
REVOKE ALL ON FUNCTION public.log_historial() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.on_first_user_make_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;

-- Keep RLS-helper functions executable by authenticated (needed in policies),
-- but revoke from anon since the app requires login.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.user_dispositivo_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_dispositivo_id(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.can_access_vinculo(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_vinculo(uuid) TO authenticated;
