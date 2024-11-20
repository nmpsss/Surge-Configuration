const $ = new Env('ChatGPT解锁检测');
const TIMEOUT = 3000;

async function test_chatgpt() {
    let panel = {};
    let result = [];

    try {
        // 检测网页端
        let webResp = await http({
            url: 'https://chat.openai.com',
            timeout: TIMEOUT
        });
        let web = webResp.status === 200 ? "✓" : "✗";
        result.push(`网页版: ${web}`);

        // 检测 APP 端
        let appResp = await http({
            url: 'https://ios.chat.openai.com/',
            timeout: TIMEOUT
        });
        
        let appStatus = "✗";
        if (appResp.status === 403) {
            try {
                let body = JSON.parse(appResp.body);
                if (body.cf_details === "Request is not allowed. Please try again later.") {
                    appStatus = "✓";
                }
            } catch (e) {}
        }
        result.push(`移动端: ${appStatus}`);

        // 获取地区
        let geoResp = await http({
            url: 'https://chat.openai.com/cdn-cgi/trace'
        });
        let region = geoResp.body?.match(/loc=([A-Z]+)/)?.[1] || '--';
        result.push(`地区: ${region}`);

        panel = {
            title: 'ChatGPT解锁检测',
            content: result.join('\n'),
            icon: 'checkmark.circle'
        };

    } catch (err) {
        panel = {
            title: 'ChatGPT解锁检测',
            content: '检测异常，请刷新重试',
            icon: 'xmark.circle'
        };
    }

    $done(panel);
}

function http(opt) {
    return new Promise((resolve, reject) => {
        $httpClient.get(opt, (err, resp, body) => {
            if (err) reject(err);
            else {
                resp.body = body;
                resolve(resp);
            }
        });
    });
}

test_chatgpt();
