# Roadmap: Gör Kundkollen värt 200 kr/månad

## 🎯 Målsättning

Förvandla Kundkollen från ett enkelt CRM (värt ~50-100 kr/månad) till ett komplett verktyg som hantverkare aktivt väljer och betalar 200 kr/månad för.

---

## 📊 Nuvarande Status

### Vad vi HAR (värde: ~50-75 kr/månad)
- ✅ Kundregister med kontaktinformation
- ✅ Offert-hantering (skapa, spara, status)
- ✅ Påminnelser
- ✅ Dashboard med översikt
- ✅ Försäljningsstatistik
- ✅ Månadsmål tracking
- ✅ Mobilvänligt
- ✅ Enkel onboarding

### Vad som SAKNAS (kritiskt för 200 kr/månad)
- ❌ PDF-generering för offerter
- ❌ Fakturering
- ❌ Automatisk fakturering
- ❌ Kalender/schemaläggning
- ❌ Riktig email-automation
- ❌ Offertmallar

---

## 🎯 Prioriterad Roadmap

### FASE 1: Professionella Offerter (Värde: +50 kr/månad)
**Tid: 2-3 veckor** | **Svårighet: Medel** | **Prioritet: 🔴 Hög**

#### Mål
- Generera professionella PDF-offerter
- Använda offerter som fakturor
- Branding med företagslogo

#### Funktioner att lägga till:
1. **PDF-generering**
   - Installera `@react-pdf/renderer` eller `jspdf`
   - Skapa offertmall
   - Ladda ner PDF direkt från offerten

2. **Offertmallar**
   - Standardmall
   - Möjlighet att anpassa (kommer senare)
   - Inkludera företagsinfo, logo

3. **Förbättrad offertvy**
   - Professionell layout
   - Alla detaljer synliga
   - Print-friendly

#### Implementationssteg:
1. Installera PDF-bibliotek
2. Skapa PDF-komponent med offertmall
3. Integrera "Ladda ner PDF"-knapp
4. Testa med olika offerter
5. Förbättra layout och formatering

**Förväntat värde:** Hantverkare kan skapa professionella offerter direkt i systemet, slipper Word/Excel.

---

### FASE 2: Fakturering (Värde: +50 kr/månad)
**Tid: 3-4 veckor** | **Svårighet: Medel** | **Prioritet: 🔴 Hög**

#### Mål
- Skapa fakturor från accepterade offerter
- PDF-fakturor
- Fakturastatus (Skickad, Betald, Försenad)

#### Funktioner att lägga till:
1. **Faktura-system**
   - Ny tabell i databasen (`invoices`)
   - Koppling till offerter
   - Fakturanummer (auto-genererat)
   - Betalningsvillkor

2. **Fakturahantering**
   - Skapa faktura från accepterad offert
   - Status: Skickad, Betald, Försenad
   - Förfallodatum
   - Betalningsdatum

3. **Fakturavy**
   - Lista alla fakturor
   - Filtrera på status
   - Sökfunktion
   - Export/PDF

4. **Statistik**
   - Obetalda fakturor
   - Försenade fakturor
   - Totalt belopp att inkassera

#### Implementationssteg:
1. Skapa databas-migration för `invoices`-tabell
2. Bygg faktura-sida (liknande offerter)
3. "Skapa faktura"-knapp på accepterade offerter
4. PDF-generering för fakturor
5. Statusuppdatering och betalningshantering
6. Dashboard-widget för obetalda fakturor

**Förväntat värde:** Komplett faktureringssystem - hantverkare slipper använda externa verktyg.

---

### FASE 3: Automatisk Fakturering (Värde: +30 kr/månad)
**Tid: 2-3 veckor** | **Svårighet: Hög** | **Prioritet: 🟡 Medel**

#### Mål
- Automatiskt skapa fakturor när offert accepteras
- Automatiska påminnelser för obetalda fakturor
- Email-notifikationer

#### Funktioner att lägga till:
1. **Automatisk fakturaskapande**
   - När offert markeras som "accepterad"
   - Automatiskt generera faktura
   - Valbart (på/av)

2. **Påminnelser för obetalda fakturor**
   - Automatiska email-påminnelser
   - Inställbara intervaller (7 dagar, 14 dagar, etc.)
   - Inga dubblerade påminnelser

3. **Email-notifikationer**
   - När faktura skapas → kund får email
   - Vid påminnelse → kund får email
   - Vid betalning → bekräftelse

