# Edge Function och Cron Job för Email-påminnelser

Jag behöver hjälp med att slutföra email-påminnelser för Kundkollen. Database-strukturen är redan klar, men jag behöver Edge Function och Cron job.

## Vad som redan finns

✅ `notification_logs` tabell - för att spåra skickade notifikationer
✅ `get_reminders_to_notify()` funktion - hittar påminnelser som behöver notifieras
✅ `pg_cron` och `pg_net` extensions aktiverade

## Vad som behöver göras

### 1. Skapa Supabase Edge Function

Skapa en Edge Function (t.ex. `send-reminder-emails`) som:

1. **Hämtar påminnelser:**
   - Anropar `get_reminders_to_notify()` funktionen
   - Får lista med påminnelser som behöver notifieras

2. **Skickar email via Resend:**
   - Använd Resend API för att skicka email
   - API-nyckel: `[LÄGG TILL RESEND API-NYCKEL HÄR]`
   - **VIKTIGT:** Alla email måste ha:
     - **From Name:** `Kundkollen AB`
     - **From Email:** `onboarding@resend.dev` (eller egen domän om konfigurerad)

3. **Email-innehåll baserat på typ:**
   - **7_days:** "Påminnelse om 1 vecka: [Titel]"
   - **1_day:** "Påminnelse imorgon: [Titel]"
   - **today:** "Påminnelse idag: [Titel]"
   - **overdue:** "⚠️ Försenad påminnelse: [Titel]"

4. **Loggar i notification_logs:**
   - Efter att email skickats, lägg till rad i `notification_logs` tabell
   - Så att samma notifikation inte skickas flera gånger

### 2. Email-mallar

#### 7 dagar kvar
**Subject:** `Påminnelse om 1 vecka: [reminder_title]`

**Body:**
```
Hej!

Detta är en påminnelse om att du har en påminnelse som är 1 vecka bort:

Påminnelse: [reminder_title]
[reminder_description om den finns]
Kund: [customer_name om kopplad]
Datum: [due_date formaterat på svenska]

Logga in på Kundkollen för att se detaljer: [Länk till app]

Med vänliga hälsningar,
Kundkollen AB
```

#### 1 dag kvar
**Subject:** `Påminnelse imorgon: [reminder_title]`

**Body:**
```
Hej!

Detta är en påminnelse om att du har en påminnelse imorgon:

Påminnelse: [reminder_title]
[reminder_description om den finns]
Kund: [customer_name om kopplad]
Datum: [due_date formaterat på svenska]

Logga in på Kundkollen för att se detaljer: [Länk till app]

Med vänliga hälsningar,
Kundkollen AB
```

#### Idag
**Subject:** `Påminnelse idag: [reminder_title]`

**Body:**
```
Hej!

Detta är en påminnelse om att du har en påminnelse idag:

Påminnelse: [reminder_title]
[reminder_description om den finns]
Kund: [customer_name om kopplad]
Datum: [due_date formaterat på svenska]

Logga in på Kundkollen för att se detaljer: [Länk till app]

Med vänliga hälsningar,
Kundkollen AB
```

#### Försenad
**Subject:** `⚠️ Försenad påminnelse: [reminder_title]`

**Body:**
```
Hej!

Detta är en varning om att du har en försenad påminnelse:

Påminnelse: [reminder_title]
[reminder_description om den finns]
Kund: [customer_name om kopplad]
Datum: [due_date formaterat på svenska] (Försenad med [days_until] dagar)

Logga in på Kundkollen för att se detaljer: [Länk till app]

Med vänliga hälsningar,
Kundkollen AB
```

### 3. Skapa Cron Job

Skapa ett pg_cron job som:
- Kör Edge Function dagligen (rekommenderat: kl 08:00 svensk tid)
- Eller varje timme om du vill ha mer frekventa kontroller

**SQL för cron job:**
```sql
SELECT cron.schedule(
  'send-reminder-emails-daily',
  '0 8 * * *', -- Kl 08:00 varje dag (UTC, justera för svensk tid)
  $$
  SELECT net.http_post(
    url := '[SUPABASE_EDGE_FUNCTION_URL]/send-reminder-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_ROLE_KEY]"}',
    body := '{}'::jsonb
  );
  $$
);
```

**Alternativt:** Om du använder Supabase Dashboard för cron jobs, konfigurera det där istället.

## Viktiga punkter

1. **Email från "Kundkollen AB":**
   - **ALLA email måste komma från "Kundkollen AB" och INTE från "Lovable"**
   - Konfigurera Resend med: `from: "Kundkollen AB <onboarding@resend.dev>"`

2. **Inga dubbletter:**
   - Funktionen `get_reminders_to_notify()` undviker redan dubbletter
   - Men se till att logga i `notification_logs` efter varje skickat email

3. **Felhantering:**
   - Om email-sändning misslyckas, logga felet
   - Försök inte skicka samma email flera gånger om det misslyckas

4. **Svenska texter:**
   - Alla email ska vara på svenska
   - Formatera datum på svenska (t.ex. "15 januari 2025")

## Testning

Efter implementation, testa:
1. Skapa en påminnelse som är exakt 7 dagar bort
2. Skapa en påminnelse som är exakt 1 dag bort
3. Skapa en påminnelse som är idag
4. Skapa en försenad påminnelse
5. Verifiera att email kommer från "Kundkollen AB"
6. Kontrollera att samma notifikation inte skickas flera gånger

## Resend API Integration

**API-nyckel:** `[LÄGG TILL RESEND API-NYCKEL HÄR]`

**Exempel på Resend API-anrop:**
```javascript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Kundkollen AB <onboarding@resend.dev>',
    to: user_email,
    subject: emailSubject,
    html: emailBody,
  }),
});
```

## Ytterligare information

- **Resend Dashboard:** https://resend.com
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **pg_cron dokumentation:** https://github.com/citusdata/pg_cron

