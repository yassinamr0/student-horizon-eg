
-- Allow any authenticated user to create organizations (owner tracked)
CREATE POLICY "Authenticated can create organizations"
ON public.organizations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Owners can update/delete their own organizations
CREATE POLICY "Owners can update own organizations"
ON public.organizations FOR UPDATE TO authenticated
USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Allow authenticated users to submit opportunities as pending
CREATE POLICY "Authenticated can submit pending opportunities"
ON public.opportunities FOR INSERT TO authenticated
WITH CHECK (approval_status = 'pending');
