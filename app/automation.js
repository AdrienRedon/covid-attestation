const puppeteer = require('puppeteer');

const getCurrentDate = () => {
    const date_ob = new Date();

    return {
        date: ('0' + date_ob.getDate()).slice(-2),
        month: ('0' + (date_ob.getMonth() + 1)).slice(-2),
        year: date_ob.getFullYear(),
        hours: ('0' + date_ob.getHours()).slice(-2),
        minutes: date_ob.getMinutes(),
    };
}

/**
 * 
 * @param {Object} requestData
 * @param {string} requestData.firstname
 * @param {string} requestData.lastname
 * @param {string} requestData.birthday
 * @param {string} requestData.placeofbirth
 * @param {string} requestData.address
 * @param {string} requestData.city
 * @param {string} requestData.zipcode
 */
const generate = async (requestData) => {

    const formData = {
        ...requestData,
        ...getCurrentDate(),
    };
    console.log(formData);
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
  
    await page.goto('https://media.interieur.gouv.fr/deplacement-covid-19/');
  
    await page.type('#field-firstname', formData.firstname);
    await page.type('#field-lastname', formData.lastname);
    await page.type('#field-birthday', formData.birthday);
    await page.type('#field-placeofbirth', formData.placeofbirth);
    await page.type('#field-address', formData.address);
    await page.type('#field-city', formData.city);
    await page.type('#field-zipcode', formData.zipcode);
    await page.type('#field-datesortie', `${formData.date}/${formData.month}/${formData.year}`);
    await page.type('#field-heuresortie', `${formData.hours}:${formData.minutes}`);
    await page.click('#checkbox-sport_animaux');
    
    await page.click('#generate-btn');
  
    await page.waitForNavigation();
    console.log('New Page URL:', page.url());
    await browser.close();
  };

module.exports = generate;