const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('YOUR TELEGRAM API HERE');

const apiKey = 'YOUR CRYPTOCOMPARE API HERE';

bot.command('start', ctx => {
    sendStartMsg(ctx);
})

bot.action("start", ctx => {
    ctx.deleteMessage();
    sendStartMsg(ctx);
})

bot.action("price", ctx => {
    let priceMsg = "Get Price Information. Select one of the crypto below."
    ctx.deleteMessage();
    bot.telegram.sendMessage(ctx.chat.id, priceMsg, 
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "BTC", callback_data: "price-BTC" },
                        { text: "ETH", callback_data: "price-ETH" }
                    ],
                    [
                        { text: "XTZ", callback_data: "price-XTZ" }
                    ],
                    [
                        { text: "Back to Menu", callback_data: "start" }
                    ]
                ]
            }
        })
})

function sendStartMsg(ctx) {
    let startMessage = "Welcome, this bot gives you cryptocurrency information";
    bot.telegram.sendMessage(ctx.chat.id, startMessage, 
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Crypto Prices", callback_data: "price" }
                    ],
                    [
                        { text: "CoinMarketCap", url: "https://coinmarketcap.com/" } 
                    ],
                    [
                        { text: "Bot Info", callback_data: "info" } 
                    ]
                ]
            }
        })
}

let priceActionList = ["price-BTC", "price-ETH", "price-XTZ"];

bot.action(priceActionList, async ctx => {
    let symbol = ctx.match.split("-")[1];
    try {
        let res = await axios.get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbol}&tsyms=USD&api_key=${apiKey}`);

        let data = res.data.DISPLAY[symbol].USD
        let message = 
        `
        Symbol = ${symbol}
        Price = ${data.PRICE}
        Open = ${data.OPENDAY}
        High = ${data.HIGHDAY}
        Low = ${data.LOWDAY}
        Supply = ${data.SUPPLY}
        Market Cap = ${data.MKTCAP}
        `;

        ctx.deleteMessage();
        bot.telegram.sendMessage(ctx.chat.id, message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Back to Prices", callback_data: "price"}
                    ]
                ]
            }
        })
    } catch (err) {
        console.log(err);
        ctx.reply("Error encountered");
    }
    
})

bot.action('info', ctx => {
    ctx.answerCbQuery();
    bot.telegram.sendMessage(ctx.chat.id, "Bot info", {
        reply_markup: {
            keyboard: [
                [
                    { text: "Credits"},
                    { text: "API"}
                ],
                [
                    { text: "Remove Keyboard"}
                ]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    })  
})

bot.hears("Credits", ctx => {
    ctx.reply('This bot was made by ya boi ethan so');
})

bot.hears("API", ctx => {
    ctx.reply('This bot uses cryptocompare API');
})

bot.hears("Remove Keyboard", ctx => {
    bot.telegram.sendMessage(ctx.chat.id, "Removed Keyboard", 
    {
        reply_markup: {
            remove_keyboard: true
        }
    })
})

bot.launch();
