# 💰 Brutal Värdering & Affärsanalys: Kundkollen

Du bad om en helt brutalt ärlig analys av vad Kundkollen är värt och vad du kan tjäna. Här är sanningen, baserat på min genomgång av din kod, roadmap och nuvarande funktionalitet.

---

## 📉 Nuvarande Värde (Idag)

### **Marknadsvärde: ~0 - 10 000 SEK**
Om du försökte sälja koden idag skulle du antagligen inte få något för den, eller max en symbolisk summa för koden.

**Varför?**
1.  **Inga intäkter:** En produkt utan betalande kunder värderas enbart på potential, vilket är riskfyllt för en köpare.
2.  **Kritiska hål:** Du saknar "hygienfaktorer" som krävs för att ens kalla det ett "faktureringsprogram":
    *   ❌ **Ingen riktig fakturering:** Det finns en PDF-generator för offerter, men fakturadelen verkar endast vara ett skal i koden än så länge (eller väldigt basic). Utan att kunna skapa, skicka och bocka av fakturor är det värdelöst för en hantverkare.
    *   ❌ **Ingen ROT/RUT:** Detta är **dödsstöten** för hantverkar-segmentet. Utan automatisk ROT/RUT-uträkning och XML-export till Skatteverket kommer ingen svensk snickare att använda detta, även om det var gratis. De *måste* ha det enligt lag/krav.
    *   ❌ **Buggig onboarding:** E-postverifieringen krånglar (enligt dina anteckningar), vilket dödar förtroendet direkt.

### **Slutsats:**
Just nu har du en snygg prototyp (MVP), inte ett företag. Du har byggt skalet till en Ferrari men motorn saknas.

---

## 💸 Intäktspotential (Realistisk)

Om du fixar de kritiska hålen (Fakturering + ROT/RUT + BankID/Signering) förändras bilden drastiskt.

### **Prissättning**
Din roadmap nämner 99 kr/mån eller 200 kr/mån.
*   **99 kr:** För billigt. Det signalerar "låg kvalitet". Ett verktyg som hanterar en hantverkares levebröd (fakturor) får inte kännas "billigt och osäkert".
*   **199-249 kr:** Sweet spot. Fortfarande billigare än Fortnox/Visma men tillräckligt för att kännas seriöst.

### **Realistisk Kalkyl (År 1-2)**
Låt oss vara konservativa (inte glädjekalkylen i din roadmap).

*   **Acquisition Cost (CAC):** Det kostar pengar/tid att hitta kunder. I början är det "gratis" (dina vänner), men sen kostar Google Ads ca 500-1000 kr per betalande kund.
*   **Churn (Avhopp):** Utan perfekta funktioner kommer 10-20% sluta varje månad.

**Scenario: Du sliter hårt i 12 månader**
*   **Kunder:** 100 betalande hantverkare (detta är svårt att nå!).
*   **Pris:** 199 kr/mån.
*   **Intäkt:** 19 900 kr/mån.
*   **Vinst:** Efter serverkostnader och skatt ca **10 000 kr/mån i fickan.**

**Slutsats:** Du blir inte miljonär år 1. Du köper ingen Aston Martin år 2. Men du bygger ett *kassaflöde*.

---

## 🛑 De "Vissa Problems" i Koden (Och hur vi fixar dem)

Jag har hittat tekniska problem som hindrar dig från att ens nå "Start"-linjen:

### 1. E-post & Verifiering (Kritiskt!)
Du har problem med redirect-loopar och felmeddelanden vid signup. Detta **måste** lösas.
*   **Supabase Redirects:** Du måste lägga in *exakt* rätt URL:er i Supabase Dashboard under Auth -> URL Configuration. Jag kan inte göra det åt dig, men jag har sett att du har en guide för det (`FIX_EMAIL_VERIFICATION.md`). **FÖLJ DEN.**

### 2. Hårdkodade "Test"-mail
I din kod (`send-quote-email/index.ts`) skickas mail från `onboarding@resend.dev`.
*   **Problem:** Detta funkar BARA till din egen mail. Om en riktig kund försöker skicka en offert till *sin* kund, kommer det inte komma fram.
*   **Lösning:** Du måste verifiera din domän (`kundkollen.se`?) hos Resend och uppdatera koden att använda den. Jag kommer uppdatera koden nu så den är redo för det.

### 3. ROT/RUT Saknas
Koden för att hantera ROT/RUT (uträkningen av 30% / 50% skattereduktion) verkar ofullständig i "skapa"-flödet. Det finns i "redigera"-vyn men måste vara rock-solid.

---

## 🚀 Din Väg Framåt (The Harsh Truth)

För att detta ska bli värt **30-50M SEK** (din exit-plan) måste du sluta drömma om Aston Martins just nu och börja bygga tråkiga funktioner:

1.  **Stoppa all marknadsföring** tills ROT/RUT fungerar 100%. Du bränner bara varumärket om du släpper in snickare i ett system som inte kan hantera ROT.
2.  **Fixa Fakturering:** Det måste gå att skapa en PDF-faktura som ser proffsig ut. Utan det är systemet en leksak.
3.  **Fokusera på *en* sak:** Gör det "Enklaste faktureringsprogrammet för hantverkare". Skit i kalender, schemaläggning och AI just nu. Bara Faktura + ROT/RUT.

**Är det värt det?**
Ja. Om du orkar "grinden". SaaS-värderingar är höga. 1000 kunder x 200 kr = 200k MRR -> Bolagsvärde ca 10-15 MSEK. Det är görbart, men det kräver 2 års hårt arbete, inte 2 veckor.

Jag fixar koden för e-posten nu, så är ett hinder borta.
