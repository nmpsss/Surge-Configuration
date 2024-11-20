const $ = new Env('ChatGPT解锁检测');
const TIMEOUT = 3000;

// 解锁状态
const STATUS_COMING = 2; // 即将登陆
const STATUS_AVAILABLE = 1; // 支持解锁
const STATUS_NOT_AVAILABLE = 0; // 不支持解锁
const STATUS_ERROR = -1; // 检测异常

// 检测 API
const API = { 
    web: 'https://chat.openai.com',
    app: 'https://ios.chat.openai.com/api/auth/session',
    api: 'https://api.openai.com/v1/models'
};

// 检测超时
const PURPOSE_TIMEOUT = {
  WEB: 3000,
  APP: 3000,  
  API: 3000
};

async function test_chatgpt() {
    let webStatus = STATUS_ERROR;
    let apiStatus = STATUS_ERROR;
    let appStatus = STATUS_ERROR;
    let region = '';
    let content = '';
    let panel = {};
    
    try {
        // 检测网页端
        let webResp = await http({
            url: API.web,
            method: 'HEAD',
            timeout: PURPOSE_TIMEOUT.WEB
        });
        
        if (webResp.status === 200) {
            webStatus = STATUS_AVAILABLE;
        } else if (webResp.status === 403) {
            webStatus = STATUS_NOT_AVAILABLE; 
        }

        // 检测APP端
        let appResp = await http({
            url: API.app,
            timeout: PURPOSE_TIMEOUT.APP,
            headers: {
                'User-Agent': 'ChatGPT-iOS/1.2023.96 (iOS 17.0; iPhone14,3)'
            }
        });
        
        if (appResp.status === 200) {
            appStatus = STATUS_AVAILABLE;
        } else if (appResp.status === 403) {
            appStatus = STATUS_NOT_AVAILABLE;
        }

        // 检测 API
        let apiResp = await http({
            url: API.api,
            timeout: PURPOSE_TIMEOUT.API
        });
        
        if (apiResp.status === 200) {
            apiStatus = STATUS_AVAILABLE;
        } else if (apiResp.status === 403) {
            apiStatus = STATUS_NOT_AVAILABLE;
        }

        // 获取地区信息
        let geoResp = await http({
            url: 'https://chat.openai.com/cdn-cgi/trace'
        });
        region = geoResp.body?.match(/loc=([A-Z]+)/)?.[1] || '';
        
        // 生成面板内容
        if (webStatus === STATUS_AVAILABLE && appStatus === STATUS_AVAILABLE && apiStatus === STATUS_AVAILABLE) {
            content = `ChatGPT 全部可用 ✓ 地区: ${region}`;
            panel = {
                title: 'ChatGPT解锁检测',
                content,
                backgroundColor: '#1E1E1E',
                icon: 'checkmark.circle.fill'
            };
        } else if (webStatus === STATUS_AVAILABLE && apiStatus === STATUS_AVAILABLE) {
            content = `ChatGPT Web + API 可用 ✓ 地区: ${region}`;
            panel = {
                title: 'ChatGPT解锁检测', 
                content,
                backgroundColor: '#0066CC',
                icon: 'xmark.circle.fill'
            };
        } else if (webStatus === STATUS_AVAILABLE) {
            content = `仅 ChatGPT Web 可用 ✓ 地区: ${region}`;
            panel = {
                title: 'ChatGPT解锁检测',
                content,
                backgroundColor: '#CC6600',
                icon: 'exclamationmark.triangle.fill'
            };
        } else {
            content = `ChatGPT 不可用 ✗ 地区: ${region}`;
            panel = {
                title: 'ChatGPT解锁检测',
                content,
                backgroundColor: '#CC0000',
                icon: 'xmark.circle.fill'
            };
        }

    } catch (err) {
        console.log(err);
        content = '检测异常,请刷新重试';
        panel = {
            title: 'ChatGPT解锁检测',
            content,
            backgroundColor: '#555555',
            icon: 'antenna.radiowaves.left.and.right.circle.fill'
        };
    }

    $done(panel);
}

// HTTP 请求封装
function http(opt) {
    return new Promise((resolve, reject) => {
        $httpClient.get(opt, (err, resp, body) => {
            if (err) {
                reject(err);
            } else {
                resp.body = body;
                resolve(resp);
            }
        });
    });
}

test_chatgpt();

// Env 类
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.
