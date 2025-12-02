# Lägg till description-kolumn i quotes-tabellen

Jag behöver lägga till en `description` kolumn i `quotes` tabellen så att offertbeskrivningar sparas i databasen istället för i localStorage.

## Nuvarande situation

- Offerter kan ha en beskrivning som sparas i localStorage som fallback
- `description` kolumn saknas i `quotes` tabellen
- Koden använder `localStorage.getItem('quote_description_${quote.id}')` som fallback

## Vad som behöver göras

### 1. Lägg till `description` kolumn i `quotes` tabellen

Skapa en migration som lägger till kolumnen:

```sql
-- Add description column to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS description TEXT;
```

### 2. Migrera data från localStorage till databasen (valfritt)

Om det finns offerter med beskrivningar i localStorage, kan dessa migreras. Men detta är valfritt eftersom:
- Detta är en ny funktion som precis implementerats
- Det finns troligen inte mycket data i localStorage ännu
- Användare kan lägga till beskrivningar igen om de behövs

**Om du vill migrera data:**
1. Skapa en Edge Function eller SQL-funktion som:
   - Läser alla offerter
   - För varje offert, kolla om det finns data i localStorage (detta måste göras från frontend)
   - Uppdatera offerten med description från localStorage

**Rekommendation:** Skippa migrationen eftersom det troligen inte finns mycket data ännu.

### 3. Uppdatera frontend-koden

Efter att kolumnen är tillagd, uppdatera koden i `src/pages/Quotes.tsx` så att:

**Ändra från:**
```typescript
// Save description to localStorage if database doesn't support it
if (data && formData.description.trim() && !quoteData.description) {
  localStorage.setItem(`quote_description_${data.id}`, formData.description.trim());
}
```

**Till:**
```typescript
// Description is now saved in database, no need for localStorage
```

**Och ändra alla ställen där:**
```typescript
quote.description || localStorage.getItem(`quote_description_${quote.id}`)
```

**Till:**
```typescript
quote.description
```

**Och ändra:**
```typescript
localStorage.setItem(`quote_description_${editingQuote.id}`, formData.description.trim());
```

**Till:**
```typescript
// Description is saved in database via quoteData.description
```

### 4. Uppdatera TypeScript types

Efter att kolumnen är tillagd, uppdatera `src/integrations/supabase/types.ts`:

I `quotes` tabellen, lägg till:
```typescript
description: string | null
```

I både `Row`, `Insert`, och `Update` interfaces.

**Alternativt:** Kör `npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts` för att generera types automatiskt.

## Viktiga punkter

1. **Kolumnen ska vara nullable** (`TEXT` utan `NOT NULL`) eftersom befintliga offerter inte har beskrivningar
2. **Ingen migration av localStorage-data behövs** eftersom funktionen är ny och det troligen inte finns mycket data
3. **Uppdatera koden** så att den alltid sparar i databasen istället för localStorage
4. **Ta bort alla localStorage-referenser** för quote descriptions efter att kolumnen är tillagd

## Steg-för-steg

1. Skapa migration för att lägga till `description TEXT` kolumn
2. Uppdatera frontend-koden för att alltid spara i databasen
3. Ta bort localStorage-fallback koden
4. Uppdatera TypeScript types
5. Testa att skapa/redigera offerter med beskrivningar

## Förväntat resultat

- Offerter kan ha beskrivningar som sparas i databasen
- Beskrivningar visas i offertdetaljvyn
- Ingen data försvinner om användaren rensar cache
- Alla offertdata är centraliserad i databasen

