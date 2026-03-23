/**
 * Rating Engine — ELO calculation, XP, rank tiers
 */

const K_FACTOR = 32;

/**
 * Calculate new ELO ratings for winner/loser
 * @param {number} winnerRating
 * @param {number} loserRating
 * @param {boolean} isDraw
 * @returns {{ winnerNew: number, loserNew: number, winnerChange: number, loserChange: number }}
 */
const calculateNewRatings = (winnerRating, loserRating, isDraw = false) => {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;

  let actualWinner, actualLoser;
  if (isDraw) {
    actualWinner = 0.5;
    actualLoser = 0.5;
  } else {
    actualWinner = 1;
    actualLoser = 0;
  }

  const winnerChange = Math.round(K_FACTOR * (actualWinner - expectedWinner));
  const loserChange = Math.round(K_FACTOR * (actualLoser - expectedLoser));

  return {
    winnerNew: winnerRating + winnerChange,
    loserNew: Math.max(100, loserRating + loserChange),
    winnerChange,
    loserChange,
  };
};

/**
 * Calculate XP earned from a match
 */
const calculateXP = (score, accuracy, bestStreak, isWin) => {
  let xp = score * 2; // base XP from score
  xp += Math.floor(accuracy * 0.5); // accuracy bonus
  xp += bestStreak * 5; // streak bonus
  if (isWin) xp += 25; // win bonus
  return Math.max(0, xp);
};

/**
 * Determine rank tier from ELO
 */
const getRankTier = (elo) => {
  if (elo >= 2000) return "Elite";
  if (elo >= 1800) return "Master";
  if (elo >= 1500) return "Specialist";
  if (elo >= 1200) return "Scholar";
  return "Explorer";
};

module.exports = { calculateNewRatings, calculateXP, getRankTier, K_FACTOR };
