let inAuthLimbo = false;
let waitingForEnter = false;

const beginLimbo = async () => {
    if (inAuthLimbo || waitingForEnter) return;

    const ped = PlayerPedId();
    SetEntityVisible(ped, false, false);
    FreezeEntityPosition(ped, true);
    SetPlayerControl(PlayerId(), false, 0);

    if (global.IdentityScene) {
        await global.IdentityScene.start();
    }

    SendLoadingScreenMessage(JSON.stringify({ action: 'showEnterScreen' }));
    waitingForEnter = true;
};

const confirmEnter = () => {
    if (!waitingForEnter) return;
    waitingForEnter = false;
    inAuthLimbo = true;

    DoScreenFadeOut(0);
    ShutdownLoadingScreen();
    ShutdownLoadingScreenNui();

    DoScreenFadeIn(800);

    setTimeout(() => {
        if (inAuthLimbo) emit('identity-ui:client:showLogin');
    }, 600);
};

const exitLimbo = () => {
    if (!inAuthLimbo) return;
    inAuthLimbo = false;

    if (global.IdentityScene) global.IdentityScene.stop();

    const ped = PlayerPedId();
    SetEntityVisible(ped, true, false);
    FreezeEntityPosition(ped, false);
    SetPlayerControl(PlayerId(), true, 0);
};

global.IdentityAuth = {
    enterLimbo: beginLimbo,
    exitLimbo,
    isInLimbo: () => inAuthLimbo
};

setTick(() => {
    if (waitingForEnter) {
        const click = IsControlJustPressed(0, 24) || IsDisabledControlJustPressed(0, 24) ||
                      IsControlJustPressed(2, 237) || IsDisabledControlJustPressed(2, 237);
        if (click) {
            confirmEnter();
        }
        return;
    }
    if (!inAuthLimbo) return;
    DisableAllControlActions(0);
    ThefeedHideThisFrame();
    HideHudAndRadarThisFrame();
});

onNet('identity-core:client:enterLogin', () => {
    if (inAuthLimbo) {
        if (global.IdentityCharPreview) global.IdentityCharPreview.stop();
        if (global.IdentityScene && global.IdentityScene.resume) {
            global.IdentityScene.resume();
        }
        emit('identity-ui:client:showLogin');
    } else {
        beginLimbo();
    }
});

on('identity-core:client:loginAttempt', (identifier, password) => {
    emitNet('identity-core:server:loginAttempt', identifier, password);
});

onNet('identity-core:client:loginError', (message) => {
    emit('identity-ui:client:loginError', message);
});

onNet('identity-core:client:loginSuccess', () => {
    emit('identity-ui:client:loginSuccess');
});

onNet('identity-core:client:enterCharSelect', () => {
    emitNet('identity-core:server:charSelectReady');
});

onNet('identity-core:client:charList', (characters) => {
    emit('identity-ui:client:showCharSelect', characters);
});

on('identity-core:client:characterChosen', (charId) => {
    emitNet('identity-core:server:selectCharacter', charId);
});

onNet('identity-core:client:charError', (message) => {
    emit('identity-ui:client:charError', message);
});

onNet('identity-core:client:enterEditor', (character) => {
    emit('identity-ui:client:hideCharSelect');
    if (global.IdentityCharPreview) global.IdentityCharPreview.stop();
    if (global.IdentityEditor) {
        global.IdentityEditor.start(character);
    }
});

onNet('identity-core:client:appearanceSaveFailed', (message) => {
    emit('identity-ui:loader:hide');
    emit('identity-ui:client:editorSaveFailed', message);
});

on('identity-core:client:disconnect', () => {
    emitNet('identity-core:server:requestDisconnect');
});

on('identity-core:client:logout', () => {
    emit('identity-ui:client:hideCharSelect');
    if (global.IdentityCharPreview) global.IdentityCharPreview.stop();
    emitNet('identity-core:server:logout');
});

on('identity-core:client:editorBack', () => {
    if (global.IdentityEditor) global.IdentityEditor.stop();
    emit('identity-ui:client:hideEditor');
    if (global.IdentityScene && global.IdentityScene.resume) global.IdentityScene.resume();
    emitNet('identity-core:server:charSelectReady');
});

onNet('identity-core:client:spawnCharacter', (character) => {
    emit('identity-ui:client:hideCharSelect');
    emit('identity-ui:client:hideEditor');
    if (global.IdentityCharPreview) global.IdentityCharPreview.stop();
    if (global.IdentityEditor) global.IdentityEditor.stop();
    if (global.IdentitySpawn) {
        global.IdentitySpawn.spawnCharacter(character);
    }
});

setTimeout(() => {
    emitNet('identity-core:server:clientReady');
}, 500);
