import logger from 'jet-logger';
const moment = require('moment');

/**
 * Print an error object if it's truthy. Useful for testing.
 * 
 * @param err 
 */
export function pErr(err?: Error): void {
    if (!!err) {
        logger.err(err);
    }
};


/**
 * Get a random number between 1 and 1,000,000,000,000
 * 
 * @returns 
 */
export function getRandomInt(): number {
    return Math.floor(Math.random() * 1_000_000_000_000);
};


export function getCurrentDate(){
    const dt = new Date();
    const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

    return `${
        padL(dt.getMonth()+1)}/${
        padL(dt.getDate())}/${
        dt.getFullYear()} ${
        padL(dt.getHours())}:${
        padL(dt.getMinutes())}:${
        padL(dt.getSeconds())}`

}

var rand = function() {
    return Math.random().toString(36).substr(2); 
};

var token = function() {
    return rand() + rand() + rand() + "-" + rand() + rand() + rand(); 
};

export function createToken(){
    return token();
}

// Verilen tarihi ay ve yıl olarak biçimlendirir
// '2023-10'
export function formatTarih(tarih) {
    const ayYil = new Date(tarih);
    const ayAdi = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(ayYil);
    const yil = ayYil.getFullYear();

    return ayAdi + ' ' + yil;
}

export function currentTimestamp(){
    return moment().format("YYYY-MM-DD HH:mm:ss");
}