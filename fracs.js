'use strict';

const toFloat = (s) => {
    const n = parseFloat(s);
    if (Number.isNaN(n)) {
        throw new TypeError('Not a number');
    }
    return n;
}

const toString = (n) => (n).toFixed(3);

const getPercents = fracs => {
    // Рассчитать сумму всех долей
    const sum = fracs.reduce((sum, s) => sum + toFloat(s), 0);

    // Особый случай
    if (sum === 0) {
        return fracs.map(() => toString(0));
    }

    // Рассчитать процент каждой доли от общей суммы
    const multiplier = 100 / sum;
    return fracs.map(s => toString(multiplier * toFloat(s)));
}


// Тесты

const tests = [
    {
        input: ['1.5','3','6','1.5'],
        expect: ['12.500','25.000','50.000','12.500']
    },
    {
        input: ['0','1','2','3','4','5','6','7','8','9','10'],
        expect: ['0.000','1.818','3.636','5.455','7.273','9.091','10.909','12.727','14.545','16.364','18.182']
    },
    {
        input: ['1','1','1'],
        expect: ['33.333','33.333','33.333']
    },
    {
        input: ['0','0','0'],
        expect: ['0.000','0.000','0.000']
    }
];

const timeTest = () => {
    const input = [];
    for (let i = 0; i < 1e7; i++) {
        input.push(Math.random() * 10);
    }

    const start = Date.now();
    getPercents(input);
    console.log('Прошло мс:', Date.now() - start);
};

tests.forEach(({ input, expect }) => {
    try {
        console.log('Вход:', input);
        const result = getPercents(input);
        console.log('Результат:', result);
        console.log('Ожидалось:', expect);
        console.log((result.toString() === expect.toString()) ? 'Успешно' : 'Ошибка!');
        console.log();
    }
    catch (ex) {
        console.error(ex.toString());
        console.log('Ошибка!\n');
    }
});

// timeTest();
