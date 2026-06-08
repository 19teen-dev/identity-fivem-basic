fx_version 'cerulean'
game 'gta5'

author 'fReeed0m'
description 'IDENTITY Core'
version '1.0.0'

dependencies {
    'spawnmanager'
}

server_scripts {
    'server/utils/envLoader.js',
    'server/database/redis.js',
    'server/utils/api.js',
    'server/serverTick.js',
    'server/auth.js',
    'server/server.js'
}

client_scripts {
    'client/clientTick.js',
    'client/scenes.js',
    'client/charpreview.js',
    'client/editor.js',
    'client/auth.js',
    'client/spawn.js',
    'client/client.js'
}
