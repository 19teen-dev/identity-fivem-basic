let editorPed = null;
let editorCam = null;
let editorActive = false;
let editorHeading = 180.0;
let currentZone = 'body';
let currentAppearance = null;

const EDITOR = {
    ped: { x: -1383.0, y: -1483.0, z: 4.0, h: 180.0 },
    zones: {
        body: { offset: { x: 0.0, y: 2.4, z: 0.2 }, point: { x: 0.0, y: 0.0, z: 0.2 }, fov: 42.0 },
        face: { offset: { x: 0.0, y: 0.9, z: 0.65 }, point: { x: 0.0, y: 0.0, z: 0.62 }, fov: 24.0 },
        torso: { offset: { x: 0.0, y: 1.5, z: 0.35 }, point: { x: 0.0, y: 0.0, z: 0.3 }, fov: 38.0 },
        legs: { offset: { x: 0.0, y: 1.8, z: -0.4 }, point: { x: 0.0, y: 0.0, z: -0.5 }, fov: 40.0 }
    }
};

const FACE_FEATURE_INDICES = {
    noseWidth: 0, nosePeakHigh: 1, nosePeakSize: 2, noseBoneHigh: 3,
    nosePeakLowering: 4, noseBoneTwist: 5, eyeBrowHigh: 6, eyeBrowForward: 7,
    cheeksBoneHigh: 8, cheeksBoneWidth: 9, cheeksWidth: 10, eyesOpening: 11,
    lipsThickness: 12, jawBoneWidth: 13, jawBoneBackLength: 14, chinBoneLowering: 15,
    chinBoneLength: 16, chinBoneSize: 17, chinHole: 18, neckThickness: 19
};

const loadEditorModel = async (model) => {
    const hash = (typeof model === 'string') ? GetHashKey(model) : model;
    if (!IsModelInCdimage(hash)) return null;
    RequestModel(hash);
    let tries = 0;
    while (!HasModelLoaded(hash) && tries < 100) {
        await new Promise((r) => setTimeout(r, 50));
        tries++;
    }
    return HasModelLoaded(hash) ? hash : null;
};

const rotateVector = (x, y, headingDeg) => {
    const rad = headingDeg * Math.PI / 180.0;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return { x: x * cos - y * sin, y: x * sin + y * cos };
};

const makeDefaultAppearance = (model) => ({
    model: model || 'mp_m_freemode_01',
    headBlend: { shapeFirst: 0, shapeSecond: 0, shapeThird: 0, skinFirst: 0, skinSecond: 0, skinThird: 0, shapeMix: 0.5, skinMix: 0.5, thirdMix: 0.0 },
    faceFeatures: Object.fromEntries(Object.keys(FACE_FEATURE_INDICES).map((k) => [k, 0.0])),
    headOverlays: {
        beard: { style: 255, opacity: 0.0, color: 0 },
        eyebrows: { style: 255, opacity: 1.0, color: 0 }
    },
    hair: { style: 0, color: 0, highlight: 0, texture: 0 },
    eyeColor: 0,
    components: [],
    props: [],
    tattoos: []
});

const OVERLAY_IDS = { beard: 1, eyebrows: 2 };

const applyZone = (zoneName) => {
    if (!editorPed || !editorCam) return;
    const zone = EDITOR.zones[zoneName] || EDITOR.zones.body;
    currentZone = zoneName;

    const pc = GetEntityCoords(editorPed);
    const baseHeading = EDITOR.ped.h;

    const camOff = rotateVector(zone.offset.x, zone.offset.y, baseHeading);
    const camX = pc[0] + camOff.x;
    const camY = pc[1] + camOff.y;
    const camZ = pc[2] + zone.offset.z;

    const tgtX = pc[0] + zone.point.x;
    const tgtY = pc[1] + zone.point.y;
    const tgtZ = pc[2] + zone.point.z;

    SetCamCoord(editorCam, camX, camY, camZ);
    PointCamAtCoord(editorCam, tgtX, tgtY, tgtZ);
    SetCamFov(editorCam, zone.fov);
};

const applyHeadBlend = () => {
    if (!editorPed || !currentAppearance) return;
    const h = currentAppearance.headBlend;
    SetPedHeadBlendData(editorPed, h.shapeFirst, h.shapeSecond, h.shapeThird, h.skinFirst, h.skinSecond, h.skinThird, h.shapeMix, h.skinMix, h.thirdMix, false);
};

const applyFaceFeatures = () => {
    if (!editorPed || !currentAppearance) return;
    const f = currentAppearance.faceFeatures;
    for (const key in FACE_FEATURE_INDICES) {
        SetPedFaceFeature(editorPed, FACE_FEATURE_INDICES[key], f[key] || 0.0);
    }
};

