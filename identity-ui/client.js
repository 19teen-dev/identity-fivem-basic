on('identity-ui:client:showLogin', () => {
    SetNuiFocus(true, true);
    SendNuiMessage(JSON.stringify({ action: 'showLogin' }));
});

on('identity-ui:client:loginError', (message) => {
    SendNuiMessage(JSON.stringify({ action: 'loginError', message: message }));
});

on('identity-ui:client:loginSuccess', () => {
    SendNuiMessage(JSON.stringify({ action: 'loginSuccess' }));
});

RegisterNuiCallback('loginSubmit', (data, cb) => {
    emit('identity-core:client:loginAttempt', data.identifier, data.password);
    cb({ status: 'ok' });
});

on('identity-ui:client:showCharSelect', (characters) => {
    SetNuiFocus(true, true);
    SendNuiMessage(JSON.stringify({ action: 'showCharSelect', characters: characters }));
});

on('identity-ui:client:hideCharSelect', () => {
    SetNuiFocus(false, false);
    SendNuiMessage(JSON.stringify({ action: 'hideCharSelect' }));
});

on('identity-ui:client:charError', (message) => {
    SendNuiMessage(JSON.stringify({ action: 'charError', message: message }));
});

RegisterNuiCallback('charPreview', (data, cb) => {
    emit('identity-core:client:charPreview', data.id);
    cb({ status: 'ok' });
});

RegisterNuiCallback('charPlay', (data, cb) => {
    emit('identity-core:client:characterChosen', data.id);
    cb({ status: 'ok' });
});

RegisterNuiCallback('charBack', (data, cb) => {
    emit('identity-core:client:charBack');
    cb({ status: 'ok' });
});

RegisterNuiCallback('disconnect', (data, cb) => {
    emit('identity-core:client:disconnect');
    cb({ status: 'ok' });
});

RegisterNuiCallback('logout', (data, cb) => {
    emit('identity-core:client:logout');
    cb({ status: 'ok' });
});

on('identity-ui:client:showEditor', (appearance) => {
    SetNuiFocus(true, true);
    SendNuiMessage(JSON.stringify({ action: 'showEditor', appearance: appearance }));
});

on('identity-ui:client:hideEditor', () => {
    SetNuiFocus(false, false);
    SendNuiMessage(JSON.stringify({ action: 'hideEditor' }));
});

on('identity-ui:client:editorSaving', () => {
    SetNuiFocus(false, false);
});

on('identity-ui:client:editorSaveFailed', (message) => {
    SetNuiFocus(true, true);
    SendNuiMessage(JSON.stringify({ action: 'editorSaveFailed', message: message }));
});

RegisterNuiCallback('editorSetHeadBlend', (data, cb) => {
    emit('identity-core:client:editorSetHeadBlend', data.key, data.value);
    cb({ status: 'ok' });
});

RegisterNuiCallback('editorSetFace', (data, cb) => {
    emit('identity-core:client:editorSetFace', data.key, data.value);
    cb({ status: 'ok' });
});

RegisterNuiCallback('editorSetHair', (data, cb) => {
    emit('identity-core:client:editorSetHair', data.key, data.value);
    cb({ status: 'ok' });
});

RegisterNuiCallback('editorSetOverlay', (data, cb) => {
    emit('identity-core:client:editorSetOverlay', data.name, data.key, data.value);
    cb({ status: 'ok' });
});

RegisterNuiCallback('editorSetEyeColor', (data, cb) => {
    emit('identity-core:client:editorSetEyeColor', data.value);
    cb({ status: 'ok' });
});

RegisterNuiCallback('editorSetZone', (data, cb) => {
    emit('identity-core:client:editorSetZone', data.zone);
    cb({ status: 'ok' });
});

RegisterNuiCallback('editorRotate', (data, cb) => {
    emit('identity-core:client:editorRotate', data.delta);
    cb({ status: 'ok' });
});

RegisterNuiCallback('editorSave', (data, cb) => {
    emit('identity-core:client:editorSave');
    cb({ status: 'ok' });
});

RegisterNuiCallback('editorBack', (data, cb) => {
    emit('identity-core:client:editorBack');
    cb({ status: 'ok' });
});

on('identity-ui:loader:show', () => {
    SendNuiMessage(JSON.stringify({ type: 'loader', show: true }));
});

on('identity-ui:loader:hide', () => {
    SendNuiMessage(JSON.stringify({ type: 'loader', show: false }));
});

on('identity-ui:playing', (value) => {
    playing = !!value;
    SendNuiMessage(JSON.stringify({ type: 'playing', value: playing }));
    if (playing) dirty = true;
});
