# 🦄 Kundkollen Unicorn Roadmap

## Vision
Bli det **enklaste** och **snyggaste** faktureringssystemet för svenska småföretagare och hantverkare.

---

## 🎯 Kritiska Features (Måste ha för att konkurrera)

### 1. ROT/RUT-motor ⭐⭐⭐⭐⭐
**Prioritet:** KRITISK  
**Tidsåtgång:** 2-3 veckor  
**Varför:** 80-90% av hantverkare behöver detta för privatjobb.

**Implementation:**
- [ ] Checkbox "ROT-avdrag" på faktura/offert
- [ ] Automatisk uträkning: 30% av arbetskostnad
- [ ] Visa på PDF: "Skattereduktion: X kr"
- [ ] Generera XML-fil för Skatteverket (ROT/RUT-rapportering)
- [ ] Stöd för olika ROT/RUT-typer (Bygg, El, VVS, etc.)

**Teknisk komplexitet:** Medel-Hög  
**Business impact:** 🚀 GAME CHANGER

---

### 2. Bokföringsexport (SIE-format) ⭐⭐⭐⭐
**Prioritet:** HÖG  
**Tidsåtgång:** 1-2 veckor  
**Varför:** Eliminerar dubbelarbete. Kunden kan exportera till Fortnox/Visma.

**Implementation:**
- [ ] Export till SIE-fil (Svensk standard)
- [ ] Enkel Excel-export för revisorn
- [ ] Automatisk konteringsförslag

**Teknisk komplexitet:** Medel  
**Business impact:** 🔥 Stor konkurrensfördel

---

### 3. BankID-integration ⭐⭐⭐
**Prioritet:** MEDEL  
**Tidsåtgång:** 1 vecka  
**Varför:** Svenskar litar på BankID. Ger legitimitet.

**Implementation:**
- [ ] BankID-login (istället för email/lösenord)
- [ ] Signera offerter med BankID
- [ ] Kund kan godkänna offert med BankID

**Teknisk komplexitet:** Medel (API finns)  
**Business impact:** 💎 Premium-känsla

---

## 🚀 Killer Features (Differentiering)

### 4. Mobil-first Workflow ⭐⭐⭐⭐⭐
**Prioritet:** HÖG (Redan bra, men kan bli bättre)  
**Tidsåtgång:** Kontinuerlig förbättring

**Implementation:**
- [ ] "Snabbfaktura" - Skapa faktura på 30 sekunder från mobilen
- [ ] Röstinmatning för beskrivningar (AI-transkribering)
- [ ] Offline-läge (synka när du får nätverk)
- [ ] Push-notiser när kund öppnar faktura

**Teknisk komplexitet:** Medel  
**Business impact:** 🎯 Din USP (Unique Selling Point)

---

### 5. Kvitto-scanner med AI ⭐⭐⭐
**Prioritet:** MEDEL  
**Tidsåtgång:** 2 veckor  
**Varför:** Hantverkare köper material hela tiden. Automatisera!

**Implementation:**
- [ ] Fota kvitto med mobilen
- [ ] AI läser av: Belopp, Datum, Leverantör, Moms
- [ ] Koppla automatiskt till projekt/faktura
- [ ] Exportera till bokföring

**Teknisk komplexitet:** Hög (OCR + AI)  
**Business impact:** 🤖 WOW-faktor

---

### 6. Påminnelser & Automation ⭐⭐⭐⭐
**Prioritet:** HÖG (Delvis klart)  
**Tidsåtgång:** 1 vecka

**Implementation:**
- [x] Skicka påminnelser för förfallna fakturor
- [ ] Automatiska påminnelser (3 dagar före, dag efter, 7 dagar efter)
- [ ] SMS-påminnelser (via Twilio)
- [ ] Inkasso-integration (för riktigt sena betalningar)

**Teknisk komplexitet:** Låg-Medel  
**Business impact:** 💰 Kunden får betalt snabbare

---

## 💎 Premium Features (Skalning)

### 7. Team & Samarbete ⭐⭐
**Prioritet:** LÅG (För senare)  
**Tidsåtgång:** 2 veckor

**Implementation:**
- [ ] Bjud in medarbetare
- [ ] Rollhantering (Admin, Användare, Läsare)
- [ ] Aktivitetslogg (Vem gjorde vad?)

**Teknisk komplexitet:** Medel  
**Business impact:** 📈 Högre pris för företag med anställda

---

### 8. Rapporter & Insikter ⭐⭐⭐
**Prioritet:** MEDEL  
**Tidsåtgång:** 1-2 veckor

**Implementation:**
- [ ] Månadsrapport: Intäkter, Utgifter, Vinst
- [ ] Kundanalys: Vilka kunder är mest lönsamma?
- [ ] Prognoser: "Du kommer tjäna X kr nästa månad"
- [ ] Momsrapport (klar för deklaration)

**Teknisk komplexitet:** Medel  
**Business impact:** 📊 Hjälper kunden förstå sin ekonomi

