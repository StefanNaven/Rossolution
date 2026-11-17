# Rossolution – webbplats

Responsiv, statisk webbplats för GitHub Pages med Jekyll och Markdown-baserade artiklar. Webbplatsen presenterar Rossolution som **Technical Solution Architect & IT Specialist** – teknisk lösningsarkitektur i kombination med praktisk IT-specialistkompetens.

## Struktur

- `index.html` – startsida med expertis, arbetssätt, artiklar, om och kontakt.
- `articles/index.html` – artikellista med kategorifilter.
- `_posts/` – artiklar som Markdown (nya artiklar hamnar automatiskt i flödet).
- `_layouts/` – gemensamt sidhuvud/sidfot och artikelmall.
- `assets/` – CSS, JavaScript och egenproducerade vektorbilder.
- `feed.xml` – RSS-flöde som byggs automatiskt.
- `_config.yml` – Jekyll-konfiguration.
- `CNAME` – befintlig domän för GitHub Pages.

**Börja i [news-guide.md](news-guide.md)** för att lägga till en nyhet.

Förhandsgranskning av Jekyll-sidor lokalt kräver Jekyll-build. Att dubbelklicka på källfilen `index.html` visar inte den färdiga sidan, eftersom GitHub Pages behöver rendera Liquid-taggarna.