const syncComponentsFromPed = () => {
    if (!editorPed || !currentAppearance) return;
    const ids = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    currentAppearance.components = ids.map((id) => ({
        component_id: id,
        drawable: GetPedDrawableVariation(editorPed, id),
        texture: GetPedTextureVariation(editorPed, id)
    }));
};

const applyComponents = () => {
    if (!editorPed || !currentAppearance) return;
    for (const c of currentAppearance.components) {
        SetPedComponentVariation(editorPed, c.component_id, c.drawable, c.texture, 0);
    }
};

const applyHair = () => {
    if (!editorPed || !currentAppearance) return;
    const hair = currentAppearance.hair || { style: 0, color: 0, highlight: 0 };
    SetPedComponentVariation(editorPed, 2, hair.style || 0, 0, 0);
    SetPedHairColor(editorPed, hair.color || 0, (hair.highlight !== undefined ? hair.highlight : hair.color) || 0);
};

const applyOverlays = () => {
    if (!editorPed || !currentAppearance) return;
    const ov = currentAppearance.headOverlays || {};
    for (const name in OVERLAY_IDS) {
        const id = OVERLAY_IDS[name];
        const data = ov[name] || { style: 255, opacity: 0.0, color: 0 };
        SetPedHeadOverlay(editorPed, id, data.style, data.opacity);
        if (data.style !== 255) {
            SetPedHeadOverlayColor(editorPed, id, 1, data.color || 0, data.color || 0);
        }
    }
};

const applyEyeColor = () => {
    if (!editorPed || !currentAppearance) return;
    SetPedEyeColor(editorPed, currentAppearance.eyeColor || 0);
};

const setHair = (key, value) => {
    if (!currentAppearance) return;
    if (!currentAppearance.hair) currentAppearance.hair = { style: 0, color: 0, highlight: 0, texture: 0 };
    currentAppearance.hair[key] = value;
    applyHair();
};

const setOverlay = (name, key, value) => {
    if (!currentAppearance || !(name in OVERLAY_IDS)) return;
    if (!currentAppearance.headOverlays) currentAppearance.headOverlays = {};
    if (!currentAppearance.headOverlays[name]) currentAppearance.headOverlays[name] = { style: 255, opacity: 0.0, color: 0 };
    currentAppearance.headOverlays[name][key] = value;
    applyOverlays();
};

const setEyeColor = (value) => {
    if (!currentAppearance) return;
    currentAppearance.eyeColor = value;
    applyEyeColor();
};

const applyAll = () => {
    SetPedDefaultComponentVariation(editorPed);
    applyHeadBlend();
    applyFaceFeatures();
    if (currentAppearance.components && currentAppearance.components.length) {
        applyComponents();
    } else {
        syncComponentsFromPed();
    }
    applyHair();
    applyOverlays();
    applyEyeColor();
};

const setHeadBlendValue = (key, value) => {
    if (!currentAppearance) return;
    currentAppearance.headBlend[key] = value;
    applyHeadBlend();
    applyFaceFeatures();
};

const setFaceFeature = (key, value) => {
    if (!currentAppearance || !(key in FACE_FEATURE_INDICES)) return;
    currentAppearance.faceFeatures[key] = value;
    SetPedFaceFeature(editorPed, FACE_FEATURE_INDICES[key], value);
};

const changeModel = async (model) => {
    if (!currentAppearance) return;
    const hash = await loadEditorModel(model);
    if (!hash) return;
    const p = EDITOR.ped;
    if (editorPed && DoesEntityExist(editorPed)) DeleteEntity(editorPed);
    editorPed = CreatePed(4, hash, p.x, p.y, p.z, editorHeading, false, false);
    SetEntityAsMissionEntity(editorPed, true, true);
    SetEntityCoordsNoOffset(editorPed, p.x, p.y, p.z, false, false, false);
    SetEntityHeading(editorPed, editorHeading);
    FreezeEntityPosition(editorPed, true);
    SetEntityInvincible(editorPed, true);
    SetBlockingOfNonTemporaryEvents(editorPed, true);
    SetModelAsNoLongerNeeded(hash);
    currentAppearance.model = model;
    applyAll();
    applyZone(currentZone);
};

