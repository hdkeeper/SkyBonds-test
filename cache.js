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

    isins.forEach(isin => {
        if (cache[date] && cache[date][isin]) {
            foundIsin.add(isin);
            result.push(cache[date][isin]);
        }
    });

    // Проверяем, всё ли нашли
    if (result.length === isins.length) {
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
    fetchedData.forEach(fd => cache[date][fd.isin] = fd);

    // Теперь кэш содержит нужные данные
    return getBondsData({ date, isins });
};


// Тесты

const tests = [
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
    for (let { query, expect } of tests) {
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
