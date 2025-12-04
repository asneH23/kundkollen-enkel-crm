# Verifiering av Database Migration

## Problem
Företagsmailen sparas bara lokalt, inte i databasen.

## Lösning: Verifiera att migrationen kördes korrekt

### Steg 1: Kolla om kolumnerna finns
1. Gå till https://supabase.com/dashboard
2. Välj ditt projekt
3. Gå till **Table Editor** → **profiles**
4. Kolla om dessa kolumner finns:
   - `business_email` (text)
   - `phone` (text)
   - `address` (text)

### Steg 2: Om kolumnerna INTE finns
Kör denna SQL i **SQL Editor**:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;
```

### Steg 3: Testa igen
1. Gå till **Profil** i appen
2. Fyll i "Företagets e-post"
3. Klicka **Spara ändringar**
4. Om du får ett **rött felmeddelande**, kopiera texten och skicka till mig
5. Om du får **"Sparad"** (grönt) = SUCCESS! ✅

### Steg 4: Verifiera cross-browser
1. Öppna appen på telefonen
2. Logga in
3. Gå till Profil
4. Företagsmailen ska synas där också

---

## Fixar som gjordes

### 1. PDF Kundens Namn
- ✅ Använder nu `company_name` från customer-tabellen
- ✅ Fallback: company_name → name → "Okänd kund"

### 2. Error Handling
- ✅ Visar nu faktiskt felmeddelande istället för generisk text
- ✅ Hjälper oss debugga vad som går fel

---

## Nästa steg om det fortfarande inte fungerar
Om du fortfarande får "Sparad lokalt":
1. Kopiera felmeddelandet du får
2. Skicka till mig så fixar jag det
