import {RezkaApi} from "./RezkaApi.js";

const main = async () => {
    // Create object
    const rezka = new RezkaApi();

    // Search by query
    const results = await rezka.search("мистер робот")

    await rezka.parse(results[0].url);
    console.log(rezka.thumbnail());

    // Get translations
    const translations = rezka.translations();

    console.log("Translations: ")
    translations.forEach(translation => {
       console.log(translation.title);
    });
    console.log("\n");

    // If serial - get seasons
    const seasons = rezka.seasons();

    seasons.forEach(season => {
        console.log(`Season ${season.id} series: `)
        rezka.seasonSeries(season.id).forEach(series => {
            console.log(series.title);
        });

        console.log("\n");
    });

    // Get stream urls
    const urls = await rezka.getStreamSeries(1, 1, translations[0].id);
    console.log(urls);
}

main()