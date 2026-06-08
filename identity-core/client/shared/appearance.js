const DEFAULT_APPEARANCE = {
    model: 'mp_m_freemode_01',
    headBlend: {
        shapeFirst: 0,
        shapeSecond: 0,
        shapeThird: 0,
        skinFirst: 0,
        skinSecond: 0,
        skinThird: 0,
        shapeMix: 0.5,
        skinMix: 0.5,
        thirdMix: 0.0
    },
    faceFeatures: {
        noseWidth: 0.0,
        nosePeakHigh: 0.0,
        nosePeakSize: 0.0,
        noseBoneHigh: 0.0,
        nosePeakLowering: 0.0,
        noseBoneTwist: 0.0,
        eyeBrowHigh: 0.0,
        eyeBrowForward: 0.0,
        cheeksBoneHigh: 0.0,
        cheeksBoneWidth: 0.0,
        cheeksWidth: 0.0,
        eyesOpening: 0.0,
        lipsThickness: 0.0,
        jawBoneWidth: 0.0,
        jawBoneBackLength: 0.0,
        chinBoneLowering: 0.0,
        chinBoneLength: 0.0,
        chinBoneSize: 0.0,
        chinHole: 0.0,
        neckThickness: 0.0
    },
    headOverlays: {
        blemishes: { style: 255, opacity: 0.0, color: 0 },
        beard: { style: 255, opacity: 0.0, color: 0 },
        eyebrows: { style: 255, opacity: 0.0, color: 0 },
        ageing: { style: 255, opacity: 0.0, color: 0 },
        makeup: { style: 255, opacity: 0.0, color: 0 },
        blush: { style: 255, opacity: 0.0, color: 0 },
        complexion: { style: 255, opacity: 0.0, color: 0 },
        sunDamage: { style: 255, opacity: 0.0, color: 0 },
        lipstick: { style: 255, opacity: 0.0, color: 0 },
        moleAndFreckles: { style: 255, opacity: 0.0, color: 0 },
        chestHair: { style: 255, opacity: 0.0, color: 0 },
        bodyBlemishes: { style: 255, opacity: 0.0, color: 0 }
    },
    hair: {
        style: 0,
        color: 0,
        highlight: 0,
        texture: 0
    },
    eyeColor: 0,
    components: [
        { component_id: 1, drawable: 0, texture: 0 },
        { component_id: 3, drawable: 15, texture: 0 },
        { component_id: 4, drawable: 21, texture: 0 },
        { component_id: 5, drawable: 0, texture: 0 },
        { component_id: 6, drawable: 34, texture: 0 },
        { component_id: 7, drawable: 0, texture: 0 },
        { component_id: 8, drawable: 15, texture: 0 },
        { component_id: 9, drawable: 0, texture: 0 },
        { component_id: 10, drawable: 0, texture: 0 },
        { component_id: 11, drawable: 15, texture: 0 }
    ],
    props: [
        { prop_id: 0, drawable: -1, texture: 0 },
        { prop_id: 1, drawable: -1, texture: 0 },
        { prop_id: 2, drawable: -1, texture: 0 },
        { prop_id: 6, drawable: -1, texture: 0 },
        { prop_id: 7, drawable: -1, texture: 0 }
    ],
    tattoos: []
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_APPEARANCE };
}
