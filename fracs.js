'use strict';

const toFloat = s => {
    const n = parseFloat(s);
    if (Number.isNaN(n)) {
        throw new TypeError('Not a number');
    }
    return n;
}

const getPercents = shares => {
    // Рассчитать сумму всех долей
    const sum = shares.reduce((sum, s) => sum + toFloat(s), 0);

    if (sum === 0) {
        return (0).toFixed(3);
    }

    // Рассчитать процент каждой доли от общей суммы
    const multiplier = 100 / sum;
    return shares.map(s => (multiplier * toFloat(s)).toFixed(3));
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
        input: ['10','10','10'],
        expect: ['33.333','33.333','33.333']
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
