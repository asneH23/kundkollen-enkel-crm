# Email Configuration for Kundkollen

## Quick Fix: Change Email Sender Name

1. Go to: https://supabase.com/dashboard/project/bztmchmfaprivbdxnhsz/auth/templates
2. Click on **"Confirm signup"** template
3. Change **Sender name** from "Supabase Auth" to **"Kundkollen"**
4. Click **Save**

Repeat for all templates:
- Confirm signup
- Magic Link
- Change Email Address
- Reset Password

## Email Templates (Swedish)

### Confirm signup
**Subject:** `Verifiera din email för Kundkollen`

**Body (HTML):**
```html
<h2>Välkommen till Kundkollen!</h2>
<p>Klicka på länken nedan för att verifiera din email och aktivera ditt konto:</p>
<p><a href="{{ .ConfirmationURL }}">Verifiera email</a></p>
<p>Om du inte skapade detta konto kan du ignorera detta email.</p>
<p>Med vänliga hälsningar,<br>Kundkollen</p>
```

### Reset Password
**Subject:** `Återställ ditt lösenord för Kundkollen`

**Body (HTML):**
```html
<h2>Återställ lösenord</h2>
<p>Klicka på länken nedan för att återställa ditt lösenord:</p>
<p><a href="{{ .ConfirmationURL }}">Återställ lösenord</a></p>
<p>Om du inte begärde en lösenordsåterställning kan du ignorera detta email.</p>
<p>Med vänliga hälsningar,<br>Kundkollen</p>
```

## Done!
Now all emails will come from "Kundkollen" instead of "Supabase Auth".
