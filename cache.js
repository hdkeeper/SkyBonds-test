'use strict';

// Реализация http.post для тестов
const http = {
    queryCount: 0,
    itemCount: 0,
    post: ({ body }) => {
        http.queryCount++;
        http.itemCount += body.length;
        console.log(`Загружаем ISIN: ${body}...`);

        return Promise.resolve(body.map(isin => ({
            isin,
            data: { amt: 1 }
        })));
    }
}


/* Структура кэша
    {
        date: {
            isin1: { ... },
            isin2: { ... },
            ...
        },
        ...
    }
*/
const cache = {};

const getBondsData = async ({ date, isins }) => {
    // Ищем в кэше запрошенные данные
    const result = [];
    const foundIsin = new Set();
    let needFetch = false;

    for (let isin of isins) {
        if (cache[date] && cache[date][isin]) {
            foundIsin.add(isin);
            result.push(cache[date][isin]);
        }
        else {
            result.push(null);
            needFetch = true;
        }
    }

    // Проверяем, всё ли нашли
    if (!needFetch) {
        return result;
    }

    // Запросить недостающие данные
    const isinsToFetch = isins.filter(isin => !foundIsin.has(isin));
    const fetchedData = await http.post({
        url: `/bonds/${date}`,
        body: isinsToFetch
    });

    // Записать загруженные данные в кэш
    if (cache[date] === undefined) {
        cache[date] = {};
    }
    for (let fd of fetchedData) {
        cache[date][fd.isin] = fd;
    }
    
    // Объединить данные из кэша и загруженные данные
    for (let rIdx = 0, fdIdx = 0; rIdx < result.length; rIdx++) {
        if (result[rIdx] === null) {
            result[rIdx] = fetchedData[fdIdx];
            fdIdx++;
        }
    }

    return result;
};


// Тесты

const myTests = [
    {
        query: { date: '20180120', isins: ['AAA', 'BBB'] },
        expect: { queryCount: 1, itemCount: 2 }
    },
    {
        query: { date: '20180120', isins: ['BBB', 'CCC'] },
        expect: { queryCount: 2, itemCount: 3 }
    },
    {
        query: { date: '20180120', isins: ['CCC', 'AAA'] },
        expect: { queryCount: 2, itemCount: 3 }
    },
    {
        query: { date: '20190606', isins: ['AAA', 'BBB', 'CCC'] },
        expect: { queryCount: 3, itemCount: 6 }
    }
];

(async function() {
    for (let { query, expect } of myTests) {
        console.log('Запрос:', query);
        const reply = await getBondsData(query);
        console.log('Ответ:', reply);

        // Проверить ответ
        let ok = true;
        for (let i = 0; i < query.isins.length; i++) {
            if (!(reply[i] && query.isins[i] === reply[i].isin)) {
                ok = false;
                break;
            }
        }
        if (!ok) {
            console.log('Ошибка!\n');
            continue;
        }

        // Проверить счетчики запросов
        console.log('Состояние:', {
            queryCount: http.queryCount,
            itemCount: http.itemCount            
        });
        console.log('Ожидалось:', expect);
        console.log((http.queryCount === expect.queryCount
            && http.itemCount === expect.itemCount)
            ? 'Успешно' : 'Ошибка!');
        console.log();
    }
})();