#### Implementationssteg:
1. Supabase Edge Functions för automatiserad logik
   - Eller: Tredjepartstjänst (Zapier, Make.com)
2. Email-integration (Resend, SendGrid)
3. Databas-triggers för automatisk fakturering
4. Påminnelsesystem
5. Email-mallar

**Förväntat värde:** Sparar tid genom automation - hantverkare behöver inte manuellt skapa fakturor.

---

### FASE 4: Kalender & Schemaläggning (Värde: +40 kr/månad)
**Tid: 4-5 veckor** | **Svårighet: Medel-Hög** | **Prioritet: 🟡 Medel**

#### Mål
- Visuell kalender med alla projekt/offertdatum
- Schemaläggning av jobb
- Integration med offerter och kunder

#### Funktioner att lägga till:
1. **Kalendervy**
   - Månadsvy, veckovy, dagsvy
   - Alla offerter synliga med datum
   - Projekt med start/slutdatum
   - Färgkodning (status)

2. **Schemaläggning**
   - Dra och släpp för att ändra datum
   - Skapa projekt med start/slutdatum
   - Koppla till kunder och offerter

3. **Integrationer**
   - Offertdatum → visas i kalender
   - Projektstatus → uppdateras automatiskt
   - Påminnelser → syns i kalender

#### Implementationssteg:
1. Installera kalender-bibliotek (`react-big-calendar` eller `fullcalendar`)
2. Skapa kalender-sida
3. Koppla offerter till kalender
4. Projekt-hantering (ny tabell)
5. Drag & drop funktionalitet
6. Mobile-optimering

**Förväntat värde:** Hantverkare kan planera och se hela sin verksamhet visuellt - mycket värdefullt.

---

### FASE 5: Förbättrad Email-Automation (Värde: +30 kr/månad)
**Tid: 3-4 veckor** | **Svårighet: Hög** | **Prioritet: 🟢 Låg**

#### Mål
- Automatiska email när offert skickas
- Professionella email-mallar
- Email-tracking (öppnad, klickad)

#### Funktioner att lägga till:
1. **Automatiska emails**
   - När offert skickas → kund får email med PDF
   - När faktura skapas → kund får email
   - Vid påminnelse → automatisk email

2. **Email-mallar**
   - Professionella mallar
   - Branding (logo, färger)
   - Anpassningsbara

3. **Email-tracking** (Nice to have)
   - Se om kund öppnat email
   - När email öppnades
   - Klick på länkar

#### Implementationssteg:
1. Välj email-tjänst (Resend, SendGrid)
2. Skapa email-mallar (HTML)
3. Integrera med Supabase Edge Functions
4. Automatiska triggers
5. Email-tracking (valfritt)

**Förväntat värde:** Professionell kommunikation med kunder - automatiskt och konsekvent.

---

## 📈 Total Värde-Ökning

| Fase | Funktionalitet | Värdeökning | Totalt Värde |
|------|---------------|-------------|--------------|
| Nuvarande | Grundläggande CRM | 50-75 kr | 50-75 kr |
| Fase 1 | PDF-offerter | +50 kr | 100-125 kr |
| Fase 2 | Fakturering | +50 kr | 150-175 kr |
| Fase 3 | Automatisk fakturering | +30 kr | 180-205 kr |
| Fase 4 | Kalender | +40 kr | 220-245 kr |
| Fase 5 | Email-automation | +30 kr | 250-275 kr |

**Mål uppnås vid Fase 2-3!**

---

## 🛠️ Tekniska Implementationer

### Bibliotek & Verktyg att Använda

#### PDF-generering
```bash
npm install @react-pdf/renderer
# eller
npm install jspdf html2canvas
```
**Rekommendation:** `@react-pdf/renderer` - mer kontroll, bättre för React

#### Kalender
```bash
npm install react-big-calendar moment
# eller
npm install @fullcalendar/react @fullcalendar/daygrid
```
**Rekommendation:** `react-big-calendar` - enklare, bättre dokumentation

#### Email
- **Resend** (rekommenderat) - enkelt, bra gratis-tier
- **SendGrid** - mer funktioner, komplext
- **Supabase Edge Functions** - för backend-logik

### Databas-ändringar

#### Nya tabeller att skapa:
1. **invoices**
   - id, user_id, quote_id, invoice_number, amount, status, due_date, paid_date, created_at
   
2. **projects** (för kalender)
   - id, user_id, customer_id, title, start_date, end_date, status, created_at

3. **email_logs** (för tracking)
   - id, user_id, type, recipient, sent_at, opened_at, clicked_at

