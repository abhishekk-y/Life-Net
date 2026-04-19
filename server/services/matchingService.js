const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const logger = require('../utils/logger');

/**
 * Blood group compatibility chart for transfusions.
 * Key = recipient blood group, Value = compatible donor groups.
 */
const BLOOD_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal recipient
};

/**
 * Smart organ matching algorithm.
 * Weights: blood group match > viability > location proximity
 * Returns sorted array of organ matches with scores.
 */
const findOrganMatches = async ({ organType, bloodGroup, patientAge, location, limit = 10 }) => {
  // Find available organs of the requested type with compatible blood groups
  const compatibleGroups = BLOOD_COMPATIBILITY[bloodGroup] || [bloodGroup];

  const organs = await Organ.find({
    organType,
    bloodGroup: { $in: compatibleGroups },
    status: 'AVAILABLE',
  })
    .populate('procurementCenter', 'name organization address')
    .lean({ virtuals: true });

  // Score each match
  const scored = organs
    .filter((organ) => organ.isViable) // Only viable organs
    .map((organ) => {
      let score = 0;

      // Exact blood group match = highest priority (40 pts)
      if (organ.bloodGroup === bloodGroup) score += 40;
      else score += 20; // Compatible but not exact

      // Viability — more hours remaining = better (up to 30 pts)
      const viabilityRatio = organ.hoursRemaining / organ.viabilityHours;
      score += Math.round(viabilityRatio * 30);

      // Age proximity — closer donor age = better match (up to 20 pts)
      if (patientAge && organ.donorAge) {
        const ageDiff = Math.abs(patientAge - organ.donorAge);
        score += Math.max(0, 20 - ageDiff);
      }

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
 * Smart blood matching — find compatible blood units.
 */
const findBloodMatches = async ({ bloodGroup, component, quantity, location, limit = 10 }) => {
  const compatibleGroups = BLOOD_COMPATIBILITY[bloodGroup] || [bloodGroup];

  const query = {
    bloodGroup: { $in: compatibleGroups },
    status: 'AVAILABLE',
    expiryDate: { $gt: new Date() }, // Not expired
  };

  if (component) query.component = component;

  const units = await BloodUnit.find(query)
    .populate('bloodBank', 'name organization address')
    .lean({ virtuals: true });

  // Score matches
  const scored = units
    .map((unit) => {
      let score = 0;

      // Exact blood group match (40 pts)
      if (unit.bloodGroup === bloodGroup) score += 40;
      else score += 20;

      // More days until expiry = better (up to 30 pts)
      score += Math.min(30, unit.daysUntilExpiry);

      // Temperature status (20 pts)
      if (unit.tempStatus === 'OPTIMAL') score += 20;
      else if (unit.tempStatus === 'WARNING') score += 10;

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

module.exports = { findOrganMatches, findBloodMatches, BLOOD_COMPATIBILITY };
