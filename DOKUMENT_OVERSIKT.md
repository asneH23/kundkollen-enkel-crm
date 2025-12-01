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
**När att skicka:** När du vill att alla email ska komma från "Kundkollen AB"  
**Innehåll:**
- Instruktioner för att uppdatera email-templates (signup, password reset, etc.)
- SMTP-inställningar för "Kundkollen AB"
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

## 📖 Guider för dig (manuell konfiguration)

### 6. `EMAIL_CONFIG_GUIDE.md`
**Vad:** Steg-för-steg guide för att konfigurera email manuellt i Supabase Dashboard  
**När att använda:** Om du vill konfigurera email-templates själv istället för att be Lovable  
**Innehåll:**
- Detaljerade steg för Supabase Dashboard
- Alla svenska texter för email-templates
- Instruktioner för SMTP-inställningar

**Status:** ✅ Använd när du vill göra det manuellt

---

## 📊 Granskningar och översikter

### 7. `LOVABLE_IMPLEMENTATION_REVIEW.md`
**Vad:** Granskning av vad Lovable redan har implementerat  
**När att läsa:** För att se vad som är klart och vad som saknas  
**Innehåll:**
- ✅ Vad som är klart (database-struktur, SQL-funktioner)
- ⚠️ Vad som saknas (Edge Function, Cron job)
- 📋 Checklista för nästa steg

**Status:** ✅ Informativt dokument

---

## 📝 Sammanfattning

### Dokument att skicka till Lovable (i ordning):

1. **`LOVABLE_BACKEND_PROMPT.md`** - Profilbilder och profilfält
2. **`LOVABLE_EMAIL_CONFIG_PROMPT.md`** - Email-templates och SMTP
3. **`LOVABLE_RESEND_API_KEY.md`** - Resend API-nyckel (lägg till nyckel först!)
4. **`LOVABLE_EMAIL_REMINDERS_PROMPT.md`** - Email-påminnelser (översikt)
5. **`LOVABLE_EDGE_FUNCTION_PROMPT.md`** - Slutför email-påminnelser (lägg till nyckel först!)

### Dokument för dig:

- **`EMAIL_CONFIG_GUIDE.md`** - Manuell guide för email-konfiguration
- **`LOVABLE_IMPLEMENTATION_REVIEW.md`** - Granskning av implementation

---

## 🎯 Rekommenderad ordning

### Steg 1: Profilfunktioner
Skicka: `LOVABLE_BACKEND_PROMPT.md`

### Steg 2: Email-konfiguration
1. Skicka: `LOVABLE_EMAIL_CONFIG_PROMPT.md`
2. ELLER följ: `EMAIL_CONFIG_GUIDE.md` (manuellt)

### Steg 3: Resend API
1. Öppna: `LOVABLE_RESEND_API_KEY.md`
2. Lägg till din Resend API-nyckel
3. Skicka till Lovable när de frågar

### Steg 4: Email-påminnelser
1. Skicka: `LOVABLE_EMAIL_REMINDERS_PROMPT.md` (första gången)
2. När du har credits igen: Skicka `LOVABLE_EDGE_FUNCTION_PROMPT.md` (lägg till API-nyckel först!)

---

## 💡 Tips

- **Alla LOVABLE_*-dokument** = Skicka till Lovable
- **Alla *_GUIDE.md dokument** = För dig att följa manuellt
- **Alla *_REVIEW.md dokument** = Informativt, läs för att förstå status

**Viktigt:** Kom ihåg att lägga till Resend API-nyckel i relevanta dokument innan du skickar dem!

