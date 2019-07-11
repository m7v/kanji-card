const request = require("request");
const fs = require('fs');
const jsdom = require("jsdom");

const { JSDOM } = jsdom;
const page = 1;
const pageSize = 20;
const levels = ['jlpt-n5', 'jlpt-n4', 'jlpt-n3', 'jlpt-n2', 'jlpt-n1'];

const levelMapper = {
    'jlpt-n5': 'n5',
    'jlpt-n4': 'n4',
    'jlpt-n3': 'n3',
    'jlpt-n2': 'n2',
    'jlpt-n1': 'n1',
};

const buildPageUrl = (l, p) => `https://jisho.org/search/%23${l}%20%23kanji?page=${p}`;

const parseCountResult = (html) => {
    const dom = new JSDOM(html);
    const list = dom.window.document.querySelector('.result_count').textContent;
 
    return list.match(/(\d+)/)[0];
}

const parseKanji = (html, kanjiList, level) => {
    const dom = new JSDOM(html);

    const list = dom.window.document.querySelectorAll('.entry.kanji_light.clearfix');
    list.forEach((item) => {
        const sign = item.querySelector('.character.literal.japanese_gothic a').text.trim();
        const kun = item.querySelector('.kun.readings');
        const on = item.querySelector('.on.readings');
        const meaning = item
            .querySelector('.meanings.english.sense')
            .textContent
            .trim()
            .replace(/\s+/g, ' ');

        kanjiList.push({
            sign,
            kun: kun ? kun.textContent.trim().replace(/\s+/g, ' ') : '',
            on: on ? on.textContent.trim().replace(/\s+/g, ' ') : '',
            meaning,
            tags: [
                levelMapper[level],
            ]
        });
    });

    return kanjiList;
};

const extractKanjiByLevel = (level) => {
    let kanjiList = [];
    return new Promise((fullfil) => {
        request(`https://jisho.org/search/%23${level}%20%23kanji`, (error, _, body) => {
            if (error) {
                console.log(error);
                return;
            }
            const promises = [];
            const count = parseCountResult(body);
            const pages = Math.ceil(count / pageSize);
            // console.log(`Need to parse ${count} pages for level ${level}`);

            for (let currentPage = page; currentPage <= pages; currentPage++) {
                const p = new Promise((resolve) => {
                    request(buildPageUrl(level, currentPage), (error, _, body) => {
                        if (error) {
                            console.log(error);
                            return resolve();
                        }
                        // console.log(`Page ${currentPage} starting parse`);
                        kanjiList = parseKanji(body, kanjiList, level);
                        // console.log(`Page ${currentPage} finished parse`);
                        // console.log(`Items parsed: ${kanjiList.length}`);

                        return resolve();
                    })
                });
                promises.push(p);
            }

            Promise
                .all(promises)
                .then(() => {
                    console.log(`Total items ${kanjiList.length} for level ${level}`);
                })
                .then(() => fullfil({
                    level,
                    kanjiList,
                 }));
        });
    });
}

const promises = levels.map(level => extractKanjiByLevel(level));
Promise.all(promises).then((allLevels) => {
    const items = allLevels.reduce((arr, level) => arr.concat(level.kanjiList), []);
    const normalizedItems = items.reduce((acc, item) => {
        const itemId = item.sign.charCodeAt();
        acc[itemId] = {
            ...item,
            id: itemId,
        };
        return acc;
    }, {});

    fs.writeFile('../public/kanjiList.json', JSON.stringify({ items: normalizedItems }), (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(`Total items ${items.length} for all levels`);
        console.log("The file was saved!");
    }); 
})
