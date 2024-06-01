const functions = require('firebase-functions');
const puppeteer = require('puppeteer');

exports.scrapeEvents = functions.https.onRequest(async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('https://villageunderground.co.uk/events/', { waitUntil: 'networkidle2' });

        const events = await page.evaluate(() => {
            const eventElements = document.querySelectorAll('.list--events__item');
            const scrapedEvents = [];

            eventElements.forEach(element => {
                const titleElement = element.querySelector('.list--events__item__title');
                const dateElement = element.querySelector('.list--events__item__dates');
                const linkElement = element.querySelector('a');

                const title = titleElement ? titleElement.innerText.trim() : null;
                const date = dateElement ? dateElement.innerText.trim() : null;
                const link = linkElement ? linkElement.href : null;

                if (title && date) {
                    scrapedEvents.push({
                        title,
                        date,
                        link
                    });
                }
            });

            return scrapedEvents;
        });

        await browser.close();
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to scrape events' });
    }
});
