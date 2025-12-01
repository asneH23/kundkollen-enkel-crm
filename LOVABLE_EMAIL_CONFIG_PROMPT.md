# Email-konfiguration för Kundkollen

Jag behöver konfigurera email-verifiering i Supabase så att alla email som skickas från Kundkollen kommer från "Kundkollen AB" istället för "Lovable".

## Vad som behöver göras:

### 1. Uppdatera Email Templates i Supabase Dashboard

Gå till **Supabase Dashboard → Authentication → Email Templates** och uppdatera följande:

#### Signup Email (Email Confirmation)

**Subject:** `Verifiera din email för Kundkollen`

**Body (HTML):**
```html
<h2>Välkommen till Kundkollen!</h2>
<p>Klicka på länken nedan för att verifiera din email och aktivera ditt konto:</p>
<p><a href="{{ .ConfirmationURL }}">Verifiera email</a></p>
<p>Eller kopiera denna kod och ange den i appen: <strong>{{ .Token }}</strong></p>
<p>Om du inte skapade detta konto kan du ignorera detta email.</p>
<p>Med vänliga hälsningar,<br>Kundkollen AB</p>
```

**Body (Plain Text):**
```
Välkommen till Kundkollen!

Klicka på länken nedan för att verifiera din email och aktivera ditt konto:
{{ .ConfirmationURL }}

Eller kopiera denna kod och ange den i appen: {{ .Token }}

Om du inte skapade detta konto kan du ignorera detta email.

Med vänliga hälsningar,
Kundkollen AB
```

#### Magic Link Email (Email Change)

**Subject:** `Bekräfta din nya email för Kundkollen`

**Body (HTML):**
```html
<h2>Email-ändring</h2>
<p>Klicka på länken nedan för att bekräfta din nya email:</p>
<p><a href="{{ .ConfirmationURL }}">Bekräfta email</a></p>
<p>Om du inte begärde denna ändring kan du ignorera detta email.</p>
<p>Med vänliga hälsningar,<br>Kundkollen AB</p>
```

#### Password Reset Email

**Subject:** `Återställ ditt lösenord för Kundkollen`

**Body (HTML):**
```html
<h2>Återställ lösenord</h2>
<p>Klicka på länken nedan för att återställa ditt lösenord:</p>
<p><a href="{{ .ConfirmationURL }}">Återställ lösenord</a></p>
<p>Om du inte begärde en lösenordsåterställning kan du ignorera detta email.</p>
<p>Med vänliga hälsningar,<br>Kundkollen AB</p>
```

### 2. Konfigurera Email Avsändare

Gå till **Supabase Dashboard → Project Settings → Auth → SMTP Settings** och sätt:

- **From Name:** `Kundkollen AB`
- **From Email:** `noreply@kundkollen.se` (eller din egen domän om du har en)

**Viktigt:** Behåll alla variabler som `{{ .ConfirmationURL }}` och `{{ .Token }}` - dessa är nödvändiga för att funktionaliteten ska fungera.

## Testa efter konfiguration

Efter att du har uppdaterat templates och SMTP-inställningar, testa att:
1. Skapa ett nytt konto
2. Kontrollera att verifieringsemailet kommer från "Kundkollen AB"
3. Verifiera att både länk och kod fungerar

---

**Notera:** Om du har en egen email-domän kan du konfigurera custom SMTP, men det kräver DNS-konfiguration. För nu räcker det med att uppdatera From Name och From Email i SMTP Settings.

