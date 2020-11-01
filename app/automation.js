const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * 
 * @return {Object} date_obj
 * @return {string} date_obj.date
 * @return {string} date_obj.month
 * @return {string} date_obj.year
 * @return {string} date_obj.hours
 * @return {string} date_obj.minutes
 */
const getCurrentDate = () => {
    const date_ob = new Date();

    return {
        date: ('0' + date_ob.getDate()).slice(-2),
        month: ('0' + (date_ob.getMonth() + 1)).slice(-2),
        year: '' + date_ob.getFullYear(),
        hours: ('0' + date_ob.getHours()).slice(-2),
        minutes: '' + date_ob.getMinutes(),
    };
}

const getAddress = async (lat, lon) => {
    try {
        const response = await axios.get(`https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`)
        return {
            address: response.data.features[0].properties.name,
            city: response.data.features[0].properties.city,
            zipcode: response.data.features[0].properties.postcode,
        }
    } catch (e) {
        console.error(e)
        return;
    }

}

/**
 * 
 * @param {Object} requestData
 * @param {string} requestData.firstname
 * @param {string} requestData.lastname
 * @param {string} requestData.birthday
 * @param {string} requestData.placeofbirth
 */
const generate = async (requestData) => {

    const dateData = getCurrentDate();
    const addressData = requestData.lat != null && requestData.lon != null
       ? await getAddress(requestData.lat, requestData.lon)
       : null;

    console.log(addressData)

    const formData = {
        ...requestData,
        ...dateData,
        ...addressData,
    };
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.join(__dirname, '..', 'public', 'attestations'),
    });

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

const orderReccentFiles = (dir) =>
  fs.readdirSync(dir)
    .filter(f => fs.lstatSync(path.join(dir,f)).isFile())
    .map(file => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

const getMostRecentFile = (dir) => {
  const files = orderReccentFiles(dir);
  return files.length ? files[0] : undefined;
};

module.exports = { generate, getMostRecentFile };
