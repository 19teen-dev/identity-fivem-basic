const FLYBYS = [
    {
        name: 'vespucci_sunset',
        weather: 'EXTRASUNNY',
        hour: 19,
        minute: 30,
        focus: { x: -1200.0, y: -1500.0, z: 5.0 },
        from: { x: -1240.0, y: -1560.0, z: 12.0, pitch: -4.0, yaw: 35.0 },
        to: { x: -1150.0, y: -1430.0, z: 18.0, pitch: -7.0, yaw: 25.0 },
        fov: 50.0,
        duration: 45000
    }
];

let flyCam = null;
let flyActive = false;

const LOAD_MS = 5500;

const drawLoadingText = () => {
    SetTextFont(4);
    SetTextScale(0.5, 0.5);
    SetTextColour(255, 255, 255, 200);
    SetTextCentre(true);
    BeginTextCommandDisplayText('STRING');
    AddTextComponentSubstringPlayerName('ЗАГРУЗКА МИРА...');
    EndTextCommandDisplayText(0.5, 0.88);
};

setTick(() => {
    if (flyActive && flyCam === null) drawLoadingText();
    flyTick();
});

let activeScene = null;
let flyStartTime = 0;
let flyPaused = false;
let flyPauseOffset = 0;

const lerp = (a, b, t) => a + (b - a) * t;

const flyTick = () => {
    if (!flyActive || flyCam === null || !activeScene || flyPaused) return;
    const s = activeScene;
    const dur = s.duration;

    const elapsed = (GetGameTimer() - flyStartTime) % (dur * 2);
    const phase = elapsed / dur;
    let t = phase <= 1 ? phase : (2 - phase);
    t = t * t * (3 - 2 * t);

    const a = s.from;
    const b = s.to;
    SetCamCoord(flyCam, lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
    SetCamRot(flyCam, lerp(a.pitch, b.pitch, t), 0.0, lerp(a.yaw, b.yaw, t), 2);
};

const runFly = (scene) => {
    activeScene = scene;
    flyPaused = false;
    flyStartTime = GetGameTimer();
    const a = scene.from;

    flyCam = CreateCamWithParams(
        'DEFAULT_SCRIPTED_CAMERA',
        a.x, a.y, a.z, a.pitch, 0.0, a.yaw,
        scene.fov, true, 2
    );
    SetCamActive(flyCam, true);
    RenderScriptCams(true, false, 0, true, true);
};

const pauseFly = () => {
    if (!activeScene) return;
    flyPauseOffset = GetGameTimer() - flyStartTime;
    flyPaused = true;
};

const resumeFly = () => {
    if (!flyActive || flyCam === null || !activeScene) return;
    flyStartTime = GetGameTimer() - flyPauseOffset;
    flyPaused = false;
};

const startScene = async () => {
    if (flyActive) return;
    flyActive = true;

    const scene = FLYBYS[Math.floor(Math.random() * FLYBYS.length)];

    SetWeatherTypeNowPersist(scene.weather);
    NetworkOverrideClockTime(scene.hour, scene.minute || 0, 0);

    const f = scene.focus;
    SetFocusPosAndVel(f.x, f.y, f.z, 0.0, 0.0, 0.0);
    await new Promise((r) => setTimeout(r, 1500));
    SetFocusPosAndVel(f.x, f.y, f.z, 0.0, 0.0, 0.0);
    await new Promise((r) => setTimeout(r, LOAD_MS - 1500));

    if (!flyActive) return;

    runFly(scene);

    global.IdentityScene.current = scene.name;
    console.log(`^2[SCENE]^7 пролёт "${scene.name}" запущен.`);
};

const stopScene = () => {
    if (!flyActive) return;
    flyActive = false;
    flyPaused = false;
    flyPauseOffset = 0;
    activeScene = null;

    ClearFocus();

    if (flyCam !== null) {
        RenderScriptCams(false, false, 0, true, true);
        DestroyCam(flyCam, false);
        flyCam = null;
    }
};

global.IdentityScene = {
    start: startScene,
    stop: stopScene,
    isActive: () => flyActive,
    getCam: () => flyCam,
    pause: pauseFly,
    resume: resumeFly
};

RegisterCommand('flycam', (source, args) => {
    if (!flyCam) { console.log('^1[FLY]^7 Пролёт не активен'); return; }
    const x = parseFloat(args[0]), y = parseFloat(args[1]), z = parseFloat(args[2]);
    const pitch = parseFloat(args[3] || -5.0), yaw = parseFloat(args[4] || 0.0);
    if (isNaN(x) || isNaN(y) || isNaN(z)) { console.log('^3[FLY]^7 flycam <x> <y> <z> [pitch] [yaw]'); return; }
    SetFocusPosAndVel(x, y, z, 0.0, 0.0, 0.0);
    SetCamParams(flyCam, x, y, z, pitch, 0.0, yaw, 50.0, 0, 0, 0, 2);
    console.log(`^2[FLY]^7 ${x}, ${y}, ${z} | pitch ${pitch} yaw ${yaw}`);
}, false);

RegisterCommand('flypos', () => {
    if (!flyCam) { console.log('^1[FLY]^7 Пролёт не активен'); return; }
    const co = GetCamCoord(flyCam);
    const ro = GetCamRot(flyCam, 2);
    console.log(`^2[FLY COPY]^7 { x: ${co[0].toFixed(1)}, y: ${co[1].toFixed(1)}, z: ${co[2].toFixed(1)}, pitch: ${ro[0].toFixed(1)}, yaw: ${ro[2].toFixed(1)} }`);
}, false);
