# Backend-ändringar för Profil-funktionalitet

Jag behöver lägga till stöd för profilbilder och ytterligare profilfält i Supabase. Här är vad som behövs:

## 1. Lägg till kolumner i `profiles`-tabellen

Lägg till dessa kolumner i `public.profiles`-tabellen:

```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;
```

## 2. Skapa Supabase Storage bucket för profilbilder

Skapa en storage bucket som heter `avatars`:

```sql
-- Skapa bucket (körs i Supabase Dashboard -> Storage -> Create bucket)
-- Bucket name: avatars
-- Public bucket: Yes (eller konfigurera policies nedan)
```

## 3. Storage Policies för avatars-bucketen

Sätt upp RLS policies så att användare kan ladda upp och se sina egna profilbilder:

```sql
-- Policy för att användare kan ladda upp sina egna profilbilder
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy för att användare kan uppdatera sina egna profilbilder
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy för att användare kan se sina egna profilbilder
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy för att användare kan ta bort sina egna profilbilder
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy för att alla kan se profilbilder (om du vill ha publika profilbilder)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

## 4. Alternativ: Enklare policy (om du vill ha publika profilbilder)

Om du vill att alla profilbilder ska vara publika, kan du använda denna enklare policy istället:

```sql
-- Ta bort alla ovanstående policies och använd denna:
CREATE POLICY "Public avatar access"
ON storage.objects
FOR ALL
USING (bucket_id = 'avatars');
```

## Sammanfattning

1. ✅ Lägg till `avatar_url`, `phone`, och `address` kolumner i `profiles`-tabellen
2. ✅ Skapa storage bucket `avatars` i Supabase
3. ✅ Sätt upp storage policies för att användare ska kunna ladda upp/uppdatera sina profilbilder

Efter detta kommer profilbilderna att sparas korrekt i Supabase Storage och synkas mellan enheter!

