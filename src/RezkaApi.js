import nodeHtmlParser from 'node-html-parser';
import axios from "axios";
import base64 from "base-64";
import {product} from "./utils.js";

export class RezkaApi {
    parse = async (url) => {
        if (!url) {
            throw new Error("URL is required");
        }
        if (!url.includes("https://rezka.ag/") || !url.includes(".html")) {
            throw new Error("Incorrect url");
        }

        this.url = url;

        const response = await axios.get(this.url);

        if (response.status !== 200) {
            throw new Error("Failed to download the page");
        }

        this.page = response.data;
        this.root = nodeHtmlParser.parse(this.page);
    }

    search = async (query) => {
        let results = [];

        const response = await axios.post(
            'https://rezka.ag/engine/ajax/search.php',
            new URLSearchParams({
                'q': query
            })
        );

        if (response.status !== 200) {
            throw new Error("Failed to get search results");
        }

        const root = nodeHtmlParser.parse(response.data);
        const searchResultsTags = root.getElementsByTagName("li");

        searchResultsTags.forEach(searchResultsTag => {
            const url = searchResultsTag.querySelector("a").getAttribute("href");
            const title = searchResultsTag.querySelector(".enty").innerText.trim();

            results.push({url, title});
        });

        return results;
    }

    id = () => {
        return this.root.getElementById("user-favorites-holder").getAttribute("data-post_id");
    }

    title = () => {
        return this.root.querySelector(".b-post__title").innerText.trim();
    }

    description = () => {
        return this.root.querySelector(".b-post__description_text").innerText.trim();
    }

    origTitle = () => {
        return this.root.querySelector(".b-post__origtitle").innerText.trim();
    }

    infoLast = () => {
        return this.root.querySelector(".b-post__infolast").innerText.trim();
    }

    info = () => {
        let ready = [];
        const table = this.root.querySelector(".b-post__info");

        const rows = table.getElementsByTagName("tr");

        rows.forEach(row => {
            const key = row.querySelector("h2").innerText ?? null;
            const tdElements = row.getElementsByTagName("td");

            if (tdElements.length === 2) {
                const value = tdElements[1].innerText.trim();
                ready.push({key, value});
            }
        });

        return ready;
    }

    translations = () => {
        const translationsRoot = this.root.getElementById("translators-list");
        const translationTags = translationsRoot.getElementsByTagName("li");

        let translations = [];

        translationTags.forEach(translationTag => {
            const translationId = translationTag.getAttribute("data-translator_id");
            const translationTitle = translationTag.getAttribute("title");

            translations.push({
                id: translationId,
                title: translationTitle
            });
        });

        return translations;
    }

    thumbnail = () => {
        const thumbnailRoot = this.root.querySelector(".b-sidecover");
        return thumbnailRoot.querySelector("img").getAttribute("src");
    }

    seasons = () => {
        const seasonsRoot = this.root.getElementById("simple-seasons-tabs");
        try {
            const seasonsTags = seasonsRoot.getElementsByTagName("li");

            let seasons = [];

            seasonsTags.forEach(seasonTag => {
                const seasonId = seasonTag.getAttribute("data-tab_id");
                const seasonTitle = seasonTag.innerText.trim();

                seasons.push({
                    id: seasonId,
                    title: seasonTitle
                });
            });

            return seasons;
        } catch (e) {
            throw new Error("This movie type has no seasons");
        }
    }

    seasonSeries = (seasonId) => {
        const seriesRoot = this.root.getElementById(`simple-episodes-list-${seasonId}`);
        const seriesTags = seriesRoot.getElementsByTagName("li");

        let series = [];

        seriesTags.forEach(seriesTag => {
            const episodeId = seriesTag.getAttribute("data-episode_id");
            const id = seriesTag.getAttribute("data-id");
            const title = seriesTag.innerText.trim();

            series.push({
                id: id,
                episodeId: episodeId,
                title: title
            });
        });

        return series;
    }

    getStreamMovie = async (translationId) => {
        let response = await this.#makeRequest({
            id: this.id(),
            translator_id: translationId,
            action: "get_movie"
        });

        try {
            return this.#getUrlsFromText(this.#decodeResponse(response.url));
        } catch (e) {
            throw new Error("An error has occurred, please check your params");
        }
    }

    getStreamSeries = async (season, episode, translationId) => {
        let response = await this.#makeRequest({
            id: this.id(),
            translator_id: translationId,
            season: season,
            episode: episode,
            action: "get_stream"
        });

        try {
            return this.#getUrlsFromText(this.#decodeResponse(response.url));
        } catch (e) {
            throw new Error("An error has occurred, please check your params");
        }
    }

    #makeRequest = async (data) => {
        const response = await axios.post("https://rezka.ag/ajax/get_cdn_series/", data, {
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            }
        });

        if (response.status !== 200) {
            throw new Error("Failed to get stream");
        }

        return response.data;
    }

    #decodeResponse = (data) => {
        const trashList = ["@", "#", "!", "^", "$"];
        let decodedString = data.replace("#h", "").split("//_//").join("")

        for (let i = 2; i < 4; i++) {
            const combos = product(trashList, i);

            for (let i = 0; i < combos.length; i++) {
                let chars = Buffer.from(combos[i].join(''), 'utf8');
                const encoded = base64.encode(chars.toString());

                if (decodedString.includes(encoded)) {
                    decodedString = decodedString.replaceAll(encoded, '');
                }
            }
        }

        decodedString += "==";

        return Buffer.from(decodedString.toString('utf8'), 'base64').toString('utf8');
    }

    #getUrlsFromText = (text) => {
        let urls = [];
        const exploded = text.split(',');

        exploded.forEach(el => {
            const quality = el.split(']')[0].replace('[', '');
            urls[quality] = el.split(' ')[el.split(' ').length - 1];
        });

        return urls;
    }
}