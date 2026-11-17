# Rossolution Toolbox – utvecklarguide

## Översikt

`/tools/` är verktygskatalogen och varje verktyg har en egen GitHub Pages-kompatibel URL (`/tools/<slug>/`). Alla sidor använder samma Jekyll-layout och gemensam CSS.

- `_data/tools.yml`: katalog, kort på startsidan och sökbar lista.
- `_layouts/tool.html`: gemensamt skal för varje verktyg.
- `tools/<slug>/index.html`: formulär och hjälpinformation för ett verktyg.
- `assets/js/tools-core.mjs`: rena funktioner utan DOM eller nätverksanrop.
- `assets/js/tools-ui.mjs`: användargränssnitt, formulär, urklipp och felhantering.
- `tests/tools-core.test.mjs`: enhetstester. Kräver Node.js 20+.
- `.github/workflows/test-tools.yml`: GitHub Actions för att köra enhetstester vid ändringar. Körningen är separat från GitHub Pages-publiceringen.

## Lägg till ett nytt verktyg

1. Lägg till en post i `_data/tools.yml` med `slug`, `title`, `category`, `code`, `description` och `featured`.
2. Skapa `tools/<slug>/index.html` med YAML front matter, `layout: tool`, `permalink: /tools/<slug>/` och `tools_js: true`.
3. Implementera logik i `tools-core.mjs` och koppla den i `tools-ui.mjs`.
4. Skriv tester för lyckade och felaktiga indata.
5. Testa med `node --test tests/tools-core.test.mjs`, kör Jekyll-bygge och verifiera HTTPS-hostad publicering.

## Säkerhet och integritet

Verktygen använder ingen extern API och sparar inte inmatningen i cookies, Local Storage eller på servern. De kan däremot synas i webbläsarens aktiva fönster och i urklippet när man kopierar. Genererade lösenord och UUID använder Web Crypto API. Använd `textContent`, inte `innerHTML`, för användargenererad text.

Undvik att skicka sekretessbelagd information till en obetrodd webbplats även när den uppger sig arbeta lokalt.

## Publicering

De nya filerna fungerar med Jekyll och GitHub Pages och kräver ingen databas eller backend. Installera inte `.nojekyll` eftersom projektet använder Jekylls `_data`, `_layouts` och Liquid-taggar. Kontrollera att GitHub Pages är konfigurerat att bygga Jekyll-sidan och att anpassad domän/CNAME kvarstår.
