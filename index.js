const core = require('@actions/core');
const axios = require('axios');
const qs = require('qs');
const day = require('dayjs');
import TelegramBot from "node-telegram-bot-api";

const NOW_DATE = new Date();
const FORM_INFO = {
    name: process.env["FORM_NAME"],
    stdID: process.env["FORM_STDID"],
    dep: process.env["FORM_DEP"],
    phone: process.env["FORM_PHONE"],
    where: process.env["FORM_WHERE"],
    why: process.env["FORM_WHY"],
    when: {
        startTime: day(NOW_DATE).format('YYYY-MM-DD') + "T16:01:00.000Z",
        endTime: day(NOW_DATE).add(1, 'day').format('YYYY-MM-DD') + "T15:59:59.000Z",
        timeZone: day(NOW_DATE).add(1, 'day').format('YYYY-MM-DD') + "T00:00:00+08:00",
    },
    campus: {
        name: process.env["FORM_CAMPUS"],
        value: process.env["FORM_CAMPUS"] === "西土城校区" ? "2" : "1",
    },
    teacher: {
        uid: parseInt(process.env["FORM_TEACHER_UID"]),
        name: process.env["FORM_TEACHER_NAME"],
        number: process.env["FORM_TEACHER_NUMBER"],
    }
}
let formDataObj = {
    "app_id": "578",
    "node_id": "",
    "form_data": {
        "1716": {
            "User_5": FORM_INFO.name,
            "User_7": FORM_INFO.stdID,
            "User_9": FORM_INFO.dep,
            "User_11": FORM_INFO.phone,
            "Alert_65": "",
            "Alert_67": "",
            "Input_28": FORM_INFO.where,
            "Radio_52": {"value": "1", "name": "本人已阅读并承诺"},
            "Calendar_47": FORM_INFO.when.endTime,
            "Calendar_50": FORM_INFO.when.startTime,
            "Calendar_62": FORM_INFO.when.timeZone,
            "SelectV2_58": [{"name": FORM_INFO.campus.name, "value": FORM_INFO.campus.value, "default": 0, "imgdata": ""}],
            "Validate_63": "",
            "Validate_66": "",
            "MultiInput_30": FORM_INFO.why,
            "UserSearch_60": {"uid": FORM_INFO.teacher.uid, "name": FORM_INFO.teacher.name},
            "UserSearch_73": {"uid": FORM_INFO.teacher.uid, "name": FORM_INFO.teacher.name, "number": FORM_INFO.teacher.number}
        }
    },
    "userview": 1
}
const PREFIX_URL_SERVICE = 'https://service.bupt.edu.cn';
const POST_APPLY = 'site/apps/launch';
const COOKIE = process.env["COOKIE"];
const DATA = {
    data: JSON.stringify(formDataObj),
    agent_uid: "",
    starter_depart_id: "181789",
    test_uid: "0",
};
const chatId = process.env["TG_CHAT_ID"];
const botToken = process.env["TG_BOT_TOKEN"];

axios.post(
    POST_APPLY,
    qs.stringify(DATA),
    {
        baseURL: PREFIX_URL_SERVICE,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'cookie': COOKIE,
        },
    }
).then(res => {
    console.log(res.data);
    (async () => {
        if (!!chatId && !!botToken) {
            const bot = new TelegramBot(botToken);
            await bot.sendMessage(
                chatId,
                `今日申请：${res.data}`,
                { "parse_mode": "Markdown" }
            );
        }
    })();
}).catch(err => {
    console.error(err);
    (async () => {
        if (!!chatId && !!botToken) {
            const bot = new TelegramBot(botToken);
            await bot.sendMessage(
                chatId,
                `错误：${err}`,
                { "parse_mode": "Markdown" }
            );
        }
    })();
}).catch(err => {
    console.error(err);
    if (err instanceof Error) {
        console.log(err.stack);
        core.setFailed(err.message);
    } else {
        core.setFailed(err);
    }
});
