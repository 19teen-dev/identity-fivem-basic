const authStage = new Map();

const STAGE = {
    CONNECTING: 'connecting',
    LOGIN: 'login',
    CHARSELECT: 'charselect',
    PLAYING: 'playing'
};

global.IdentitySession = {
    get: (src) => authStage.get(src),
    set: (src, data) => authStage.set(src, data),
    isAuthed: (src) => {
        const s = authStage.get(src);
        return s && s.accountId && s.stage !== STAGE.CONNECTING;
    },
    STAGE
};

on('playerConnecting', (name, setKickReason, deferrals) => {
    const src = global.source;
    deferrals.defer();

    setTimeout(() => {
        deferrals.update('Проверка соединения...');
        authStage.set(src, { stage: STAGE.CONNECTING, accountId: null, name });
        deferrals.done();
    }, 0);
});

onNet('identity-core:server:clientReady', () => {
    const src = global.source;
    if (!authStage.has(src)) {
        authStage.set(src, { stage: STAGE.CONNECTING, accountId: null });
    }
    authStage.set(src, { ...authStage.get(src), stage: STAGE.LOGIN });
    emitNet('identity-core:client:enterLogin', src);
});

onNet('identity-core:server:loginAttempt', async (identifier, password) => {
    const src = global.source;
    const session = authStage.get(src);

    if (!session || session.stage !== STAGE.LOGIN) {
        return;
    }

    if (session.loginPending) {
        return;
    }

    if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier || !password) {
        emitNet('identity-core:client:loginError', src, 'Введите логин и пароль');
        return;
    }

    session.loginPending = true;
    authStage.set(src, session);

    try {
        const result = await global.api.auth.login(identifier.trim(), password);

        if (!result || !result.account) {
            session.loginPending = false;
            authStage.set(src, session);
            emitNet('identity-core:client:loginError', src, 'Неверный логин или пароль');
            return;
        }

        session.accountId = result.account.id;
        session.login = result.account.login;
        session.adminlevel = result.account.adminlevel || 0;
        session.stage = STAGE.CHARSELECT;
        session.loginPending = false;
        authStage.set(src, session);

        console.log(`^2[AUTH]^7 ${GetPlayerName(src)} вошёл как "${result.account.login}" (acc ${result.account.id})`);

        emitNet('identity-core:client:loginSuccess', src);
        emitNet('identity-core:client:enterCharSelect', src);
    } catch (err) {
        session.loginPending = false;
        authStage.set(src, session);

        const msg = err.apiError || 'Неверный логин или пароль';
        emitNet('identity-core:client:loginError', src, msg);
    }
});

const CHARSELECT_BUCKET_BASE = 1000;

const loadAndSendCharacters = async (src, session) => {
    try {
        const result = await global.api.characters.getByAccountId(session.accountId);
        const chars = (result && result.characters) ? result.characters : [];
        session.characters = chars;
        authStage.set(src, session);
        emitNet('identity-core:client:charList', src, chars);
    } catch (err) {
        console.error(`^1[CHARSELECT]^7 Ошибка загрузки персонажей: ${err.message}`);
        emitNet('identity-core:client:charList', src, []);
    }
};

onNet('identity-core:server:charSelectReady', async () => {
    const src = global.source;
    const session = authStage.get(src);
    if (!session || session.stage !== STAGE.CHARSELECT) return;

    SetPlayerRoutingBucket(String(src), CHARSELECT_BUCKET_BASE + (src % 60000));

    await loadAndSendCharacters(src, session);
});

onNet('identity-core:server:selectCharacter', async (charId) => {
    const src = global.source;
    const session = authStage.get(src);
    if (!session || session.stage !== STAGE.CHARSELECT) return;
    if (session.spawnPending) return;

    const chars = session.characters || [];
    const character = chars.find((c) => String(c.id) === String(charId));

    if (!character) {
        emitNet('identity-core:client:charError', src, 'Персонаж не найден');
        return;
    }

    if (character.charstatus !== 2) {
        emitNet('identity-core:client:charError', src, 'Персонаж ещё не подтверждён');
        return;
    }

    session.characterId = character.id;
    authStage.set(src, session);

    const appearance = character.appearance;
    const isEmpty = !appearance || (typeof appearance === 'object' && Object.keys(appearance).length === 0);

    if (isEmpty) {
        console.log(`^3[CHARSELECT]^7 ${GetPlayerName(src)} создаёт внешность для "${character.firstname} ${character.lastname}"`);
        emitNet('identity-core:client:enterEditor', src, character);
        return;
    }

    session.spawnPending = true;
    session.stage = STAGE.PLAYING;
    authStage.set(src, session);

    SetPlayerRoutingBucket(String(src), 0);

    console.log(`^2[CHARSELECT]^7 ${GetPlayerName(src)} выбрал персонажа "${character.firstname} ${character.lastname}" (${character.id})`);

    emitNet('identity-core:client:spawnCharacter', src, character);
});

onNet('identity-core:server:saveAppearance', async (appearance) => {
    const src = global.source;
    const session = authStage.get(src);
    if (!session || !session.characterId) return;
    if (session.spawnPending) return;

    if (!appearance || typeof appearance !== 'object' || !appearance.model || !appearance.components) {
        emitNet('identity-core:client:appearanceSaveFailed', src, 'Некорректные данные внешности');
        return;
    }

    session.spawnPending = true;
    authStage.set(src, session);

    try {
        await global.api.characters.updateAppearance(session.characterId, appearance);

        const chars = session.characters || [];
        const character = chars.find((c) => String(c.id) === String(session.characterId));
        if (character) character.appearance = appearance;

        session.stage = STAGE.PLAYING;
        session.spawnPending = false;
        authStage.set(src, session);

        SetPlayerRoutingBucket(String(src), 0);

        console.log(`^2[EDITOR]^7 ${GetPlayerName(src)} сохранил внешность персонажа ${session.characterId}`);
        emitNet('identity-core:client:spawnCharacter', src, character || { id: session.characterId, appearance });
    } catch (err) {
        session.spawnPending = false;
        authStage.set(src, session);

        console.error(`^1[EDITOR]^7 Ошибка сохранения внешности (acc ${session.accountId}): ${err.message}`);
        emitNet('identity-core:client:appearanceSaveFailed', src, 'Не удалось сохранить. Проверьте соединение и попробуйте снова');
    }
});

onNet('identity-core:server:logout', () => {
    const src = global.source;
    const session = authStage.get(src);
    if (!session) return;

    SetPlayerRoutingBucket(String(src), CHARSELECT_BUCKET_BASE + (src % 60000));

    session.accountId = null;
    session.login = null;
    session.adminlevel = 0;
    session.characters = [];
    session.characterId = null;
    session.spawnPending = false;
    session.stage = STAGE.LOGIN;
    authStage.set(src, session);

    console.log(`^3[AUTH]^7 ${GetPlayerName(src)} вышел из аккаунта`);
    emitNet('identity-core:client:enterLogin', src);
});

onNet('identity-core:server:requestDisconnect', () => {
    const src = global.source;
    DropPlayer(String(src), 'Вы вышли из игры');
});

on('playerDropped', () => {
    const src = global.source;
    authStage.delete(src);
});

global.exports = global.exports || {};
