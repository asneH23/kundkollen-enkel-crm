# Steg-för-steg guide: Konfigurera Email i Supabase

Följ dessa steg för att konfigurera email-templates och avsändare i Supabase Dashboard.

## Steg 1: Öppna Supabase Dashboard

1. Gå till din Supabase-projekt
2. Öppna backend via knappen i Lovable (eller gå direkt till Supabase Dashboard)

## Steg 2: Uppdatera Email Templates

1. Gå till **Authentication → Email Templates** i Supabase Dashboard
2. Uppdatera varje mall enligt nedan:

### 📧 Confirm signup (Email Confirmation)

**Subject:**
```
Verifiera din email för Kundkollen
```

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

### 📧 Magic Link (Email Change)

**Subject:**
```
Bekräfta din nya email för Kundkollen
```

**Body (HTML):**
```html
<h2>Email-ändring</h2>
<p>Klicka på länken nedan för att bekräfta din nya email:</p>
<p><a href="{{ .ConfirmationURL }}">Bekräfta email</a></p>
<p>Om du inte begärde denna ändring kan du ignorera detta email.</p>
<p>Med vänliga hälsningar,<br>Kundkollen AB</p>
```

### 📧 Change Email Address

**Subject:**
```
Bekräfta din nya email för Kundkollen
```

**Body (HTML):**
```html
<h2>Email-ändring</h2>
<p>Klicka på länken nedan för att bekräfta din nya email:</p>
<p><a href="{{ .ConfirmationURL }}">Bekräfta email</a></p>
<p>Om du inte begärde denna ändring kan du ignorera detta email.</p>
<p>Med vänliga hälsningar,<br>Kundkollen AB</p>
```

### 📧 Reset Password

**Subject:**
```
Återställ ditt lösenord för Kundkollen
```

**Body (HTML):**
```html
<h2>Återställ lösenord</h2>
<p>Klicka på länken nedan för att återställa ditt lösenord:</p>
<p><a href="{{ .ConfirmationURL }}">Återställ lösenord</a></p>
<p>Om du inte begärde en lösenordsåterställning kan du ignorera detta email.</p>
<p>Med vänliga hälsningar,<br>Kundkollen AB</p>
```

**⚠️ VIKTIGT:** Behåll alla variabler som `{{ .ConfirmationURL }}` och `{{ .Token }}` - dessa är kritiska för funktionalitet!

## Steg 3: Konfigurera Email Avsändare

1. Gå till **Project Settings → Auth → SMTP Settings**
2. Sätt **Sender name** till: `Kundkollen AB`
3. (Valfritt) Sätt **Sender email** till din egen domän om du har en, t.ex. `noreply@kundkollen.se`

## Steg 4: Testa

Efter att du har uppdaterat allt:

1. Skapa ett nytt testkonto i appen
2. Kontrollera att verifieringsemailet kommer från "Kundkollen AB"
3. Testa att både länk och kod fungerar för verifiering

## Tips

- Om du inte ser alla templates, scrolla nedåt i listan
- Du kan förhandsgranska templates innan du sparar
- Testa alltid efter konfiguration för att säkerställa att allt fungerar

---

**Klart!** Nu kommer alla email från Kundkollen att skickas från "Kundkollen AB" istället för "Lovable".

