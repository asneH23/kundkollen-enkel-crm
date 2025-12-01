# Fixa Edge Function build error

Jag får ett build error när Edge Function `send-reminder-emails` försöker byggas. Felet är:

```
error: Could not find a matching package for 'npm:resend@2.0.0' in the node_modules directory.
```

## Lösning

### 1. Skapa `deno.json` fil i Edge Function-mappen

Skapa en fil: `supabase/functions/send-reminder-emails/deno.json`

**Innehåll:**
```json
{
  "imports": {
    "resend": "npm:resend@2.0.0"
  },
  "nodeModulesDir": "auto"
}
```

### 2. Alternativ: Uppdatera import i Edge Function

Om `deno.json` inte fungerar, ändra importen i `index.ts` från:
```typescript
import { Resend } from "npm:resend@2.0.0";
```

Till:
```typescript
import { Resend } from "https://esm.sh/resend@2.0.0";
```

Eller använd CDN-import:
```typescript
import { Resend } from "https://cdn.skypack.dev/resend@2.0.0";
```

### 3. Testa build

Efter att ha lagt till `deno.json` eller uppdaterat importen, testa att bygga Edge Function igen.

## Rekommendation

Börja med att skapa `deno.json` filen (steg 1). Detta är den rekommenderade lösningen för Supabase Edge Functions med npm-paket.

**Notera:** `deno.json` filen finns redan i repository, så den behöver bara deployas om Edge Function.
