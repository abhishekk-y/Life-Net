const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const { getOrganTiming, getDaysUntilExpiry } = require('../utils/resourceTime');

/**
 * Builds an operational shortlist from reported resource fields. This is not a clinical allocation algorithm.
 */
const findOrganMatches = async ({ organType, bloodGroup, location, limit = 10 }) => {
  // Use exact reported blood group as a conservative shortlist criterion. A clinical
  // team must still confirm compatibility and suitability before assignment.
  const organs = await Organ.find({
    organType,
    bloodGroup,
    status: 'AVAILABLE',
  })
    .populate('procurementCenter', 'name organization address')
    .lean({ virtuals: true });

  const now = Date.now();
  const scored = organs
    .map((organ) => ({ ...organ, ...getOrganTiming(organ, now) }))
    .filter((organ) => organ.isViable)
    .map((organ) => {
      let score = 0;

      // Exact blood group match = highest priority (40 pts)
      if (organ.bloodGroup === bloodGroup) score += 40;

      // Viability — more hours remaining = better (up to 30 pts)
      const viabilityRatio = organ.hoursRemaining / organ.viabilityHours;
      score += Math.round(viabilityRatio * 30);

      // Location match (up to 10 pts)
      if (location && organ.location?.city) {
        if (organ.location.city === location.city) score += 10;
        else if (organ.location.state === location.state) score += 5;
      }

      return { ...organ, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
};

/**
 * Builds a non-clinical shortlist of reported blood stock.
 */
const findBloodMatches = async ({ bloodGroup, component, quantity, location, limit = 10 }) => {
  // Do not infer component compatibility from an ABO table. Keep the shortlist
  // to the exact reported group and require a qualified cross-match before use.
  const query = {
    bloodGroup,
    status: 'AVAILABLE',
    expiryDate: { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) }, // Date-only expiry remains valid through that UTC date
  };

  if (component) query.component = component;
  if (quantity) query.units = { $gte: quantity };

  const units = await BloodUnit.find(query)
    .populate('bloodBank', 'name organization address')
    .lean({ virtuals: true });

  const now = Date.now();
  const scored = units
    .map((unit) => ({ ...unit, daysUntilExpiry: getDaysUntilExpiry(unit.expiryDate, now) }))
    .map((unit) => {
      let score = 0;

      // Exact blood group match (40 pts)
      score += 40;

      // More days until expiry = better (up to 30 pts)
      score += Math.min(30, unit.daysUntilExpiry);

      // Location match (10 pts)
      if (location && unit.location?.city) {
        if (unit.location.city === location.city) score += 10;
        else if (unit.location.state === location.state) score += 5;
      }

      return { ...unit, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
};

module.exports = { findOrganMatches, findBloodMatches };
