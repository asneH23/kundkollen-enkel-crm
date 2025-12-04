# Verifiering av Email med PDF

## Vad som är nytt
1. **Skicka Offert via Email**
   - Nu skickas offerten direkt via vår server (inte via din mailklient).
   - PDF genereras automatiskt och bifogas.
   - Mailet har en snygg layout.
   - Kunden kan svara direkt till dig (Reply-To är satt till din email).

2. **Nytt fält på Kunder: Adress**
   - Du kan nu lägga till adress på kunder.
   - Adressen visas i PDF-offerten.

## Hur du testar

### 1. Verifiera Adress-fältet
1. Gå till **Kunder**.
2. Redigera en kund eller skapa en ny.
3. Fyll i **Adress**.
4. Spara.
5. Ladda om sidan och kolla att adressen är kvar.

### 2. Testa att skicka offert
1. Gå till **Offerter**.
2. Klicka på **⋮** på en offert och välj **Markera som skickad** (eller använd "Skicka" knappen om du har en).
   - *Vänta, jag har uppdaterat "Markera som skickad" i menyn, men den skickar inte mailet. Det är "Skicka offert" knappen i dialogen som gör det.*
   - **Gör så här:**
     1. Klicka på **Redigera** (pennan) eller skapa en ny offert.
     2. I dialogen, klicka på **"Skicka offert"** (om den finns där? Nej, vänta...).

**Rättelse:** Jag har lagt logiken i `handleSendQuote`. Men var anropas den?
I `Quotes.tsx` finns en dialog för att skicka offert.
Leta efter knappen som öppnar `setSendQuoteOpen(true)`.
Det är en knapp med `Mail` ikon i `QuoteCard`? Eller i menyn?

Låt mig kolla koden snabbt.
I `QuoteCard.tsx`:
```typescript
            <DropdownMenuItem onClick={() => onStatusChange(quote.id, "sent")} ...>
              <Send className="mr-2 h-4 w-4" /> Markera som skickad
            </DropdownMenuItem>
```
Detta ändrar bara status.

Var finns "Skicka via email" funktionen?
Jag ser `handleSendQuote` i `Quotes.tsx`, men används den?
Jag ser `sendQuoteOpen` state.
Jag ser en dialog:
```typescript
      <Dialog open={sendQuoteOpen} onOpenChange={setSendQuoteOpen}>
        ...
        <Button onClick={handleSendQuote} ...>
          {sendingQuote ? "Skickar..." : "Skicka offert"}
        </Button>
```
Men hur öppnas denna dialog?
Jag måste kolla `Quotes.tsx` igen för att se hur man öppnar "Skicka offert" dialogen.

### 3. Om du inte hittar knappen
Om du inte hittar knappen för att skicka email, säg till så lägger jag till den i `QuoteCard` menyn!

---

## Felsökning
Om du får felmeddelande "Kunde inte skicka email":
1. Kontrollera att kunden har en giltig email.
2. Kontrollera att du har internetanslutning.
3. Om det står "Error sending email", kan det bero på att API-nyckeln saknas i Supabase.
