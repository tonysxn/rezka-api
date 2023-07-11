import {RezkaApi} from "./RezkaApi.js";

const main = async () => {
    // Create and init parser
    const rezka = new RezkaApi("https://rezka.ag/series/thriller/9364-mister-robot-2015.html")
    await rezka.init();

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