# Email-påminnelser för Kundkollen

**VIKTIGT:** Alla email som skickas måste komma från "Kundkollen AB" och INTE från "Lovable". Se till att konfigurera SMTP Settings i Supabase Dashboard med "Kundkollen AB" som avsändarnamn.

Jag behöver hjälp med att implementera automatiska email-påminnelser för Kundkollen-användare (hantverkare) när deras påminnelser närmar sig.

## Funktionellitet

Skapa en Supabase Edge Function eller cron job som:

1. **Kontrollerar påminnelser dagligen** (eller varje timme)
2. **Skickar email till användare** när påminnelser närmar sig:
   - **1 vecka kvar** - Varning om kommande påminnelse
   - **1 dag kvar** - Påminnelse om att det är snart dags
   - **Idag** - Påminnelse om att det är dags idag
   - **Försenad** - Varning om försenad påminnelse

## Email-innehåll

Varje email ska innehålla:
- Påminnelsens titel
- Beskrivning (om den finns)
- Kundnamn (om kopplad till kund)
- Datum för påminnelsen
- Länk till Kundkollen för att se detaljer

## Teknisk implementation

### Alternativ 1: Supabase Edge Function + pg_cron

```sql
-- Skapa en funktion som hittar påminnelser som behöver notifieras
CREATE OR REPLACE FUNCTION get_reminders_to_notify()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  reminder_id uuid,
  reminder_title text,
  reminder_description text,
  customer_name text,
  due_date date,
  days_until integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.user_id,
    p.email as user_email,
    r.id as reminder_id,
    r.title as reminder_title,
    r.description as reminder_description,
    c.company_name as customer_name,
    r.due_date,
    EXTRACT(DAY FROM (r.due_date - CURRENT_DATE))::integer as days_until
  FROM reminders r
  JOIN profiles p ON r.user_id = p.id
  LEFT JOIN customers c ON r.customer_id = c.id
  WHERE r.completed = false
    AND r.due_date >= CURRENT_DATE - INTERVAL '1 day' -- Inkludera försenade
    AND r.due_date <= CURRENT_DATE + INTERVAL '7 days' -- Max 7 dagar framåt
    AND (
      -- 1 vecka kvar
      (r.due_date = CURRENT_DATE + INTERVAL '7 days')
      OR
      -- 1 dag kvar
      (r.due_date = CURRENT_DATE + INTERVAL '1 day')
      OR
      -- Idag
      (r.due_date = CURRENT_DATE)
      OR
      -- Försenad
      (r.due_date < CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;
```

### Alternativ 2: Supabase Edge Function (JavaScript/TypeScript)

Skapa en Edge Function som:
1. Körs dagligen via Supabase Cron eller extern tjänst (t.ex. GitHub Actions, Vercel Cron)
2. Hämtar alla påminnelser som behöver notifieras
3. Skickar email via Supabase's email-tjänst eller Resend/SendGrid
   - **VIKTIGT:** Se till att alla email har "From Name" = "Kundkollen AB"
   - Om du använder Resend: `from: "Kundkollen AB <noreply@kundkollen.se>"`
   - Om du använder SendGrid: Sätt "From Name" till "Kundkollen AB"

## Email-mallar

### 1 vecka kvar
**Ämne:** `Påminnelse om 1 vecka: [Påminnelsens titel]`

**Innehåll:**
```
Hej!

Detta är en påminnelse om att du har en påminnelse som är 1 vecka bort:

Påminnelse: [Titel]
[Beskrivning om den finns]
Kund: [Kundnamn om kopplad]
Datum: [Datum]

Logga in på Kundkollen för att se detaljer: [Länk]

Med vänliga hälsningar,
Kundkollen AB
```

### 1 dag kvar
**Ämne:** `Påminnelse imorgon: [Påminnelsens titel]`

**Innehåll:**
```
Hej!

Detta är en påminnelse om att du har en påminnelse imorgon:

Påminnelse: [Titel]
[Beskrivning om den finns]
Kund: [Kundnamn om kopplad]
Datum: [Datum]

Logga in på Kundkollen för att se detaljer: [Länk]

Med vänliga hälsningar,
Kundkollen AB
```

### Idag
**Ämne:** `Påminnelse idag: [Påminnelsens titel]`

**Innehåll:**
```
Hej!

Detta är en påminnelse om att du har en påminnelse idag:

Påminnelse: [Titel]
[Beskrivning om den finns]
Kund: [Kundnamn om kopplad]
Datum: [Datum]

Logga in på Kundkollen för att se detaljer: [Länk]

Med vänliga hälsningar,
Kundkollen AB
```

### Försenad
**Ämne:** `⚠️ Försenad påminnelse: [Påminnelsens titel]`

**Innehåll:**
```
Hej!

Detta är en varning om att du har en försenad påminnelse:

Påminnelse: [Titel]
[Beskrivning om den finns]
Kund: [Kundnamn om kopplad]
Datum: [Datum] (Försenad med [X] dagar)

Logga in på Kundkollen för att se detaljer: [Länk]

Med vänliga hälsningar,
Kundkollen AB
```

## Viktiga punkter

1. **Email från "Kundkollen AB" - KRITISKT:**
   - **ALLA email måste komma från "Kundkollen AB" och INTE från "Lovable"**
   - Konfigurera Supabase SMTP Settings:
     - Gå till `Project Settings` → `Auth` → `SMTP Settings`
     - Sätt **Sender name** till: `Kundkollen AB`
     - Sätt **From Email** till: `noreply@kundkollen.se` (eller annan passande domän)
   - Om du använder Resend/SendGrid eller annan email-tjänst, se till att "From Name" är "Kundkollen AB"
   - **Inga email får komma från "Lovable" eller visa Lovable-branding**

2. **Inga dubbletter:** Se till att samma påminnelse inte skickas flera gånger för samma datum

3. **Respekt för användarinställningar:** I framtiden kan användare välja att stänga av email-påminnelser

4. **Svenska texter:** Alla email ska vara på svenska

## Testning

Testa funktionaliteten med:
- Påminnelser som är exakt 7 dagar bort
- Påminnelser som är exakt 1 dag bort
- Påminnelser som är idag
- Försenade påminnelser

## Ytterligare funktioner (valfritt)

- **Veckosammanfattning:** Skicka en sammanfattning varje måndag med alla påminnelser för veckan
- **Anpassningsbara notifikationer:** Låt användare välja när de vill få email (1 vecka, 3 dagar, 1 dag, etc.)

