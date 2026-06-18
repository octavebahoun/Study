const User = require('../models/User');
const Semester = require('../models/Semester');

const BADGES_DEF = {
  first_note: {
    id: 'first_note',
    icon: '📝',
    name: 'Première note',
    description: 'Tu as entré ta première note'
  },
  perfect: {
    id: 'perfect',
    icon: '⭐',
    name: 'Perfection',
    description: '20/20 obtenu'
  },
  target_hit: {
    id: 'target_hit',
    icon: '🎯',
    name: 'Objectif atteint',
    description: 'Moyenne cible dépassée sur une matière'
  },
  semester_done: {
    id: 'semester_done',
    icon: '🏅',
    name: 'Semestre validé',
    description: 'Semestre complété'
  },
  streak: {
    id: 'streak',
    icon: '🔥',
    name: 'En feu',
    description: '3 bonnes notes consécutives'
  }
};

/**
 * Calcule la moyenne d'un ensemble de notes pour un préfixe donné (i ou d)
 */
function calculateGroupAverage(scores, prefix) {
  const groupScores = Object.keys(scores)
    .filter(key => key.toLowerCase().startsWith(prefix.toLowerCase()))
    .map(key => Number(scores[key]))
    .filter(val => !isNaN(val));

  if (groupScores.length === 0) return null;
  const sum = groupScores.reduce((a, b) => a + b, 0);
  return sum / groupScores.length;
}

/**
 * Évalue la moyenne globale selon la règle : (Avg(Interros) + Avg(Devoirs)) / 2
 */
function evaluateFormula(scores) {
  const avgI = calculateGroupAverage(scores, 'i');
  const avgD = calculateGroupAverage(scores, 'd');

  if (avgI !== null && avgD !== null) return (avgI + avgD) / 2;
  if (avgI !== null) return avgI;
  if (avgD !== null) return avgD;
  return null;
}

/**
 * Checks and awards badges to a user.
 * Returns true if new badges were awarded, false otherwise.
 */
async function checkAndAwardBadges(user) {
  const semesters = await Semester.find({ userId: user._id });
  const newBadges = [];

  // Helper to check if a badge is already earned
  const hasBadge = (badgeId) => {
    return user.badges.some(b => b.id === badgeId) || newBadges.some(b => b.id === badgeId);
  };

  const awardBadge = (badgeId) => {
    if (!hasBadge(badgeId) && BADGES_DEF[badgeId]) {
      newBadges.push({
        ...BADGES_DEF[badgeId],
        earnedAt: new Date()
      });
    }
  };

  // 1. first_note : Première note saisie (any control has score !== null)
  let anyScoreEntered = false;
  let hasPerfectScore = false;
  const allCompletedControls = []; // for streak

  for (const sem of semesters) {
    for (const subj of sem.subjects) {
      for (const ctrl of subj.controls) {
        if (ctrl.score !== null && ctrl.score !== undefined) {
          anyScoreEntered = true;
          if (ctrl.score === 20) {
            hasPerfectScore = true;
          }
          if (ctrl.date) {
            allCompletedControls.push({
              date: new Date(ctrl.date),
              score: ctrl.score
            });
          }
        }
      }
    }
  }

  if (anyScoreEntered) {
    awardBadge('first_note');
  }

  // 2. perfect : 20/20 obtenu
  if (hasPerfectScore) {
    awardBadge('perfect');
  }

  // 3. target_hit : Moyenne cible dépassée sur une matière
  let targetHit = false;
  for (const sem of semesters) {
    for (const subj of sem.subjects) {
      const scores = {};
      subj.controls.forEach(c => {
        if (c.score !== null && c.score !== undefined) {
          scores[c.variable] = c.score;
        }
      });
      if (Object.keys(scores).length > 0) {
        const avg = evaluateFormula(scores);
        if (avg !== null && avg >= subj.targetAverage) {
          targetHit = true;
          break;
        }
      }
    }
  }
  if (targetHit) {
    awardBadge('target_hit');
  }

  // 4. semester_done : Semestre complété (isCompleted is true)
  const anySemesterCompleted = semesters.some(sem => sem.isCompleted);
  if (anySemesterCompleted) {
    awardBadge('semester_done');
  }

  // 5. streak : 3 bonnes notes consécutives (3 controls in a row with score >= 12, sorted by date)
  // Let's sort controls by date ascending
  allCompletedControls.sort((a, b) => a.date - b.date);
  let consecutiveCount = 0;
  let hasStreak = false;
  for (const ctrl of allCompletedControls) {
    if (ctrl.score >= 12) {
      consecutiveCount++;
      if (consecutiveCount >= 3) {
        hasStreak = true;
        break;
      }
    } else {
      consecutiveCount = 0;
    }
  }
  if (hasStreak) {
    awardBadge('streak');
  }

  if (newBadges.length > 0) {
    user.badges.push(...newBadges);
    await user.save();
    return true;
  }
  return false;
}

module.exports = {
  checkAndAwardBadges
};