---

## ⏱️ Realistisk Tidsplan

### Med AI-assistans (Cursor) och begränsad kodningskunskap:

| Fase | Funktioner | Estimering | Realistisk tid |
|------|-----------|------------|----------------|
| Fase 1 | PDF-offerter | 2-3 veckor | **3-4 veckor** |
| Fase 2 | Fakturering | 3-4 veckor | **4-5 veckor** |
| Fase 3 | Automatisk fakturering | 2-3 veckor | **4-5 veckor** |
| Fase 4 | Kalender | 4-5 veckor | **6-8 veckor** |
| Fase 5 | Email-automation | 3-4 veckor | **5-6 veckor** |

**Total tid för att nå 200 kr/månad: ~3-4 månader (Fase 1-3)**

### Faktorer som påverkar tid:
- ✅ Du har AI-assistans (Cursor) - sparar 50-70% tid
- ⚠️ Ingen kodningskunskap - lägger till 30-50% tid
- ⚠️ Buggar och problem - lägger till 20-30% tid
- ✅ Supabase är redan konfigurerat - sparar tid

---

## 🎯 Snabbaste Vägen till 200 kr/månad

### Prioriterad Plan (3 månader):

**Månad 1: PDF-offerter + Grundläggande fakturering**
- Vecka 1-2: PDF-generering för offerter
- Vecka 3-4: Fakturasystem (skapa, lista, status)

**Månad 2: Komplett fakturering**
- Vecka 1-2: Faktura-PDF, förbättrad vy
- Vecka 3-4: Automatisk fakturaskapande (basnivå)

**Månad 3: Polish & Automation**
- Vecka 1-2: Automatiska påminnelser
- Vecka 3-4: Email-integration, testing, buggar

**Resultat:** Ett verktyg värt 200+ kr/månad med fakturering och PDF-offerter.

---

## 💡 Tips för Framgång

### Med AI-assistans (Cursor):

1. **Börja enkelt**
   - En funktion i taget
   - Testa grundligt innan nästa

2. **Använd AI effektivt**
   - Beskriv problemet tydligt
   - Be om förklaringar när du inte förstår
   - Testa ofta - AI kan fixa buggar om du beskriver dem

3. **Fokusera på värde**
   - PDF-offerter ger mest värde först
   - Fakturering är kritisk
   - Kalender kan vänta

4. **Var realistisk**
   - Saker tar längre tid än man tror
   - Buggar kommer upp - det är okej
   - Fokusera på MVP först, perfection senare

### När Saker Blir Svårt:

1. **Email-automation är komplex**
   - Överväg att använda Zapier/Make.com först
   - Eller betala en utvecklare för den delen

2. **Kalender kan vara överväldigande**
   - Börja enkelt med månadsvy
   - Lägg till drag & drop senare

3. **PDF-formatering tar tid**
   - Använd befintliga mallar först
   - Perfektionera senare

---

## ✅ Definition av "Klart"

### För att nå 200 kr/månad-värde behöver vi:

**Minimum (MVP för 200 kr):**
- ✅ PDF-generering för offerter
- ✅ Fakturering (skapa, lista, PDF)
- ✅ Automatisk fakturaskapande från accepterade offerter
- ✅ Grundläggande email-notifikationer

**Nice to have (för premium-känsla):**
- Kalender/schemaläggning
- Automatiska påminnelser
- Email-tracking
- Offertmallar

---

## 🚀 Nästa Steg

1. **Börja med Fase 1: PDF-offerter**
   - Det ger mest värde direkt
   - Relativt enkelt att implementera
   - Hantverkare ser omedelbart fördelarna

2. **Testa med riktiga användare**
   - Bättre att ha 5 nöjda användare än 50 oklara
   - Feedback är värdefullt

3. **Iterera baserat på feedback**
   - Vad saknar användare?
   - Vad fungerar inte bra?
   - Vad är viktigast att fixa?

---

## 📝 Checklista för Varje Fase

När du implementerar en fase, se till att:

- [ ] Funktionen fungerar grundläggande
- [ ] Testat på desktop
- [ ] Testat på mobil
- [ ] Inga kritiska buggar
- [ ] Dokumenterat för framtida användning
- [ ] Backup av databas innan stora ändringar

---

**Dokument skapad:** 2025-01-XX  
**Version:** 1.0  
**Status:** Aktiv roadmap

---

*Detta dokument är en levande guide - uppdatera det när du lär dig mer om vad som krävs för att nå målet!*

