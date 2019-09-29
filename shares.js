'use strict';

const input0 = [
    '1.5',
    '3',
    '6',
    '1.5'
];

const input1 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const input2 = ['10', '10', '10'];

/*
for (let i = 0; i < 5e6; i++) {
    input0.push(Math.random() * 20);
}
*/

const toFloat = s => {
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
}

const getPercents = shares => {
    // Рассчитать сумму всех долей
    const sum = shares.reduce( (sum, s) => sum + toFloat(s), 0);

    // Рассчитать процент каждой доли от общей суммы
    return shares.map(s => (
        sum ? (100 * toFloat(s) / sum) : 0
    ).toFixed(3));
}


// Тесты

const myTests = [
    [input0, '12.500,25.000,50.000,12.500'],
    [input1, '0.000,1.818,3.636,5.455,7.273,9.091,10.909,12.727,14.545,16.364,18.182'],
    [input2, '33.333,33.333,33.333']
];

for (let [input, output] of myTests) {
    console.log('Вход:', input);
    const result = getPercents(input).toString();
    console.log('Результат:', result);
    console.log('Ожидалось:', output);
    console.log(result === output ? 'Успешно' : 'Ошибка!');
    console.log();
}
