const getOrganTiming = (organ, now = Date.now()) => {
  const harvestedAt = new Date(organ.harvestedAt).getTime();
  const viabilityHours = Number(organ.viabilityHours);
  if (!Number.isFinite(harvestedAt) || !Number.isFinite(viabilityHours) || viabilityHours <= 0) {
    return { isViable: false, hoursRemaining: 0, expiresAt: null };
  }
  const expiresAtMs = harvestedAt + viabilityHours * 3600000;
  const hoursRemaining = Math.max(0, (expiresAtMs - now) / 3600000);
  return {
    isViable: hoursRemaining > 0,
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    expiresAt: new Date(expiresAtMs),
  };
};

const getDaysUntilExpiry = (expiryDate, now = Date.now()) => {
  const expiryAt = new Date(expiryDate).getTime();
  if (!Number.isFinite(expiryAt)) return 0;
  return Math.max(0, Math.ceil((expiryAt - now) / 86400000));
};

module.exports = { getOrganTiming, getDaysUntilExpiry };
