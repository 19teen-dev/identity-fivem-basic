let previewPed = null;
let previewCam = null;
let previewActive = false;

const PREVIEW = {
    ped: { x: -1383.0, y: -1483.0, z: 4.0, h: 300.0 },
    cam: { x: -1381.2, y: -1485.4, z: 4.6, pitch: 0.0, yaw: 125.0 },
    fov: 38.0
};

const loadModel = async (model) => {
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

const startPreview = async (character) => {
    const p = PREVIEW.ped;

    if (previewPed && DoesEntityExist(previewPed)) {
        DeleteEntity(previewPed);
        previewPed = null;
    }

    const hash = await loadModel('mp_m_freemode_01');
    if (!hash) return;

    previewPed = CreatePed(4, hash, p.x, p.y, p.z, p.h, false, false);
    SetEntityAsMissionEntity(previewPed, true, true);
    FreezeEntityPosition(previewPed, true);
    SetBlockingOfNonTemporaryEvents(previewPed, true);
    TaskStartScenarioInPlace(previewPed, 'WORLD_HUMAN_STAND_IMPATIENT', 0, true);
    SetModelAsNoLongerNeeded(hash);

    if (!previewCam) {
        const c = PREVIEW.cam;
        previewCam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', c.x, c.y, c.z, c.pitch, 0.0, c.yaw, PREVIEW.fov, true, 2);
        if (global.IdentityScene && global.IdentityScene.getCam) {
            const sceneCam = global.IdentityScene.getCam();
            if (sceneCam) {
                SetCamActiveWithInterp(previewCam, sceneCam, 700, 0, 0);
                if (global.IdentityScene.pause) global.IdentityScene.pause();
            } else {
                SetCamActive(previewCam, true);
                RenderScriptCams(true, true, 600, true, true);
            }
        } else {
            SetCamActive(previewCam, true);
            RenderScriptCams(true, true, 600, true, true);
        }
    }

    previewActive = true;
};

const stopPreview = () => {
    if (previewPed && DoesEntityExist(previewPed)) {
        DeleteEntity(previewPed);
        previewPed = null;
    }
    if (previewCam) {
        if (global.IdentityScene && global.IdentityScene.getCam) {
            const sceneCam = global.IdentityScene.getCam();
            if (sceneCam) {
                if (global.IdentityScene.resume) global.IdentityScene.resume();
                SetCamActiveWithInterp(sceneCam, previewCam, 600, 0, 0);
            }
        }
        setTimeout(() => {
            if (previewCam) {
                DestroyCam(previewCam, false);
                previewCam = null;
            }
        }, 650);
    }
    previewActive = false;
};

on('identity-core:client:charPreview', (charId) => {
    startPreview({ id: charId });
});

on('identity-core:client:charBack', () => {
    stopPreview();
});

on('identity-core:client:hideCharSelectPreview', () => {
    if (previewPed && DoesEntityExist(previewPed)) {
        DeleteEntity(previewPed);
        previewPed = null;
    }
    if (previewCam) {
        DestroyCam(previewCam, false);
        previewCam = null;
    }
    previewActive = false;
});

global.IdentityCharPreview = {
    start: startPreview,
    stop: stopPreview,
    isActive: () => previewActive
};
