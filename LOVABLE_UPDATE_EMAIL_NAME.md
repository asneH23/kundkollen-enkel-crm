# Uppdatera email-avsändarnamn till "Kundkollen"

Jag behöver uppdatera alla email så att de kommer från "Kundkollen" istället för "Kundkollen AB".

## Vad som behöver göras:

### 1. Uppdatera Edge Function

Om Edge Function `send-reminder-emails` redan är deployad, behöver den deployas om med uppdaterad kod.

**Ändringar i koden:**
- Ändra `from: "Kundkollen AB <noreply@kundkollen.se>"` till `from: "Kundkollen <noreply@kundkollen.se>"`
- Ändra footer i email-mallarna från "Kundkollen AB" till "Kundkollen"

Koden är redan uppdaterad i repository, så deploya bara om Edge Function.

### 2. Uppdatera Email Templates i Supabase Dashboard

Gå till **Supabase Dashboard → Authentication → Email Templates** och uppdatera alla templates:

**Ändra i alla email-templates:**
- Byt "Kundkollen AB" till "Kundkollen" i alla ställen
- Detta gäller:
  - Signup/Email Confirmation template
  - Magic Link/Email Change template
  - Password Reset template

**Exempel:**
- Från: `Med vänliga hälsningar,<br>Kundkollen AB`
- Till: `Med vänliga hälsningar,<br>Kundkollen`

### 3. Uppdatera SMTP Settings

Gå till **Supabase Dashboard → Project Settings → Auth → SMTP Settings** och uppdatera:

- **From Name:** Ändra från "Kundkollen AB" till "Kundkollen"

## Sammanfattning

1. ✅ Deploya om Edge Function `send-reminder-emails` (koden är redan uppdaterad)
2. ✅ Uppdatera alla email-templates i Supabase Dashboard
3. ✅ Uppdatera SMTP Settings "From Name" till "Kundkollen"

**Viktigt:** Alla email måste nu komma från "Kundkollen" och INTE från "Kundkollen AB" eller "Lovable".

