# Resend API-nyckel för Kundkollen

Jag behöver hjälp med att konfigurera Resend för att skicka email från Kundkollen. Här är min Resend API-nyckel och instruktioner.

## Resend API-nyckel

**API-nyckel:** `[LÄGG TILL DIN RESEND API-NYCKEL HÄR]`

**Behörighet:** Sending access (inte Full access)

**Viktigt:** 
- API-nyckeln är känslig information - hantera den säkert
- Använd "Sending access" och INTE "Full access" för säkerhet

## Konfiguration

### 1. Använd API-nyckeln i Supabase

Konfigurera Resend i Supabase Dashboard:

1. Gå till **Project Settings** → **Auth** → **SMTP Settings**
2. Aktivera "Enable Custom SMTP"
3. Fyll i:
   - **SMTP Host:** `smtp.resend.com`
   - **SMTP Port:** `587` (eller `465` för SSL)
   - **SMTP User:** `resend`
   - **SMTP Password:** `[DIN RESEND API-NYCKEL]`
   - **Sender Name:** `Kundkollen`
   - **Sender Email:** `onboarding@resend.dev` (tillfälligt, kan ändras senare till egen domän)

### 2. Email från "Kundkollen"

**VIKTIGT:** Se till att alla email som skickas har:
- **From Name:** `Kundkollen`
- **From Email:** `onboarding@resend.dev` (eller din egen domän när den är verifierad)

**INGA email får komma från "Lovable" eller visa Lovable-branding.**

## Domän (valfritt - kan läggas till senare)

För närvarande använder jag Resend's standarddomän (`onboarding@resend.dev`). 

**Framtida plan:** När jag har en egen domän (t.ex. `kundkollen.se`) kommer jag att:
1. Verifiera domänen i Resend Dashboard
2. Uppdatera "From Email" till `noreply@kundkollen.se`
3. Samma API-nyckel kommer att fungera

## Testning

Efter konfiguration, testa att:
1. Skicka ett test-email
2. Kontrollera att email kommer från "Kundkollen"
3. Verifiera att email inte kommer från "Lovable"

## Ytterligare information

- **Resend Dashboard:** https://resend.com
- **Gratis plan:** 3,000 email/månad
- **API-nyckel behörighet:** Sending access (rekommenderat, inte Full access)

---

**Notera:** API-nyckeln ovan är känslig information. Se till att den inte exponeras publikt eller committas till Git.

