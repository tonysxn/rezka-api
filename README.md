# rezka.ag parser

npm package to parse rezka.ag website

## Installation

```
npm i rezka-api
```

## Usage

```
// Initialize object
const rezka = new RezkaApi();

// Search
const results = await rezka.search("mr robot")

// Parse page
await rezka.parse(url);

// After parse next methods available:
id() - get id
title() - get title
origTitle() - get original title
descriptino() - get description
infoLast() - get last release date
info() - get info object (from table like released date and etc.)
translations() - get available translations
thumbnail() - get poster image
seasons() - get seasons if type is serial
seasonSeries(seasonId) - get season series if type is serial

// Get stream
getStreamMovie(translationId) - get stream url if type is movie
getStreamSeries(season, episode, translationId) - get stream url if type is serial
```