process.on('uncaughtException', (err) => {
    console.error('^1[SERVER] Uncaught anomaly:^7', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('^1[SERVER] Unhandled rejection:^7', reason);
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const connectApi = async (retries = 5, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const data = await global.api.accounts.count();
            return data.count;
        } catch (err) {
            const last = attempt === retries;
            console.error(`^3[SERVER] API not ready (attempt ${attempt}/${retries}): ${err.message}^7`);
            if (last) throw err;
            await sleep(delay);
        }
    }
};

on('onResourceStart', async (resourceName) => {
    if (GetCurrentResourceName() !== resourceName) return;

    console.log('^3=========================================^7');
    console.log('^2[SERVER] Launching the IDENTITY OS...^7');

    try {
        console.log('^3[SERVER] Initializing Redis...^7');
        await global.redis.connect();
        await global.redis.ping();
        console.log('^2[SERVER] Redis is connected!^7');

        console.log('^3[SERVER] Connecting to the PostgreSQL microservice...^7');
        const count = await connectApi();
        console.log(`^2[SERVER] PostgreSQL connection established. Accounts: ${count}^7`);

        console.log('^2[SERVER] IDENTITY OS successfully loaded!^7');
        console.log('^3=========================================^7');
    } catch (err) {
        console.error('^1[SERVER] Launch Error:^7', err.message);
        console.error('^1[SERVER] IDENTITY OS is running, but the API is unavailable. Check that IDENTITY-API is running on the correct port.^7');
    }
});
