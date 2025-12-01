# 📚 Översikt över alla dokument i Kundkollen

Här är en guide över alla dokument i kodbasen och vad varje en är till för.

---

## 🎯 Dokument att skicka till Lovable (Backend)

### 1. `LOVABLE_BACKEND_PROMPT.md`
**Vad:** Prompt för att lägga till profilbilder och extra profilfält  
**När att skicka:** När du vill ha profilbilder och telefon/adress i profilen  
**Innehåll:**
- SQL för att lägga till kolumner (`avatar_url`, `phone`, `address`)
- Instruktioner för Supabase Storage bucket "avatars"
- Storage policies för profilbilder

**Status:** ✅ Klar att skicka

---

### 2. `LOVABLE_EMAIL_CONFIG_PROMPT.md`
**Vad:** Prompt för att konfigurera email-templates och SMTP-inställningar  
**När att skicka:** När du vill att alla email ska komma från "Kundkollen"  
**Innehåll:**
- Instruktioner för att uppdatera email-templates (signup, password reset, etc.)
- SMTP-inställningar för "Kundkollen"
- Svenska texter för alla email

**Status:** ✅ Klar att skicka (men kräver manuell konfiguration i Supabase Dashboard)

---

### 3. `LOVABLE_RESEND_API_KEY.md`
**Vad:** Prompt för att konfigurera Resend API-nyckel  
**När att skicka:** När Lovable frågar efter Resend API-nyckel  
**Innehåll:**
- Plats för din Resend API-nyckel
- Instruktioner för Supabase SMTP-konfiguration med Resend
- Information om att lägga till egen domän senare

**Status:** ⚠️ **VIKTIGT:** Lägg till din Resend API-nyckel innan du skickar!

---

### 4. `LOVABLE_EMAIL_REMINDERS_PROMPT.md`
**Vad:** Prompt för automatiska email-påminnelser för påminnelser  
**När att skicka:** När du vill ha automatiska email när påminnelser närmar sig  
**Innehåll:**
- SQL-funktion för att hitta påminnelser som behöver notifieras
- Email-mallar för 1 vecka, 1 dag, idag, och försenade
- Instruktioner för Edge Functions och cron jobs

**Status:** ✅ Klar att skicka (men se `LOVABLE_EDGE_FUNCTION_PROMPT.md` också)

---

### 5. `LOVABLE_EDGE_FUNCTION_PROMPT.md`
**Vad:** Prompt för att slutföra email-påminnelser (Edge Function + Cron job)  
**När att skicka:** När du har credits igen och vill slutföra email-påminnelser  
**Innehåll:**
- Instruktioner för Edge Function som skickar email via Resend
- Cron job-konfiguration
- Email-mallar med svenska texter
- Integration med Resend API

**Status:** ⚠️ **VIKTIGT:** Lägg till din Resend API-nyckel innan du skickar!

---

### 6. `LOVABLE_UPDATE_EMAIL_NAME.md`
**Vad:** Prompt för att uppdatera email-avsändarnamn från "Kundkollen AB" till "Kundkollen"  
**När att skicka:** När du vill ändra email-avsändarnamn (efter att ha pushat ändringarna till GitHub)  
**Innehåll:**
- Instruktioner för att deploya om Edge Function
- Instruktioner för att uppdatera email-templates i Supabase Dashboard
- Instruktioner för att uppdatera SMTP Settings

**Status:** ✅ Klar att skicka (efter att ha pushat ändringarna till GitHub)

---

### 7. `LOVABLE_FIX_EDGE_FUNCTION.md`
**Vad:** Prompt för att fixa build error i Edge Function  
**När att skicka:** Om Edge Function `send-reminder-emails` får build error med Resend-paketet  
**Innehåll:**
- Instruktioner för att skapa `deno.json` fil
- Alternativa lösningar om `deno.json` inte fungerar
- Uppdatering av import-syntax

**Status:** ✅ Klar att skicka (om build error uppstår)

---

## 📖 Guider för dig (manuell konfiguration)

### 8. `EMAIL_CONFIG_GUIDE.md`
**Vad:** Steg-för-steg guide för att konfigurera email manuellt i Supabase Dashboard  
**När att använda:** Om du vill konfigurera email-templates själv istället för att be Lovable  
**Innehåll:**
- Detaljerade steg för Supabase Dashboard
- Alla svenska texter för email-templates
- Instruktioner för SMTP-inställningar

**Status:** ✅ Använd när du vill göra det manuellt

---

