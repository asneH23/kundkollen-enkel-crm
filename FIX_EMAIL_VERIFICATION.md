# Fixa Email Verification Redirect

## Problem
När användare klickar på verifieringslänken i emailet får de felet: `{"error":"requested path is invalid"}`

## Lösning

Du behöver uppdatera Supabase redirect URLs:

### Steg 1: Gå till Supabase Dashboard
1. Öppna https://supabase.com/dashboard
2. Välj ditt projekt (bztmchmfaprivbdxnhsz)
3. Gå till **Authentication** → **URL Configuration**

### Steg 2: Uppdatera URLs

**Site URL:**
```
http://localhost:8080
```
(För produktion: `https://kundkollen-enkel-crm.vercel.app` eller din egen domän)

**Redirect URLs (lägg till dessa):**
```
http://localhost:8080/**
http://localhost:8080/dashboard
http://localhost:8080/auth
https://kundkollen-enkel-crm.vercel.app/**
https://kundkollen-enkel-crm.vercel.app/dashboard
```

### Steg 3: Spara

Klicka "Save" längst ner.

### Steg 4: Testa igen

1. Skapa ett nytt testkonto
2. Kolla emailen
3. Klicka på verifieringslänken
4. Du ska nu redirectas till Dashboard

---

## Varför detta händer

Supabase kollar att redirect URL:en är tillåten för säkerhet. Om URL:en inte finns i listan över tillåtna URLs får du detta fel.

## För produktion

När du deployar till din egen domän (kundkollen.se), lägg till:
```
https://kundkollen.se/**
https://kundkollen.se/dashboard
```
