# Uppdatera nyheter och artiklar

Webbplatsen använder **Jekylls inbyggda stöd för GitHub Pages**. En nyhet är en vanlig Markdown-fil i `_posts/`. Inga databaser, API-nycklar eller tredjepartstjänster behövs.

## Publicera en nyhet via GitHub (webbläsaren)

1. Öppna repositoryt för Rossolution på GitHub.
2. Öppna mappen **`_posts`** och välj **Add file → Create new file**. (Alternativt öppna en befintlig artikel och använd **Copy raw file** för att börja från en kopia.)
3. Använd **engelskt filnamn** enligt **`YYYY-MM-DD-short-title.md`**, exempelvis `2026-11-18-new-feature.md`. Artikelns rubrik och brödtext kan vara på svenska.
4. Kopiera innehållet från `article-template.md`, ändra metadata och skriv texten i Markdown.
5. Välj **Commit changes**. Artikeln visas automatiskt i den publika artikelöversikten, som en av de tre senaste på startsidan och i RSS-flödet. Publicering förutsätter att GitHub Pages är konfigurerat för Jekyll-build från rätt källa.

### Exempel på artikel

```markdown
---
title: "Så här ser en nyhet ut"
description: "En kort beskrivning som visas i listningen."
category: Identitet
image: /assets/images/news-default.svg
image_alt: "Abstrakt illustration med Rossolutions symbol"
---

Här skriver du inledningen.

## Mellanrubrik

Fortsätt i vanlig Markdown. Du kan använda **fetstil**, punktlistor och länkar.
```

## Lägg till eller byt bild

1. Lägg bilden i **`assets/images/`** (helst `.webp`, `.jpg`, `.png` eller `.svg`).
2. Använd engelskt filnamn utan mellanslag eller svenska tecken. Uppdatera `image:` i artikelns metadata med sökvägen `/assets/images/filnamn.webp`.
3. Skriv en beskrivande `image_alt:`. Om bilden är helt dekorativ kan `image_alt: ""` användas.
4. Välj gärna en bild i liggande format omkring **16:9** för korten. Undvik bilder med inbyggd text som måste kunna läsas.

Sajten innehåller egna abstrakta SVG-illustrationer och är inte beroende av någon extern bildtjänst. Det går bra att ersätta dem med egna bilder.

## Vad händer automatiskt?

- Startsidan visar de tre senaste artiklarna under **Artiklar & nyheter**.
- `/articles/` visar samtliga artiklar, senaste först, med kategorifilter.
- Varje artikel får en separat adress, `/articles/short-title/`.
- `/feed.xml` ger ett enkelt RSS 2.0-flöde till en RSS-läsare.
- Om du tar bort alla artiklar visas en neutral tomvy i stället för ett trasigt rutnät.

## Ändra innehåll på startsidan

- Startsida: `index.html` (innehållet ligger efter de tre inledande `---`-raderna).
- Sidhuvud, meny, sidfot och metadata: `_layouts/default.html`.
- Artikelutseende: `_layouts/post.html`.
- Stilar: `assets/css/style.css`.
- Mobilmeny och filtrering: `assets/js/main.js`.
- Färger: variablerna högst upp i `assets/css/style.css`.

## Viktigt före publicering

- De två medföljande artiklarna i `_posts/` är **exempeltexter** och avslutas med en tydlig notering om detta. Anpassa eller ta bort dem före publicering om du inte vill ha exempelinnehåll på sajten.
- Befintlig domän `www.rossolution.se` finns kvar i `CNAME` och `_config.yml`.
- Kontrollera att repositoryt använder **Settings → Pages → Build and deployment** med en Jekyll-kompatibel källa. GitHub Pages måste behandla Jekyll/Liquid; annars visas mallkoden som text.
- Besök hemsidan efter publicering, prova menyn på mobil och öppna en artikel från nyhetsflödet.
- Inga tillagda spårningsskript, cookiebanners eller insamlingsformulär ingår.

Officiell dokumentation: <https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-content-to-your-github-pages-site-using-jekyll>

## Namngivningsregel

Mappar, filer och URL-sökvägar namnges på **engelska** (exempel: `articles/`, `_posts/`, `news-guide.md`). Text som besökaren ser, såsom rubriker, nyhetskategorier och menyval, är på **svenska**. `_posts` och `_layouts` behåller sina Jekyll-standardnamn.