## 📊 Granskningar och översikter

### 9. `LOVABLE_IMPLEMENTATION_REVIEW.md`
**Vad:** Granskning av vad Lovable redan har implementerat  
**När att läsa:** För att se vad som är klart och vad som saknas  
**Innehåll:**
- ✅ Vad som är klart (database-struktur, SQL-funktioner)
- ⚠️ Vad som saknas (Edge Function, Cron job)
- 📋 Checklista för nästa steg

**Status:** ✅ Informativt dokument

---

## 📝 Snabböversikt - Prioriterad ordning

### 🔴 SKICKA FÖRST (Högsta prioritet):
1. **`LOVABLE_EMAIL_CONFIG_PROMPT.md`** ⭐ - Email-templates och SMTP (kritisk för att email ska fungera)

### 🟡 SKICKA HÄRNÄST (Medel prioritet):
2. **`LOVABLE_BACKEND_PROMPT.md`** - Profilbilder och profilfält (om du vill ha det)
3. **`LOVABLE_RESEND_API_KEY.md`** - Resend API-nyckel (när Lovable frågar, lägg till nyckel först!)

### 🟢 SKICKA SENARE (Låg prioritet):
4. **`LOVABLE_EMAIL_REMINDERS_PROMPT.md`** - Email-påminnelser (översikt)
5. **`LOVABLE_EDGE_FUNCTION_PROMPT.md`** - Slutför email-påminnelser (när du har credits, lägg till nyckel först!)
6. **`LOVABLE_UPDATE_EMAIL_NAME.md`** - Uppdatera från "Kundkollen AB" till "Kundkollen" (efter push till GitHub)
7. **`LOVABLE_FIX_EDGE_FUNCTION.md`** - Fixa build error i Edge Function (om build error uppstår)

### 📖 Dokument för dig (inte att skicka):
- **`EMAIL_CONFIG_GUIDE.md`** - Manuell guide för email-konfiguration
- **`LOVABLE_IMPLEMENTATION_REVIEW.md`** - Granskning av implementation
- **`DOKUMENT_OVERSIKT.md`** - Denna fil (översikt över alla dokument)

---

## 🎯 Rekommenderad ordning (PRIORITERAT)

### 🔴 HÖGSTA PRIORITET - Gör först

#### Steg 1: Email-konfiguration (VIKTIGT för att email ska fungera)
**Skicka:** `LOVABLE_EMAIL_CONFIG_PROMPT.md`  
**ELLER följ:** `EMAIL_CONFIG_GUIDE.md` (manuellt i Supabase Dashboard)  
**Varför först:** Alla email (signup, password reset, etc.) behöver komma från "Kundkollen" istället för "Lovable"

---

### 🟡 MEDEL PRIORITET - Gör härnäst

#### Steg 2: Profilfunktioner (Om du vill ha profilbilder)
**Skicka:** `LOVABLE_BACKEND_PROMPT.md`  
**Varför:** Lägger till stöd för profilbilder och extra profilfält (telefon, adress)

#### Steg 3: Resend API (När Lovable frågar)
**Skicka:** `LOVABLE_RESEND_API_KEY.md` (lägg till din API-nyckel först!)  
**Varför:** Behövs för att skicka email via Resend (när Lovable frågar efter nyckeln)

---

### 🟢 LÅG PRIORITET - Gör senare

#### Steg 4: Email-påminnelser (När du har credits)
1. **Första gången:** Skicka `LOVABLE_EMAIL_REMINDERS_PROMPT.md`
2. **När du har credits igen:** Skicka `LOVABLE_EDGE_FUNCTION_PROMPT.md` (lägg till Resend API-nyckel först!)  
**Varför senare:** Email-påminnelser är en "nice-to-have" funktion, inte kritisk för grundfunktionalitet

#### Steg 5: Uppdatera email-avsändarnamn (Efter push till GitHub)
1. Pusha ändringarna till GitHub först
2. Skicka: `LOVABLE_UPDATE_EMAIL_NAME.md`  
**Varför:** Uppdaterar från "Kundkollen AB" till "Kundkollen" (görs efter att grundkonfigurationen är klar)

---

## 💡 Tips

- **Alla LOVABLE_*-dokument** = Skicka till Lovable
- **Alla *_GUIDE.md dokument** = För dig att följa manuellt
- **Alla *_REVIEW.md dokument** = Informativt, läs för att förstå status

**Viktigt:** Kom ihåg att lägga till Resend API-nyckel i relevanta dokument innan du skickar dem!

