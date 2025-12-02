# Fixa säkerhet i cron job för email-påminnelser

Cron jobbet för email-påminnelser använder en hårdkodad service role key i SQL-koden, vilket inte är säkert.

## Problem

Cron jobbet skapades med en hårdkodad service role key i Authorization header:
```sql
headers := '{"Content-Type": "application/json", "Authorization": "Bearer [HÅRDKODAD_KEY]"}'
```

Detta är inte säkert eftersom:
- Service role key exponeras i SQL-koden
- Om någon får tillgång till SQL-koden, kan de använda service role key
- Service role key ger full åtkomst till databasen

## Lösning

### Alternativ 1: Använd Supabase Dashboard för cron jobs (REKOMMENDERAT)

1. Gå till **Supabase Dashboard → Database → Cron Jobs**
2. Ta bort det gamla cron jobbet (om det finns)
3. Skapa nytt cron job via Dashboard:
   - **Name:** `send-reminder-emails-daily`
   - **Schedule:** `0 8 * * *` (kl 08:00 UTC = 09:00 svensk tid)
   - **Function:** `send-reminder-emails`
   - Dashboard hanterar autentisering automatiskt

### Alternativ 2: Uppdatera SQL för att använda secrets

Om du måste använda SQL, uppdatera cron jobbet så att det använder service role key från Supabase secrets:

```sql
-- Ta bort det gamla cron jobbet först
SELECT cron.unschedule('send-reminder-emails-daily');

-- Skapa nytt cron job
-- OBS: Detta kräver att service role key finns som secret
SELECT cron.schedule(
  'send-reminder-emails-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/send-reminder-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

**OBS:** Detta kräver att service role key läggs till som setting i Supabase, vilket inte är standard.

### Alternativ 3: Använd Edge Function's inbyggda autentisering

Edge Function kan konfigureras att acceptera anrop från cron jobs utan explicit Authorization header om den är konfigurerad korrekt.

## Rekommendation

**Använd Alternativ 1 (Supabase Dashboard)** - Det är:
- ✅ Säkrast
- ✅ Enklast
- ✅ Hanterar autentisering automatiskt
- ✅ Inga hårdkodade nycklar

## Steg-för-steg (Alternativ 1)

1. Gå till **Supabase Dashboard → Database → Cron Jobs**
2. Hitta `send-reminder-emails-daily` cron jobbet
3. Ta bort det gamla cron jobbet
4. Skapa nytt cron job:
   - Klicka på "New Cron Job"
   - **Name:** `send-reminder-emails-daily`
   - **Schedule:** `0 8 * * *`
   - **Function:** Välj `send-reminder-emails` från dropdown
   - **Method:** `POST`
   - **Body:** `{}`
5. Spara cron jobbet
6. Verifiera att det fungerar genom att kolla logs efter första körningen

## Verifiering

Efter att ha fixat cron jobbet:

1. Vänta tills cron jobbet körs (kl 08:00 UTC) eller kör det manuellt
2. Kolla logs i Supabase Dashboard → Database → Cron Jobs → Logs
3. Verifiera att Edge Function anropades utan fel
4. Kolla `notification_logs` tabellen för att se att email skickades

## Ytterligare information

- **Cron job schema:** `'0 8 * * *'` = Kl 08:00 UTC varje dag (09:00 svensk tid)
- **Edge Function URL:** `https://[YOUR_PROJECT_REF].supabase.co/functions/v1/send-reminder-emails`
- **Supabase Cron Jobs docs:** https://supabase.com/docs/guides/database/extensions/pg_cron

