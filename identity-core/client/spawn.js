const ensureNoAutoSpawn = () => {
    if (exports.spawnmanager) {
        exports.spawnmanager.setAutoSpawn(false);
    }
};

on('onClientResourceStart', (resName) => {
    if (resName === GetCurrentResourceName()) ensureNoAutoSpawn();
});

ensureNoAutoSpawn();

on('playerSpawned', () => {
    if (global.IdentityAuth && global.IdentityAuth.isInLimbo()) {
        return;
    }
    ensureNoAutoSpawn();
});

const SPAWN_FACE_INDICES = {
    noseWidth: 0, nosePeakHigh: 1, nosePeakSize: 2, noseBoneHigh: 3,
    nosePeakLowering: 4, noseBoneTwist: 5, eyeBrowHigh: 6, eyeBrowForward: 7,
    cheeksBoneHigh: 8, cheeksBoneWidth: 9, cheeksWidth: 10, eyesOpening: 11,
    lipsThickness: 12, jawBoneWidth: 13, jawBoneBackLength: 14, chinBoneLowering: 15,
    chinBoneLength: 16, chinBoneSize: 17, chinHole: 18, neckThickness: 19
};

const loadSpawnModel = async (model) => {
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

const applyAppearanceToPlayer = (appearance) => {
    const ped = PlayerPedId();
    if (!appearance) return;

    SetPedDefaultComponentVariation(ped);

    if (appearance.headBlend) {
        const h = appearance.headBlend;
        SetPedHeadBlendData(ped, h.shapeFirst || 0, h.shapeSecond || 0, h.shapeThird || 0, h.skinFirst || 0, h.skinSecond || 0, h.skinThird || 0, h.shapeMix || 0.5, h.skinMix || 0.5, h.thirdMix || 0.0, false);
    }

    if (appearance.faceFeatures) {
        for (const key in SPAWN_FACE_INDICES) {
            SetPedFaceFeature(ped, SPAWN_FACE_INDICES[key], appearance.faceFeatures[key] || 0.0);
        }
    }

    if (appearance.components) {
        for (const c of appearance.components) {
            SetPedComponentVariation(ped, c.component_id, c.drawable, c.texture, 0);
        }
    }

    if (appearance.hair) {
        const hair = appearance.hair;
        SetPedComponentVariation(ped, 2, hair.style || 0, 0, 0);
        SetPedHairColor(ped, hair.color || 0, (hair.highlight !== undefined ? hair.highlight : hair.color) || 0);
    }

    if (appearance.headOverlays) {
        const SPAWN_OVERLAY_IDS = { beard: 1, eyebrows: 2 };
        for (const name in SPAWN_OVERLAY_IDS) {
            const id = SPAWN_OVERLAY_IDS[name];
            const data = appearance.headOverlays[name];
            if (!data) continue;
            SetPedHeadOverlay(ped, id, data.style, data.opacity);
            if (data.style !== 255) {
                SetPedHeadOverlayColor(ped, id, 1, data.color || 0, data.color || 0);
            }
        }
    }

    if (typeof appearance.eyeColor === 'number') {
        SetPedEyeColor(ped, appearance.eyeColor);
    }

    if (appearance.props) {
        for (const p of appearance.props) {
            if (p.drawable === -1) {
                ClearPedProp(ped, p.prop_id);
            } else {
                SetPedPropIndex(ped, p.prop_id, p.drawable, p.texture, true);
            }
        }
    }
};

const resolveModel = (data) => {
    if (data.appearance && data.appearance.model) return data.appearance.model;
    if (data.sex === 'female') return 'mp_f_freemode_01';
    return 'mp_m_freemode_01';
};

const resolvePosition = (data) => {
    if (data.position && typeof data.position.x === 'number') {
        return { x: data.position.x, y: data.position.y, z: data.position.z, heading: data.position.heading || 0.0 };
    }
    if (typeof data.pos_x === 'number') {
        return { x: data.pos_x, y: data.pos_y, z: data.pos_z, heading: data.heading || 0.0 };
    }
    return { x: -1037.0, y: -2738.0, z: 20.0, heading: 0.0 };
};

global.IdentitySpawn = {
    spawnCharacter: async (data) => {
        const model = resolveModel(data);
        const pos = resolvePosition(data);

        emit('identity-ui:loader:show');

        const hash = await loadSpawnModel(model);
        if (hash) {
            SetPlayerModel(PlayerId(), hash);
            SetModelAsNoLongerNeeded(hash);
        }

        exports.spawnmanager.spawnPlayer({
            x: pos.x,
            y: pos.y,
            z: pos.z,
            heading: pos.heading,
            model: model,
            skipFade: false
        }, () => {
            const ped = PlayerPedId();
            SetEntityVisible(ped, true, false);
            applyAppearanceToPlayer(data.appearance);
            SetEntityVisible(ped, true, false);
            FreezeEntityPosition(ped, false);
            SetPlayerControl(PlayerId(), true, 0);
            if (global.IdentityAuth) global.IdentityAuth.exitLimbo();
            emit('identity-ui:playing', true);
            setTimeout(() => {
                emit('identity-ui:loader:hide');
            }, 800);
        });
    }
};
