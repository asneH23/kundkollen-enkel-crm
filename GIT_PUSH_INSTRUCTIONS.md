# Instruktioner för att pusha till GitHub

## Steg 1: Kolla status
```bash
git status
```

## Steg 2: Lägg till alla ändringar
```bash
git add .
```

## Steg 3: Committa med beskrivning
```bash
git commit -m "UI redesign: Profilbilder, förbättrad profil-sida, ikon-uppdateringar och bugfixar

- Lagt till profilbild-uppladdning med localStorage och Supabase Storage support
- Förbättrad profil-sida med telefon, adress och statistik-sektion
- Uppdaterat alla kund-ikoner till Users-ikonen (konsistent design)
- Förbättrat 'Håll mig inloggad' checkbox med tydligare visuell feedback
- Förbättrat försäljningsmål-funktionalitet med tydligare UI
- Uppdaterat 'Aktiva påminnelser' text till två rader
- Bugfixar och förbättringar av UI-komponenter"
```

## Steg 4: Pusha till GitHub
```bash
git push
```

## Alternativ: Om du vill ha en kortare commit-meddelande
```bash
git commit -m "UI redesign: Profilbilder, förbättrad profil-sida och ikon-uppdateringar"
```

## Om du får fel om att remote inte är konfigurerad
Om du inte har en remote konfigurerad än, lägg till den först:
```bash
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/DITT-REPO-NAMN.git
git branch -M main
git push -u origin main
```

