const request = require('request');
const async = require('async');
const cron = require('node-cron');
const NodeCache = require('node-cache');
const cache = new NodeCache();
require('dotenv').config();

const { Client, GatewayIntentBits, RichEmbed } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
    console.log(`Discord Logged in as ${client.user.tag}!`);
    cron.schedule('*/30 * * * * *', function () {
        console.log('---------------------');
        console.log('Running Cron Job');
        request(options, async function (error, response, body) {
            if (error) {
                return console.error(error.message);
            }

            if (response.statusCode != 200) {
                return;
            }
            // console.log(body);
            if (body) {
                const ads = JSON.parse(body).ads;

                async.each(
                    ads,
                    async (ad, callback) => {
                        if (cache.get(ad.ad_id) != undefined) {
                            console.log(`Already sent: ${ad.ad_id}`);
                            return;
                        }

                        cache.set(ad.ad_id, true);
                        let image =
                            ad.image ||
                            'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';
                        const channel = await client.channels.fetch(
                            process.env.CHANEL_ID
                        );
                        console.log('ads', image);
                        channel
                            .send({
                                content: `
          ==========================================\n**${ad.subject}**\n***${ad.price_string}***\n*${ad.area_name} - ${ad.region_name}*\n*${ad.body}*\n*https://xe.chotot.com/mua-ban-xe-may-quan-tan-phu-tp-ho-chi-minh/${ad.list_id}.htm*
        `,
                                files: [`${image}?file=file.png`],
                            })
                            .then(() => {
                                return console.log('Send Message Successfully');
                            })
                            .catch((err) => {
                                console.log(
                                    `Send to discord err: ${err.message}`
                                );
                                console.log(ad);
                                return callback();
                            });
                    },
                    (err) => {}
                );
            }
        });
    });
});

client.on('message', (msg) => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
});

client.login(process.env.TOKEN_BOT);

var options = {
    method: 'GET',
    url: 'https://gateway.chotot.com/v1/public/ad-listing',
    qs: {
        region_v2: '13000',
        area_v2: '13113',
        cg: '2020',
        q: 'sh',
        page: '1',
        sp: '0',
        f: 'protection_entitlement',
        st: 's,k',
        limit: '20',
        protection_entitlement: 'true',
        key_param_included: 'true',
    },
    headers: {
        'Postman-Token': '513bb4d8-22b2-44c6-b830-aa612fd2e2e3',
        'cache-control': 'no-cache',
    },
};
