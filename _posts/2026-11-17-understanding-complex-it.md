---
title: "Att skapa överblick i en komplex IT-miljö"
description: "När flera system är beroende av varandra blir kartläggning ofta ett viktigare första steg än ytterligare en punktinsats."
category: Infrastruktur
image: /assets/images/news-architecture.svg
image_alt: "Illustration av sammankopplade tekniska system i en hybrid IT-miljö"
---

När något slutar fungera är det naturligt att börja i den komponent där felet märks. Men i större IT-miljöer uppstår problemen ofta i samspelet mellan olika delar: identitet, nätverk, certifikat, klienter och tjänster.

## Börja med beroendena

En bra start är att skapa en enkel bild av hur tjänsten faktiskt fungerar. Vilka system deltar? Var sker autentisering och auktorisering? Vilka nätverksvägar används? Var går det att hitta spår i loggarna?

Det behöver inte bli ett omfattande arkitekturdokument. En tydlig skiss över flödet kan räcka för att se var felsökningen bör börja.

## Felsök utifrån det som går att verifiera

Antaganden är lätta att göra när man känner en plattform väl. Men när ett problem spänner över flera leverantörer blir observationer viktigare än gissningar.

- Avgränsa vilken del av flödet som fungerar respektive inte fungerar.
- Matcha tidsstämplar mellan berörda system.
- Ändra en sak i taget och verifiera utfallet.
- Dokumentera inte bara lösningen, utan också orsaken.

## Ett bättre utgångsläge nästa gång

Den största nyttan med en genomtänkt felsökning är inte alltid att incidenten blir löst. Det är också att nästa person kan förstå beroendena snabbare och att samma fel blir enklare att förebygga.

*Det här är ett exempel på den typ av tekniska artiklar som kan publiceras på Rossolution.*
