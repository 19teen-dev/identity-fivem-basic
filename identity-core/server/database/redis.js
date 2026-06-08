const Redis = require('ioredis');

const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    lazyConnect: true,
    maxRetriesPerRequest: 1
});

global.redis = redisClient;
module.exports = redisClient;
