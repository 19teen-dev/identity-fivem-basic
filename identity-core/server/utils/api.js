const http = require('http');

const baseUrl = process.env.API_URL;
const token = process.env.API_TOKEN;
const REQUEST_TIMEOUT = 8000;

function request(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${baseUrl}${endpoint}`);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            timeout: REQUEST_TIMEOUT,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(parsed);
                } else {
                    const msg = (parsed && parsed.error) ? parsed.error : data;
                    const err = new Error(`[API] ${res.statusCode}: ${msg}`);
                    err.statusCode = res.statusCode;
                    err.apiError = (parsed && parsed.error) ? parsed.error : null;
                    reject(err);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => {
            req.destroy(new Error('[API] Request timed out'));
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

global.api = {
    auth: {
        login: (identifier, password) =>
            request('/auth/login', 'POST', { identifier, password })
    },
    accounts: {
        count: () => request('/accounts/count')
    },
    characters: {
        getByAccountId: (accountId) => request(`/characters/${accountId}`),
        create: (accountId, data) => request(`/characters/${accountId}`, 'POST', data),
        updateAppearance: (characterId, appearance) =>
            request(`/characters/appearance/${characterId}`, 'PUT', { appearance })
    }
};

global.apiRequest = request;
