# Rossolution – webbplats

Responsiv, statisk webbplats för GitHub Pages med Jekyll och Markdown-baserade artiklar. Webbplatsen presenterar Rossolution som **Technical Solution Architect & IT Specialist** – teknisk lösningsarkitektur i kombination med praktisk IT-specialistkompetens.

## Struktur

- `index.html` – startsida med expertis, arbetssätt, IT-verktyg, artiklar, om och kontakt.
- `articles/index.html` – artikellista med kategorifilter.
- `tools/` – interaktiva IT-verktyg som körs helt i webbläsaren.
- `_data/tools.yml` – förteckning över verktyg och kort på startsidan.
- `tests/` – automatiska tester av verktygens beräkningslogik.
- `_posts/` – artiklar som Markdown (nya artiklar hamnar automatiskt i flödet).
- `_layouts/` – gemensamt sidhuvud/sidfot och artikelmall.
- `assets/` – CSS, JavaScript och egenproducerade vektorbilder.
- `feed.xml` – RSS-flöde som byggs automatiskt.
- `_config.yml` – Jekyll-konfiguration.
- `CNAME` – befintlig domän för GitHub Pages.

**Börja i [news-guide.md](news-guide.md)** för en nyhet eller [tools-guide.md](tools-guide.md) för IT-verktygen.

Testa kärnfunktionerna med `node --test tests/tools-core.test.mjs`. Tester körs även med GitHub Actions vid relevanta pushar och pull requests. Dessa tester är inte samma sak som en Jekyll-byggning.

Förhandsgranskning av Jekyll-sidor lokalt kräver Jekyll-build. Att dubbelklicka på källfilen `index.html` visar inte den färdiga sidan, eftersom GitHub Pages behöver rendera Liquid-taggarna.