const startEditor = async (character) => {
    if (editorActive) return;
    editorActive = true;

    const appearance = (character && character.appearance) ? character.appearance : null;
    const sex = (character && character.sex) ? character.sex : 'male';
    const model = (appearance && appearance.model) ? appearance.model : (sex === 'female' ? 'mp_f_freemode_01' : 'mp_m_freemode_01');

    const hash = await loadEditorModel(model);
    if (!hash) {
        console.log(`^1[EDITOR]^7 модель не загрузилась: ${model}`);
        editorActive = false;
        return;
    }

    const p = EDITOR.ped;
    editorHeading = p.h;

    if (editorPed && DoesEntityExist(editorPed)) DeleteEntity(editorPed);
    editorPed = CreatePed(4, hash, p.x, p.y, p.z, p.h, false, false);

    if (!editorPed || !DoesEntityExist(editorPed)) {
        console.log('^1[EDITOR]^7 не удалось создать ped');
        editorActive = false;
        return;
    }

    SetEntityAsMissionEntity(editorPed, true, true);
    SetEntityCoordsNoOffset(editorPed, p.x, p.y, p.z, false, false, false);
    FreezeEntityPosition(editorPed, true);
    SetEntityInvincible(editorPed, true);
    SetEntityVisible(editorPed, true, false);
    SetBlockingOfNonTemporaryEvents(editorPed, true);
    SetModelAsNoLongerNeeded(hash);

    currentAppearance = (appearance && appearance.model) ? appearance : makeDefaultAppearance(model);
    applyAll();

    const zone = EDITOR.zones.body;
    const camOff = rotateVector(zone.offset.x, zone.offset.y, p.h);
    editorCam = CreateCamWithParams(
        'DEFAULT_SCRIPTED_CAMERA',
        p.x + camOff.x, p.y + camOff.y, p.z + zone.offset.z,
        0.0, 0.0, 0.0, zone.fov, true, 2
    );

    const sceneCam = (global.IdentityScene && global.IdentityScene.getCam) ? global.IdentityScene.getCam() : null;
    if (sceneCam) {
        SetCamActiveWithInterp(editorCam, sceneCam, 900, 0, 0);
        if (global.IdentityScene.pause) global.IdentityScene.pause();
    } else {
        SetCamActive(editorCam, true);
        RenderScriptCams(true, false, 0, true, true);
    }

    applyZone('body');

    emit('identity-ui:client:showEditor', currentAppearance);

    console.log('^2[EDITOR]^7 редактор внешности запущен');
};

const stopEditor = () => {
    if (!editorActive) return;
    editorActive = false;
    currentAppearance = null;

    if (editorPed && DoesEntityExist(editorPed)) {
        DeleteEntity(editorPed);
        editorPed = null;
    }
    if (editorCam) {
        DestroyCam(editorCam, false);
        editorCam = null;
    }
};

const setZone = (zoneName) => {
    if (!editorActive) return;
    applyZone(zoneName);
};

const rotatePed = (deltaDeg) => {
    if (!editorPed) return;
    editorHeading = (editorHeading + deltaDeg) % 360.0;
    SetEntityHeading(editorPed, editorHeading);
};

setTick(() => {
    if (!editorActive) return;
    DisableAllControlActions(0);
    ThefeedHideThisFrame();
    HideHudAndRadarThisFrame();

    if (IsDisabledControlPressed(0, 174)) rotatePed(-1.4);
    if (IsDisabledControlPressed(0, 175)) rotatePed(1.4);
});

on('identity-core:client:editorSetHeadBlend', (key, value) => { setHeadBlendValue(key, value); });
on('identity-core:client:editorSetFace', (key, value) => { setFaceFeature(key, value); });
on('identity-core:client:editorSetHair', (key, value) => { setHair(key, value); });
on('identity-core:client:editorSetOverlay', (name, key, value) => { setOverlay(name, key, value); });
on('identity-core:client:editorSetEyeColor', (value) => { setEyeColor(value); });
on('identity-core:client:editorSetZone', (zone) => { setZone(zone); });
on('identity-core:client:editorRotate', (delta) => { rotatePed(parseFloat(delta) || 0); });

on('identity-core:client:editorSave', () => {
    if (!currentAppearance) return;
    emit('identity-ui:client:editorSaving');
    emit('identity-ui:loader:show');
    emitNet('identity-core:server:saveAppearance', currentAppearance);
});

global.IdentityEditor = {
    start: startEditor,
    stop: stopEditor,
    setZone,
    rotate: rotatePed,
    setModel: changeModel,
    setHeadBlend: setHeadBlendValue,
    setFace: setFaceFeature,
    setHair,
    setOverlay,
    setEyeColor,
    getAppearance: () => currentAppearance,
    getPed: () => editorPed,
    isActive: () => editorActive
};

RegisterCommand('editorzone', (source, args) => {
    if (!editorActive) { console.log('^1[EDITOR]^7 не активен'); return; }
    setZone(args[0] || 'body');
}, false);