---

### 9. Integrationer ⭐⭐⭐⭐
**Prioritet:** HÖG (För skalning)  
**Tidsåtgång:** Kontinuerlig

**Implementation:**
- [ ] Fortnox API (Synka kunder, fakturor)
- [ ] Visma API
- [ ] Stripe/Klarna (Ta betalt direkt på fakturan)
- [ ] Zapier (Koppla till allt annat)

**Teknisk komplexitet:** Medel-Hög  
**Business impact:** 🔗 Blir del av kundens ekosystem

---

## 📱 Native Apps (Långsiktig)

### 10. iOS & Android Apps ⭐⭐⭐⭐
**Prioritet:** MEDEL (När du har 500+ användare)  
**Tidsåtgång:** 2-3 månader

**Implementation:**
- [ ] React Native app (iOS + Android samtidigt)
- [ ] Kamera-integration för kvitton
- [ ] Offline-first arkitektur
- [ ] App Store & Google Play

**Teknisk komplexitet:** Hög  
**Business impact:** 📲 Professionell känsla, högre retention

---

## 🎨 Design & UX Polish

### 11. Onboarding som WOW:ar ⭐⭐⭐⭐
**Prioritet:** HÖG  
**Tidsåtgång:** 1 vecka

**Implementation:**
- [ ] Interaktiv guide första gången
- [ ] "Skapa din första faktura på 60 sekunder"
- [ ] Video-tutorials
- [ ] Tooltips & hjälptexter

**Teknisk komplexitet:** Låg  
**Business impact:** 🎯 Lägre churn (färre hoppar av)

---

### 12. Varumärke & Marknadsföring ⭐⭐⭐⭐⭐
**Prioritet:** KRITISK (Parallellt med utveckling)  
**Tidsåtgång:** Kontinuerlig

**Implementation:**
- [ ] Professionell logotyp
- [ ] Landningssida som konverterar
- [ ] SEO-optimering (Rankas för "faktureringsprogram hantverkare")
- [ ] Google Ads / Facebook Ads
- [ ] Partnerskap med hantverksföreningar
- [ ] YouTube-tutorials
- [ ] Referensprogram (Bjud in vän, få 1 månad gratis)

**Teknisk komplexitet:** Låg (Mest marknadsföring)  
**Business impact:** 🚀 Avgör om du får kunder eller inte

---

## 📊 Milstolpar

### Fas 1: Beta (Nu - Dec 2025)
- ✅ Grundfunktioner (Kunder, Offerter, Fakturor)
- ✅ PDF-generering
- ✅ Email-utskick
- 🔄 ROT/RUT-motor
- 🔄 SIE-export

**Mål:** 50-100 betalande kunder

---

### Fas 2: Product-Market Fit (Q1 2026)
- ✅ ROT/RUT
- ✅ Bokföringsexport
- ✅ BankID
- ✅ Mobil-optimering
- 🔄 Kvitto-scanner

**Mål:** 500 betalande kunder, 75k SEK/månad

---

### Fas 3: Skalning (Q2-Q4 2026)
- ✅ Native apps
- ✅ Team-funktioner
- ✅ Integrationer (Fortnox, Stripe)
- ✅ Aggressiv marknadsföring

**Mål:** 2000 kunder, 300k SEK/månad

---

### Fas 4: Marknadsledare (2027+)
- ✅ AI-assistent ("Skapa faktura åt mig")
- ✅ Automatisk bokföring
- ✅ Inkasso-integration
- ✅ Internationell expansion (Norge, Finland)

**Mål:** 10 000 kunder, 1.5M SEK/månad

---

## 💰 Prissättning (Förslag)

### Gratis (Freemium)
- 5 fakturor/månad
- Grundfunktioner
- Kundkollen-branding på PDF

### Starter - 99 kr/mån
- Obegränsat fakturor
- ROT/RUT
- Email-support
- Ingen branding

### Pro - 199 kr/mån
- Allt i Starter
- Bokföringsexport
- BankID
- Kvitto-scanner
- Prioriterad support

### Business - 399 kr/mån
- Allt i Pro
- Team (upp till 5 användare)
- Integrationer
- Telefonsupport
- Dedikerad account manager

---

## 🎯 Sammanfattning

**Om du bygger allt detta:**
- Du har en **komplett** lösning som slår Fortnox på UX
- Du har **unika** features (Mobil-first, AI-kvitton)
- Du har **kritiska** features (ROT/RUT) som hantverkare MÅSTE ha

**Då kan du:**
- Ta 1-5% av marknaden (1000-5000 kunder)
- Tjäna 150k - 750k SEK/månad
- Bygga ett riktigt företag med anställda

**Men:**
- Det tar 12-24 månader att bygga allt detta
- Du behöver marknadsföra HÅRT
- Konkurrensen sover inte

**Min råd:**
Fokusera på **Fas 1 & 2** först. Få 500 betalande kunder som ÄLSKAR produkten. Då har du bevisat att det funkar. Sen kan du skala.
