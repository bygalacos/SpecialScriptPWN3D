"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Get {
    static site(site) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(site);
            return response.text();
        });
    }
    static api(site, login = Main.AuthData) {
        return __awaiter(this, void 0, void 0, function* () {
            let requestData = {
                cache: "no-cache",
            };
            if (!login.IsAnonymous) {
                requestData.headers = {
                    "Authorization": login.getBasic(),
                };
            }
            const apiSite = "/api" + site.done();
            let response;
            try {
                response = yield fetch(apiSite, requestData);
            }
            catch (err) {
                return new ErrorObject(err);
            }
            let json;
            if (response.status === 204) {
                json = {};
            }
            else {
                try {
                    json = yield response.json();
                }
                catch (err) {
                    return new ErrorObject(err);
                }
            }
            if (!response.ok) {
                json._httpStatusCode = response.status;
                return new ErrorObject(json);
            }
            else {
                return json;
            }
        });
    }
}
class Api {
    constructor(buildAddr) {
        this.buildAddr = buildAddr;
    }
    static call(...params) {
        let buildStr = "";
        for (const param of params) {
            if (typeof param === "string") {
                buildStr += "/" + encodeURIComponent(param);
            }
            else {
                buildStr += "/(" + param.done() + ")";
            }
        }
        return new Api(buildStr);
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            return Get.api(this);
        });
    }
    done() {
        return this.buildAddr;
    }
}
function cmd(...params) {
    return Api.call(...params);
}
function bot(param, id = Main.state["bot_id"]) {
    if (id === undefined) {
        throw new Error("The bot id was not set");
    }
    else if (typeof id === "number") {
        id = id.toString();
    }
    return Api.call("bot", "use", id, param);
}
function jmerge(...param) {
    return Api.call("json", "merge", ...param);
}
class ApiAuth {
    constructor(UserUid, Token) {
        this.UserUid = UserUid;
        this.Token = Token;
    }
    get IsAnonymous() { return this.UserUid.length === 0 && this.Token.length === 0; }
    static Create(fullTokenString) {
        if (fullTokenString.length === 0)
            return ApiAuth.Anonymous;
        const split = fullTokenString.split(/:/);
        if (split.length === 2) {
            return new ApiAuth(split[0], split[1]);
        }
        else if (split.length === 3) {
            return new ApiAuth(split[0], split[2]);
        }
        else {
            throw new Error("Token Hatası");
        }
    }
    getBasic() {
        return `Basic ${btoa(this.UserUid + ":" + this.Token)}`;
    }
    getFullAuth() {
        return this.UserUid + ":" + this.Token;
    }
}
ApiAuth.Anonymous = new ApiAuth("", "");
class Timer {
    get isRunning() {
        return this.timerId !== undefined;
    }
    constructor(func, interval) {
        this.func = func;
        this.interval = interval;
    }
    start() {
        if (this.timerId !== undefined)
            return;
        this.timerId = window.setInterval(this.func, this.interval);
    }
    stop() {
        if (this.timerId === undefined)
            return;
        window.clearInterval(this.timerId);
        this.timerId = undefined;
    }
}
class DisplayError {
    static check(result, msg) {
        if (result instanceof ErrorObject) {
            DisplayError.push(result, msg);
            return false;
        }
        return true;
    }
    static push(err, msg) {
        let additional = undefined;
        let hasAdditional = false;
        if (msg !== undefined) {
            if (err !== undefined) {
                hasAdditional = true;
                additional = err.obj.ErrorMessage;
            }
        }
        else if (err !== undefined) {
            msg = err.obj.ErrorMessage;
        }
        else {
            console.log("Got nothing to show");
            return;
        }
        const divErrors = document.getElementById("errors");
        if (divErrors) {
            let addError = createElement("div", { class: "displayError" },
                createElement("div", { class: "formdatablock" },
                    createElement("div", null, "Hata : "),
                    createElement("div", null, msg)),
                createElement("div", { when: hasAdditional, class: "formdatablock" },
                    createElement("div", null, "Bilgi : "),
                    createElement("div", null, additional)));
            const addedElement = divErrors.appendChild(addError);
            setTimeout(() => addedElement.classList.add("fade"), DisplayError.fadeDelay);
            setTimeout(() => divErrors.removeChild(addedElement), DisplayError.fadeDelay + DisplayError.fadeDuration);
        }
    }
}
DisplayError.fadeDelay = 3000;
DisplayError.fadeDuration = 10000;
class ErrorObject {
    constructor(obj) {
        this.obj = obj;
    }
}
class Graph {
    static buildPath(data, node, options) {
        const scale = Graph.scale;
        let max;
        if (typeof options.max === "function")
            max = options.max(data);
        else
            max = options.max;
        let path = `M 0 ${scale} `;
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            path += `L ${(i / (data.length - 1)) * scale} ${(1 - (item / max)) * scale} `;
        }
        path += `L ${scale} ${scale} Z`;
        node.innerHTML = `
        ${Graph.buildNames(options.scale(max))}
        <svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="overflow: visible;">
            <path vector-effect="non-scaling-stroke" stroke="${options.color}" stroke-opacity="1" fill="${options.color}" fill-opacity="0.4" d="${path}" />
            <g stroke="gray" stroke-width="1" shape-rendering="crispEdges">
                <line vector-effect="non-scaling-stroke" x1="000" y1="000" x2="100" y2="000" />
                <line vector-effect="non-scaling-stroke" x1="100" y1="000" x2="100" y2="100" />
                <line vector-effect="non-scaling-stroke" x1="100" y1="100" x2="000" y2="100" />
                <line vector-effect="non-scaling-stroke" x1="000" y1="100" x2="000" y2="000" />
                ${Graph.buildGrid(data.length, 5, options.offset++)}
            </g>
        </svg>
        `;
    }
    static buildGrid(count, each, offset) {
        let path = "";
        for (let i = 1; i < (count / each) + 1; i++) {
            const lpos = (((i * each) - (offset % each)) / count) * Graph.scale;
            path += `<line vector-effect="non-scaling-stroke" shape-rendering="crispEdges" stroke-opacity="0.5" x1="${lpos}" y1="0" x2="${lpos}" y2="${Graph.scale}" />`;
        }
        const scaleQ = Graph.scale / 4;
        for (let i = 1; i < 4; i++) {
            path += `<line vector-effect="non-scaling-stroke" shape-rendering="crispEdges" stroke-opacity="0.5" x1="0" y1="${i * scaleQ}" x2="${Graph.scale}" y2="${i * scaleQ}" />`;
        }
        return path;
    }
    static buildNames(vals) {
        let path = "";
        for (let i = 0; i < 3; i++) {
            path += `<span style="position: absolute;top: ${100 / 4 * (i + 1)}%;">${vals[i]}</span>`;
        }
        return path;
    }
    static simpleUpFloor(data) {
        const max = Math.max(...data);
        return Math.pow(10, Math.ceil(Math.log10(max)));
    }
    static plusNPerc(data) {
        const max = Math.max(...data);
        return max * 1.1;
    }
    static cpuTrim(max) {
        const count = 4;
        max *= 100;
        const maxQ = max / count;
        let dec = max <= 10 ? 1 : 0;
        let vals = [];
        for (let i = 0; i < count - 1; i++)
            vals[i] = (maxQ * (i + 1)).toFixed(dec) + "%";
        vals.reverse();
        return vals;
    }
    static memTrim(max) {
        const count = 4;
        const maxQ = max / count;
        let vals = [];
        for (let i = 0; i < count - 1; i++) {
            let unit = "B";
            let val = maxQ * (i + 1);
            if (val >= 1000000000) {
                val /= 1000000000;
                unit = "GB";
            }
            if (val >= 1000000) {
                val /= 1000000;
                unit = "MB";
            }
            if (val >= 1000) {
                val /= 1000;
                unit = "KB";
            }
            vals[i] = val.toFixed() + unit;
        }
        vals.reverse();
        return vals;
    }
}
Graph.scale = 100;
class Bot {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let refreshPromise = this.refresh();
            const divPlayNew = Util.getElementByIdSafe("data_play_new");
            const btnPlayNew = Util.getElementByIdSafe("post_play_new");
            const divyeni_isim = Util.getElementByIdSafe("data_yeni_isim");
            const btnyeni_isim = Util.getElementByIdSafe("post_yeni_isim");
			const divcommander_ac = Util.getElementByIdSafe("data_commander_ac");
            const btncommander_ac = Util.getElementByIdSafe("post_commander_ac");
            const divcommander_kapat = Util.getElementByIdSafe("data_commander_kapat");
            const btncommander_kapat = Util.getElementByIdSafe("post_commander_kapat");
            const divavatar = Util.getElementByIdSafe("data_avatar");
            const btnavatar = Util.getElementByIdSafe("post_avatar");
            const divaciklama = Util.getElementByIdSafe("data_aciklama");
            const btnaciklama = Util.getElementByIdSafe("post_aciklama");
            const divradio_1= Util.getElementByIdSafe("data_radio_1");
            const btnradio_1 = Util.getElementByIdSafe("post_radio_1");
            const divradio_2= Util.getElementByIdSafe("data_radio_2");
            const btnradio_2 = Util.getElementByIdSafe("post_radio_2");
            const divradio_3= Util.getElementByIdSafe("data_radio_3");
            const btnradio_3 = Util.getElementByIdSafe("post_radio_3");
            const divradio_4= Util.getElementByIdSafe("data_radio_4");
            const btnradio_4 = Util.getElementByIdSafe("post_radio_4");
            const divradio_5= Util.getElementByIdSafe("data_radio_5");
            const btnradio_5 = Util.getElementByIdSafe("post_radio_5");
            const divradio_6= Util.getElementByIdSafe("data_radio_6");
            const btnradio_6 = Util.getElementByIdSafe("post_radio_6");
            const divradio_7= Util.getElementByIdSafe("data_radio_7");
            const btnradio_7 = Util.getElementByIdSafe("post_radio_7");
            btnyeni_isim.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divyeni_isim.value) {
                    const res = yield bot(cmd("isim", divyeni_isim.value)).get();
                    if (!DisplayError.check(res, "İsim Değiştirilemedi"))
                        return;
                }
            });
            divyeni_isim.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnyeni_isim.click();
                    return false;
                }
                return true;
            });
            btnavatar.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divavatar.value) {
                    const res = yield bot(cmd("bot", "avatar", "ekle", divavatar.value)).get();
                    if (!DisplayError.check(res, "Avatar Eklenemedi"))
                        return;
                }
            });
            divavatar.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnavatar.click();
                    return false;
                }
                return true;
            });
            btnaciklama.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divaciklama.value) {
                    const res = yield bot(cmd("bot", "aciklama", divaciklama.value)).get();
                    if (!DisplayError.check(res, "Açıklama Değiştirilemedi"))
                        return;
                }
            });
            divaciklama.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnaciklama.click();
                    return false;
                }
                return true;
            });
            btncommander_ac.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divcommander_ac.value) {
                    const res = yield bot(cmd("bot", "commander", divcommander_ac.value)).get();
                    if (!DisplayError.check(res, "Commander Açılmadı"))
                        return;
                }
            });
            divcommander_ac.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btncommander_ac.click();
                    return false;
                }
                return true;
            });
            btncommander_kapat.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divcommander_kapat.value) {
                    const res = yield bot(cmd("bot", "commander", divcommander_kapat.value)).get();
                    if (!DisplayError.check(res, "Commander Kapatılamadı"))
                        return;
                }
            });
            divcommander_kapat.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btncommander_kapat.click();
                    return false;
                }
                return true;
            });
            btnradio_1.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divradio_1.value) {
                    const res = yield bot(cmd("oynat", divradio_1.value)).get();
                    if (!DisplayError.check(res, "Radio Başlatılamadı"))
                        return;
                }
            });
            divradio_1.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnradio_1.click();
                    return false;
                }
                return true;
            });
            btnradio_2.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divradio_2.value) {
                    const res = yield bot(cmd("oynat", divradio_2.value)).get();
                    if (!DisplayError.check(res, "Radio Başlatılamadı"))
                        return;
                }
            });
            divradio_2.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnradio_2.click();
                    return false;
                }
                return true;
            });
            btnradio_3.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divradio_3.value) {
                    const res = yield bot(cmd("oynat", divradio_3.value)).get();
                    if (!DisplayError.check(res, "Radio Başlatılamadı"))
                        return;
                }
            });
            divradio_3.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnradio_3.click();
                    return false;
                }
                return true;
            });
            btnradio_4.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divradio_4.value) {
                    const res = yield bot(cmd("oynat", divradio_4.value)).get();
                    if (!DisplayError.check(res, "Radio Başlatılamadı"))
                        return;
                }
            });
            divradio_4.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnradio_4.click();
                    return false;
                }
                return true;
            });
            btnradio_5.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divradio_5.value) {
                    const res = yield bot(cmd("oynat", divradio_5.value)).get();
                    if (!DisplayError.check(res, "Radio Başlatılamadı"))
                        return;
                }
            });
            divradio_5.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnradio_5.click();
                    return false;
                }
                return true;
            });
            btnradio_6.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divradio_6.value) {
                    const res = yield bot(cmd("oynat", divradio_6.value)).get();
                    if (!DisplayError.check(res, "Radio Başlatılamadı"))
                        return;
                }
            });
            divradio_6.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnradio_6.click();
                    return false;
                }
                return true;
            });
            btnradio_7.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divradio_7.value) {
                    const res = yield bot(cmd("oynat", divradio_7.value)).get();
                    if (!DisplayError.check(res, "Radio Başlatılamadı"))
                        return;
                }
            });
            divradio_7.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnradio_7.click();
                    return false;
                }
                return true;
            });
            btnPlayNew.onclick = () => __awaiter(this, void 0, void 0, function* () {
                if (divPlayNew.value) {
                    Util.setIcon(btnPlayNew, "cog-work");
                    const res = yield bot(cmd("oynat", divPlayNew.value)).get();
                    Util.setIcon(btnPlayNew, "media-play");
                    if (!DisplayError.check(res, "Yeni bir şarkı başlatılamadı"))
                        return;
                    const playCtrl = PlayControls.get();
                    if (playCtrl !== undefined)
                        playCtrl.startEcho();
                    divPlayNew.value = "";
                }
            });
            divPlayNew.onkeypress = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnPlayNew.click();
                    return false;
                }
                return true;
            });
            yield refreshPromise;
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield bot(jmerge(cmd("calan"), cmd("calan", "position"), cmd("tekrar"), cmd("random"), cmd("ses"), cmd("hakkinda"))).get();
            if (!DisplayError.check(res, "Bot bilgisi alınamadı"))
                return;
            const divTemplate = Util.getElementByIdSafe("data_template");
            const divId = Util.getElementByIdSafe("data_id");
            const divServer = Util.getElementByIdSafe("data_server");
            let botInfo = res[5];
            divTemplate.innerText = botInfo.Name === null ? "<temporary>" : botInfo.Name;
            divId.innerText = botInfo.Id + "";
            divServer.innerText = botInfo.Server;
            const playCtrl = PlayControls.get();
            if (playCtrl === undefined)
                throw new Error("Oynatma kontrolleri bulunamadı");
            playCtrl.showState(res);
        });
    }
}
class Bots {
    constructor() {
        this.hasConnectingBots = false;
        this.connectCheckTicker = new Timer(() => __awaiter(this, void 0, void 0, function* () {
            if (!this.hasConnectingBots) {
                this.connectCheckTicker.stop();
                return;
            }
            yield this.refresh();
            if (!this.hasConnectingBots)
                this.connectCheckTicker.stop();
        }), 1000);
    }
    getCreateCard() {
        if (!Bots.createBotCard) {
            Bots.createBotCard = createElement("div", { class: "formbox flex flexhorizontal" },
                
            
                 
                createElement("div", { class: "flexmax flex flexvertical", onclick: () => this.CardQuickConnectBot() },
                    createElement("div", { class: "formheader centerText" }, "Bot Oluştur"),
                    createElement("div", { class: "flexmax imageCard", style: "background-image: url(/media/ekle.svg)" })));
        }
        return Bots.createBotCard;
    }
    get title() { return "Bots"; }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.divBots = Util.getElementByIdSafe("bots");
            yield this.refresh();
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield cmd("bot", "list").get();
            if (!DisplayError.check(res, "Bot listesi alınırken hata oluştu"))
                return;
            Util.clearChildren(this.divBots);
            this.divBots.appendChild(this.getCreateCard());
            res.sort((a, b) => {
                if (a.Name === null) {
                    if (b.Name === null)
                        return 0;
                    return 1;
                }
                else if (b.Name === null) {
                    return -1;
                }
                return a.Name.localeCompare(b.Name);
            });
            this.hasConnectingBots = false;
            for (const botInfo of res) {
                if (botInfo.Status === BotStatus.Connecting)
                    this.hasConnectingBots = true;
                this.showBotCard(botInfo);
            }
            if (this.hasConnectingBots)
                this.connectCheckTicker.start();
        });
    }
    showBotCard(botInfo, oldDiv) {
        let divStartStopButton = {};
        const statusIndicator = botInfo.Status === BotStatus.Connected ? " botConnected"
            : botInfo.Status === BotStatus.Connecting ? " botConnecting" : "";
        const div = createElement("div", { class: "botCard formbox" + statusIndicator },
            createElement("div", { class: "formheader flex2" },
                createElement("div", null, botInfo.Name !== null ? botInfo.Name : `(=>${botInfo.Server})`),
                createElement("div", { when: botInfo.Id !== null },
                    "Bot id : ",
                    botInfo.Id,
                    "")),
            createElement("div", { class: "formcontent" },
                createElement("div", { class: "formdatablock" },
                    createElement("div", null, "Sunucu:"),
                    createElement("div", null, botInfo.Server)),
                createElement("div", { class: "formdatablock" },
                    createElement("div", null, "Durum:"),
                    createElement("div", { class: "statusName" }, BotStatus[botInfo.Status])),
                createElement("div", { class: "flex2" },
                    createElement("div", null,
                        createElement("a", { when: botInfo.Status === BotStatus.Connected, class: "jslink button buttonMedium", href: "index.html?page=bot.html&bot_id=" + botInfo.Id, style: "background-color: #dd1d27; background-image: url(media/ayarlar.svg)" })),
                    createElement("div", { when: botInfo.Name === null && botInfo.Id !== null, class: "button buttonMedium", style: "background-color: #dd1d27; background-image: url(media/icons/paperclip.svg)", onclick: () => this.CardSaveBot(botInfo.Id) }),
                    createElement("div", { when: botInfo.Name !== null, class: "button buttonMedium", style: "background-color: #dd1d27; background-image: url(media/icons/fork.svg)", onclick: () => this.CardCopyBot(botInfo.Name) }),
                    createElement("div", { when: botInfo.Name !== null, class: "button buttonMedium", style: "background-color: #dd1d27; background-image: url(media/icons/trash.svg)", onclick: () => this.CardDeleteBot(botInfo.Name) }),
                    createElement("div", { class: "button buttonRound buttonMedium " + (botInfo.Status === BotStatus.Offline ? "buttonGreen" : "buttonRed"), set: divStartStopButton, style: "background-color: #dd1d27; background-image: url(media/icons/" + (botInfo.Status === BotStatus.Offline ? "play-circle" : "power-standby") + ".svg)", onclick: (e) => this.CardStartStop(botInfo, e, div) }))));
        if (oldDiv !== undefined) {
            this.divBots.replaceChild(div, oldDiv);
            oldDiv = div;
        }
        else {
            oldDiv = this.divBots.appendChild(div);
        }
        Main.generateLinks();
    }
    CardStartStop(botInfo, e, oldDiv) {
        return __awaiter(this, void 0, void 0, function* () {
            const divSs = Util.nonNull(e.target);
            Util.setIcon(divSs, "cog-work");
            if (botInfo.Status === BotStatus.Offline) {
                if (botInfo.Name === null)
                    return;
                const tmpBotName = botInfo.Name;
                botInfo.Name = null;
                const res = yield cmd("bot", "connect", "template", tmpBotName).get();
                if (!DisplayError.check(res, "Bot başlatırken hata")) {
                    botInfo.Name = tmpBotName;
                    Util.setIcon(divSs, "play-circle");
                    return;
                }
                Object.assign(botInfo, res);
                this.hasConnectingBots = true;
                this.connectCheckTicker.start();
            }
            else {
                if (botInfo.Id === null)
                    return;
                const tmpBotId = botInfo.Id;
                botInfo.Id = null;
                const res = yield bot(cmd("bot", "cikar"), tmpBotId).get();
                if (!DisplayError.check(res, "Durdurma Hatasi")) {
                    botInfo.Id = tmpBotId;
                    Util.setIcon(divSs, "power-standby");
                    return;
                }
                botInfo.Id = null;
                botInfo.Status = BotStatus.Offline;
            }
            this.showBotCard(botInfo, oldDiv);
        });
    }
    CardDeleteBot(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ModalBox.show("Silmek istiyorsanız sil tuşuna basarak devam edin", "Şu bot silinecek -> " + name, {}, {
                text: "Sil",
                default: true,
                action: () => __awaiter(this, void 0, void 0, function* () {
                    const res = yield cmd("settings", "delete", name).get();
                    if (DisplayError.check(res, "Bot Silinemedi")) {
                        this.refresh();
                    }
                })
            }, {
                text: "Çık",
            });
        });
    }
    CardQuickConnectBot() {
        return __awaiter(this, void 0, void 0, function* () {
            yield ModalBox.show("", "Yeni bot oluştur", {
                inputs: { address: "Sunucu IP Adresini Girin" }
            }, {
                text: "Tamam",
                default: true,
                action: (i) => __awaiter(this, void 0, void 0, function* () {
                    const res = yield cmd("bot", "baglan", "adres", i.address).get();
                    if (DisplayError.check(res, "Bağlantı Hatası")) {
                        this.refresh();
                    }
                })
            }, {
                text: "Çık",
            });
        });
    }
    CardSaveBot(botId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ModalBox.show("", "Botu kaydet", {
                inputs: { name: "Bot için şablon adı girin" }
            }, {
                text: "Kaydet",
                default: true,
                action: (i) => __awaiter(this, void 0, void 0, function* () {
                    const res = yield bot(cmd("bot", "kaydet", i.name), botId).get();
                    if (DisplayError.check(res, "Kaydetme Hatası")) {
                        this.refresh();
                    }
                })
            }, {
                text: "Çık",
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connectCheckTicker.stop();
        });
    }
}
var BotStatus;
(function (BotStatus) {
    BotStatus[BotStatus["Offline"] = 0] = "Bağlı Değil";
    BotStatus[BotStatus["Connecting"] = 1] = "Bağlanıyor";
    BotStatus[BotStatus["Connected"] = 2] = "Bağlandı";
})(BotStatus || (BotStatus = {}));
class Commands {
    init() {
        let elem = createElement("script", { src: "openapi/swagger-ui-bundle.js" }, " ");
        elem.onload = () => {
            const ui = SwaggerUIBundle({
                url: "/api/json/api",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
            window.ui = ui;
        };
        document.head.appendChild(elem);
        document.head.appendChild(createElement("script", { src: "openapi/swagger-ui-standalone-preset.js" }, " "));
        document.head.appendChild(createElement("link", { rel: "stylesheet", type: "text/css", href: "openapi/swagger-ui.css" }));
        return Promise.resolve();
    }
    refresh() { return Promise.resolve(); }
}
class Dummy {
    init() { return Dummy.EmptyPromise; }
    refresh() { return Dummy.EmptyPromise; }
}
Dummy.EmptyPromise = Promise.resolve();
class Home {
    constructor() {
        this.ticker = new Timer(() => __awaiter(this, void 0, void 0, function* () { return yield this.refresh(); }), 1000);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield cmd("version").get();
            if (!DisplayError.check(res, "Sistem bilgisi alınamadı"))
                return;
            Util.getElementByIdSafe("data_version").innerText = res.Version;
            Util.getElementByIdSafe("data_branch").innerText = res.Branch;
            Util.getElementByIdSafe("data_commit").innerText = res.CommitSha;
            this.ticker.start();
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield cmd("sistem", "bilgi").get();
            if (!DisplayError.check(res, "Sistem bilgisi alınamadı")) {
                this.ticker.stop();
                return;
            }
            if (!this.ticker.isRunning) {
                this.ticker.start();
            }
            res.cpu = Home.padArray(res.cpu, Home.graphLen, 0);
            Graph.buildPath(res.cpu, Util.getElementByIdSafe("data_cpugraph"), Home.cpuGraphOptions);
            res.memory = Home.padArray(res.memory, Home.graphLen, 0);
            Graph.buildPath(res.memory, Util.getElementByIdSafe("data_memgraph"), Home.memGraphOptions);
            const timeDiff = Util.formatSecondsToTime((Date.now() - new Date(res.starttime)) / 1000);
            Util.getElementByIdSafe("data_uptime").innerText = timeDiff;
        });
    }
    static padArray(arr, count, val) {
        if (arr.length < count) {
            return Array(count - arr.length).fill(val).concat(arr);
        }
        return arr;
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ticker.stop();
        });
    }
}
Home.graphLen = 60;
Home.cpuGraphOptions = {
    color: "red",
    max: Graph.plusNPerc,
    offset: 0,
    scale: Graph.cpuTrim,
};
Home.memGraphOptions = {
    color: "blue",
    max: Graph.plusNPerc,
    offset: 0,
    scale: Graph.memTrim,
};
class Main {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            Main.divContent = Util.getElementByIdSafe("content");
            Main.generateLinks();
            Main.divAuthToken = Util.getElementByIdSafe("authtoken");
            Main.divAuthToken.oninput = Main.authChanged;
            Main.loadAuth();
            const divRefresh = document.getElementById("refreshContent");
            if (divRefresh) {
                divRefresh.onclick = () => __awaiter(this, void 0, void 0, function* () {
                    if (Main.currentPage !== undefined) {
                        Util.setIcon(divRefresh, "reload-work");
                        yield Main.currentPage.refresh();
                        Util.setIcon(divRefresh, "reload");
                    }
                });
            }
            const list = document.querySelectorAll("nav a");
            for (const divLink of list) {
                const query = Util.parseQuery(divLink.href);
                if (query.page) {
                    const pageEntry = Main.pages[query.page];
                    if (pageEntry) {
                        pageEntry.divNav = divLink;
                    }
                }
            }
            Main.readStateFromUrl();
            Main.state.page = Main.state.page || "bots.html";
            yield Main.setSite(Main.state);
        });
    }
    static generateLinks() {
        const list = document.querySelectorAll(".jslink");
        for (const divLink of list) {
            const query = Util.parseQuery(divLink.href);
            divLink.classList.remove("jslink");
            divLink.onclick = (ev) => __awaiter(this, void 0, void 0, function* () {
                ev.preventDefault();
                yield Main.setSite(query);
            });
        }
    }
    static readStateFromUrl() {
        const query = Util.getUrlQuery();
        Object.assign(Main.state, query);
    }
    static setSite(data = Main.state) {
        return __awaiter(this, void 0, void 0, function* () {
            const site = data.page;
            if (site === undefined) {
                return;
            }
            try {
                const content = yield Get.site(site);
                Main.divContent.innerHTML = content;
            }
            catch (ex) {
                DisplayError.push(undefined, "Sayfa içeriği alınamadı.");
                return;
            }
            Main.state = data;
            window.history.pushState(Main.state, document.title, "index.html" + Util.buildQuery(Main.state));
            const oldPage = Main.currentPage;
            if (oldPage) {
                if (oldPage.close)
                    yield oldPage.close();
                if (oldPage.divNav)
                    oldPage.divNav.classList.remove("navSelected");
            }
            const newPage = Main.pages[site];
            Main.currentPage = newPage;
            if (newPage !== undefined) {
                if (newPage.divNav) {
                    newPage.divNav.classList.add("navSelected");
                }
                yield newPage.init();
                if (newPage.title)
                    document.title = "bygalacosbot - " + newPage.title;
            }
            Main.generateLinks();
        });
    }
    static loadAuth() {
        const auth = window.localStorage.getItem("api_auth");
        if (auth) {
            Main.AuthData = ApiAuth.Create(auth);
            Main.divAuthToken.value = auth;
        }
    }
    static authChanged() {
        Main.AuthData = ApiAuth.Create(Main.divAuthToken.value);
        window.localStorage.setItem("api_auth", Main.AuthData.getFullAuth());
    }
}
Main.AuthData = ApiAuth.Anonymous;
Main.pages = {
    "home.html": new Home(),
    "bot.html": new Bot(),
    "bots.html": new Bots(),
    "komutlar.html": new Commands(),
    "playlist.html": new Dummy(),
    "history.html": new Dummy(),
};
Main.state = {};
window.onload = Main.init;
class ModalBox {
    static show(msg, head, options, ...buttons) {
        ModalBox.close();
        return new Promise(resolve => {
            const inputElem = [];
            const outputs = {};
            const inputs = options.inputs;
            let firstInput;
            if (inputs) {
                for (const input in inputs) {
                    const inputBox = {};
                    inputElem.push(createElement("div", { class: "formdatablock" },
                        createElement("div", null, inputs[input]),
                        createElement("input", { set: inputBox, name: input, type: "text", class: "formdatablock_fill", placeholder: "" })));
                    if (inputBox.element) {
                        let inputElem = inputBox.element;
                        firstInput = firstInput || inputElem;
                        outputs[input] = inputElem;
                    }
                }
            }
            const btnElem = [];
            let buttonOk;
            for (const addButton of buttons) {
                const doClick = () => {
                    if (addButton.action) {
                        addButton.action(ModalBox.transformOutput(outputs));
                    }
                    ModalBox.close(resolve);
                };
                btnElem.push(createElement("div", { class: "button", onclick: doClick }, addButton.text));
                if (addButton.default === true) {
                    buttonOk = doClick;
                }
            }
            const doCancel = () => { if (options.onCancel)
                options.onCancel(); ModalBox.close(resolve); };
            const checkKeyPress = (e) => {
                if (e.keyCode === 13 && buttonOk) {
                    buttonOk();
                }
                else if (e.keyCode === 27) {
                    doCancel();
                }
            };
            document.onkeydown = checkKeyPress;
            const box = createElement("div", { class: "formbox", onkeypress: checkKeyPress },
                createElement("div", { class: "formheader flex2" },
                    createElement("div", { class: "flexmax" }, head),
                    createElement("div", null,
                        createElement("div", { class: "button buttonRound buttonTiny buttonNoSpace", onclick: doCancel, style: "background-image: url(media/icons/x.svg)" }))),
                createElement("div", { class: "formcontent" },
                    createElement("div", null, msg),
                    createElement("div", null, inputElem),
                    createElement("div", { class: "flex2" },
                        createElement("div", { class: "flexmax" }),
                        createElement("div", { class: "flex" }, btnElem))));
            document.getElementsByTagName("body")[0].appendChild(createElement("div", { id: ModalBox.ModBoxId, class: "modal_main" },
                createElement("div", { class: "modal_background", onclick: doCancel }),
                createElement("div", { class: "modal_content" }, box)));
            if (firstInput)
                firstInput.focus();
        });
    }
    static transformOutput(output) {
        const input = {};
        for (const out in output) {
            input[out] = output[out].value;
        }
        return input;
    }
    static close(resolve) {
        document.onkeydown = null;
        const modElem = document.getElementById(ModalBox.ModBoxId);
        if (modElem && modElem.parentNode) {
            modElem.parentNode.removeChild(modElem);
        }
        if (resolve)
            resolve();
    }
}
ModalBox.ModBoxId = "modalBox";
class PlayControls {
    constructor() {
        this.currentSong = null;
        this.playing = PlayState.Off;
        this.repeat = RepeatKind.Off;
        this.random = false;
        this.trackPosition = 0;
        this.trackLength = 0;
        this.volume = 0;
        this.muteToggleVolume = 0;
        this.echoCounter = 0;
        this.divRepeat = Util.getElementByIdSafe("playctrlrepeat");
        this.divRandom = Util.getElementByIdSafe("playctrlrandom");
        this.divPlay = Util.getElementByIdSafe("playctrlplay");
        this.divPrev = Util.getElementByIdSafe("playctrlprev");
        this.divNext = Util.getElementByIdSafe("playctrlnext");
        this.divVolumeMute = Util.getElementByIdSafe("playctrlmute");
        this.divVolumeSlider = Util.getElementByIdSafe("playctrlvolume");
        this.divPositionSlider = Util.getElementByIdSafe("playctrlposition");
        this.divPosition = Util.getElementByIdSafe("data_track_position");
        this.divLength = Util.getElementByIdSafe("data_track_length");
        this.divNowPlaying = Util.getElementByIdSafe("data_now_playing");
        this.divRepeat.onclick = () => __awaiter(this, void 0, void 0, function* () {
            Util.setIcon(this.divRepeat, "cog-work");
            const res = yield bot(jmerge(cmd("tekrar", RepeatKind[(this.repeat + 1) % 3].toLowerCase()), cmd("tekrar"))).get();
            if (!DisplayError.check(res, "Tekrarlama modu uygulanamadı"))
                return this.showStateRepeat(this.repeat);
            this.showStateRepeat(res[1]);
        });
        this.divRandom.onclick = () => __awaiter(this, void 0, void 0, function* () {
            Util.setIcon(this.divRandom, "cog-work");
            const res = yield bot(jmerge(cmd("random", (!this.random) ? "ac" : "kapat"), cmd("random"))).get();
            if (!DisplayError.check(res, "Random Uygulanamadı"))
                return this.showStateRandom(this.random);
            this.showStateRandom(res[1]);
        });
        const setVolume = (volume, applySlider) => __awaiter(this, void 0, void 0, function* () {
            const res = yield bot(jmerge(cmd("ses", volume.toString()), cmd("ses"))).get();
            if (!DisplayError.check(res, "Ses Değiştirilmedi"))
                return this.showStateVolume(this.volume, true);
            this.showStateVolume(res[1], applySlider);
        });
        this.divVolumeMute.onclick = () => __awaiter(this, void 0, void 0, function* () {
            if (this.muteToggleVolume !== 0 && this.volume === 0) {
                yield setVolume(this.muteToggleVolume, true);
                this.muteToggleVolume = 0;
            }
            else {
                this.muteToggleVolume = this.volume;
                yield setVolume(0, true);
            }
        });
        this.divVolumeSlider.onchange = () => __awaiter(this, void 0, void 0, function* () {
            this.muteToggleVolume = 0;
            this.divVolumeSlider.classList.add("loading");
            yield setVolume(Number(this.divVolumeSlider.value), false);
            this.divVolumeSlider.classList.remove("loading");
        });
        this.divNext.onclick = () => __awaiter(this, void 0, void 0, function* () {
            Util.setIcon(this.divNext, "cog-work");
            const res = yield bot(cmd("gec")).get();
            Util.setIcon(this.divNext, "media-skip-forward");
            if (!DisplayError.check(res, "Sorun Oluştu"))
                return;
            this.startEcho();
        });
        this.divPrev.onclick = () => __awaiter(this, void 0, void 0, function* () {
            Util.setIcon(this.divPrev, "cog-work");
            const res = yield bot(cmd("onceki")).get();
            Util.setIcon(this.divPrev, "media-skip-backward");
            if (!DisplayError.check(res, "Sorun Oluştu"))
                return;
            this.startEcho();
        });
        this.divPlay.onclick = () => __awaiter(this, void 0, void 0, function* () {
            let songRet;
            switch (this.playing) {
                case PlayState.Off:
                    return;
                case PlayState.Playing:
                    Util.setIcon(this.divPlay, "cog-work");
                    songRet = yield bot(jmerge(cmd("dur"), cmd("calan"))).get();
                    break;
                case PlayState.Paused:
                    Util.setIcon(this.divPlay, "cog-work");
                    songRet = yield bot(jmerge(cmd("oynat"), cmd("calan"))).get();
                    break;
                default:
                    throw new Error();
            }
            if (!DisplayError.check(songRet))
                return this.showStatePlaying(this.currentSong, this.playing);
            this.startEcho();
            this.showStatePlaying(songRet[1]);
        });
        this.divPositionSlider.onchange = () => __awaiter(this, void 0, void 0, function* () {
            if (this.playing === PlayState.Off)
                return;
            const wasRunning = this.playTick.isRunning;
            this.playTick.stop();
            this.divPositionSlider.classList.add("loading");
            const targetSeconds = Math.floor(Number(this.divPositionSlider.value));
            let res = yield bot(cmd("seek", targetSeconds.toString())).get();
            this.divPositionSlider.classList.remove("loading");
            if (!DisplayError.check(res, "Failed to seek"))
                return;
            if (wasRunning)
                this.playTick.start();
            this.showStatePosition(targetSeconds);
        });
        this.playTick = new Timer(() => {
            if (this.trackPosition < this.trackLength) {
                this.trackPosition += 1;
                this.showStatePosition(this.trackPosition);
            }
            else {
                this.playTick.stop();
                this.startEcho();
            }
        }, 1000);
        this.echoTick = new Timer(() => __awaiter(this, void 0, void 0, function* () {
            this.echoCounter += 1;
            if (this.echoCounter === 1 || this.echoCounter === 3 || this.echoCounter === 6) {
                yield this.refresh();
            }
            if (this.echoCounter >= 6) {
                this.echoTick.stop();
            }
        }), 1000);
        this.enable();
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const botInfo = yield bot(jmerge(cmd("calan"), cmd("calan", "position"), cmd("tekrar"), cmd("random"), cmd("ses"))).get();
            if (!DisplayError.check(botInfo))
                return;
            this.showState(botInfo);
        });
    }
    showState(botInfo) {
        this.showStatePlaying(botInfo[0]);
        this.showStateLength(Util.parseTimeToSeconds(botInfo[1].length));
        this.showStatePosition(Util.parseTimeToSeconds(botInfo[1].position));
        this.showStateRepeat(botInfo[2]);
        this.showStateRandom(botInfo[3]);
        this.showStateVolume(botInfo[4]);
    }
    enable() {
        const divPlayCtrl = Util.getElementByIdSafe("playblock");
        divPlayCtrl.classList.remove("playdisabled");
    }
    disable() {
        const divPlayCtrl = Util.getElementByIdSafe("playblock");
        divPlayCtrl.classList.add("playdisabled");
    }
    static get() {
        const elem = document.getElementById("playblock");
        if (!elem)
            return undefined;
        let playCtrl = elem.playControls;
        if (!playCtrl) {
            playCtrl = new PlayControls();
            elem.playControls = playCtrl;
        }
        return playCtrl;
    }
    startEcho() {
        this.echoCounter = 0;
        this.echoTick.start();
    }
    showStateRepeat(state) {
        this.repeat = state;
        switch (state) {
            case RepeatKind.Off:
                Util.setIcon(this.divRepeat, "loop-off");
                break;
            case RepeatKind.One:
                Util.setIcon(this.divRepeat, "loop-one");
                break;
            case RepeatKind.All:
                Util.setIcon(this.divRepeat, "loop-all");
                break;
            default:
                break;
        }
    }
    showStateRandom(state) {
        this.random = state;
        Util.setIcon(this.divRandom, (state ? "random" : "random-off"));
    }
    showStateVolume(volume, applySlider = true) {
        this.volume = volume;
        if (applySlider)
            this.divVolumeSlider.value = volume.toString();
        if (volume <= 0.001)
            Util.setIcon(this.divVolumeMute, "volume-off");
        else if (volume <= 50)
            Util.setIcon(this.divVolumeMute, "volume-low");
        else
            Util.setIcon(this.divVolumeMute, "volume-high");
    }
    showStateLength(length) {
        this.trackLength = length;
        const displayTime = Util.formatSecondsToTime(length);
        this.divLength.innerText = displayTime;
        this.divPositionSlider.max = length.toString();
    }
    showStatePosition(position) {
        this.trackPosition = position;
        const displayTime = Util.formatSecondsToTime(position);
        this.divPosition.innerText = displayTime;
        this.divPositionSlider.value = position.toString();
    }
    showStatePlaying(song, playing = song ? PlayState.Playing : PlayState.Off) {
        if (song !== null) {
            this.currentSong = song;
            this.divNowPlaying.innerText = this.currentSong.title;
        }
        else {
            this.currentSong = null;
            this.divNowPlaying.innerText = "Birşey çalmıyor...";
        }
        this.playing = playing;
        switch (playing) {
            case PlayState.Off:
                this.showStateLength(0);
                this.showStatePosition(0);
                this.playTick.stop();
                Util.setIcon(this.divPlay, "heart");
                break;
            case PlayState.Playing:
                this.playTick.start();
                Util.setIcon(this.divPlay, "media-stop");
                break;
            case PlayState.Paused:
                this.playTick.stop();
                Util.setIcon(this.divPlay, "media-play");
                break;
            default:
                break;
        }
    }
}
var RepeatKind;
(function (RepeatKind) {
    RepeatKind[RepeatKind["Off"] = 0] = "Off";
    RepeatKind[RepeatKind["One"] = 1] = "One";
    RepeatKind[RepeatKind["All"] = 2] = "All";
})(RepeatKind || (RepeatKind = {}));
var PlayState;
(function (PlayState) {
    PlayState[PlayState["Off"] = 0] = "Off";
    PlayState[PlayState["Playing"] = 1] = "Çalıyor";
    PlayState[PlayState["Paused"] = 2] = "Duraklatıldı";
})(PlayState || (PlayState = {}));
class Util {
    static parseQuery(query) {
        const search = /(?:[?&])([^&=]+)=([^&]*)/g;
        const decode = (s) => decodeURIComponent(s.replace(/\+/g, " "));
        const urlParams = {};
        let match = null;
        do {
            match = search.exec(query);
            if (!match)
                break;
            urlParams[decode(match[1])] = decode(match[2]);
        } while (match);
        return urlParams;
    }
    static getUrlQuery() {
        return Util.parseQuery(window.location.href);
    }
    static buildQuery(data) {
        let str = "";
        let hasOne = false;
        for (const dat in data) {
            if (!data[dat])
                continue;
            str += (hasOne ? "&" : "?") + dat + "=" + data[dat];
            hasOne = true;
        }
        return str;
    }
    static getElementByIdSafe(elementId) {
        return Util.nonNull(document.getElementById(elementId));
    }
    static nonNull(elem) {
        if (elem === null)
            throw new Error("Eksik html öğesi");
        return elem;
    }
    static clearChildren(elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    }
    static setIcon(elem, icon) {
        elem.style.backgroundImage = `url(media/icons/${icon}.svg)`;
    }
    static clearIcon(elem) {
        elem.style.backgroundImage = "none";
    }
    static asError(err) {
        return new ErrorObject(err);
    }
    static parseTimeToSeconds(time) {
        const result = /(\d+):(\d+):(\d+)(?:\.(\d+))?/g.exec(time);
        if (result) {
            let num = 0;
            num += Number(result[1]) * 3600;
            num += Number(result[2]) * 60;
            num += Number(result[3]);
            if (result[4]) {
                num += Number(result[4]) / Math.pow(10, result[4].length);
            }
            return num;
        }
        return -1;
    }
    static formatSecondsToTime(seconds) {
        let str = "";
        const h = Math.floor(seconds / 3600);
        if (h > 0) {
            str += h.toString() + ":";
            seconds -= h * 3600;
        }
        const m = Math.floor(seconds / 60);
        str += ("00" + m).slice(-2) + ":";
        seconds -= m * 60;
        const s = Math.floor(seconds);
        str += ("00" + s).slice(-2);
        return str;
    }
}
;
function createElement(tag, attrs, ...children) {
    if (attrs && attrs["when"] === false)
        return undefined;
    const el = document.createElement(tag);
    if (attrs && attrs["set"])
        attrs["set"].element = el;
    for (let name in attrs) {
        if (name && attrs.hasOwnProperty(name)) {
            let value = attrs[name];
            if (name === 'className' && value !== void 0) {
                el.setAttribute('class', value.toString());
            }
            else if (value === false || value === null || value === undefined || value === true) {
                el[name] = value;
            }
            else if (typeof value === 'function') {
                el[name.toLowerCase()] = value;
            }
            else if (typeof value === 'object') {
                el.setAttribute(name, value);
            }
            else {
                el.setAttribute(name, value.toString());
            }
        }
    }
    if (children && children.length > 0) {
        appendChildren(el, children);
    }
    return el;
}
function isElement(el) {
    return !!el.nodeType;
}
function addChild(parentElement, child) {
    if (child === null || child === undefined) {
        return;
    }
    else if (Array.isArray(child)) {
        appendChildren(parentElement, child);
    }
    else if (isElement(child)) {
        parentElement.appendChild(child);
    }
    else {
        parentElement.appendChild(document.createTextNode(child.toString()));
    }
}
function appendChildren(parentElement, children) {
    children.forEach(child => addChild(parentElement, child));
}
class Settings {
    static get(getStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield getStr.get();
            if (res instanceof ErrorObject)
                return DisplayError.push(res);
        });
    }
}
//# sourceMappingURL=script.js.map