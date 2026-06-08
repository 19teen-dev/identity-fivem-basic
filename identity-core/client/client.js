setTick(() => {
    SetVehicleDensityMultiplierThisFrame(0.0);
    SetPedDensityMultiplierThisFrame(0.0);
    SetRandomVehicleDensityMultiplierThisFrame(0.0);
    SetParkedVehicleDensityMultiplierThisFrame(0.0);
    SetScenarioPedDensityMultiplierThisFrame(0.0, 0.0);
});

global.addClientSlowTick(() => {
    const ped = PlayerPedId();
    if (GetEntityHealth(ped) < 100) {
        SetEntityHealth(ped, 100);
    }
});
