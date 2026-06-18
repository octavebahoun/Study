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
 * Extrait les variables uniques (ex: i1, d2) d'une formule.
 */
function extractVariables(formula) {
  if (!formula || typeof formula !== "string") return [];
  const matches = formula.match(/[a-zA-Z][a-zA-Z0-9]*/g) || [];
  const excludeList = new Set(["min", "max", "avg", "sin", "cos", "tan", "sqrt", "abs", "pow"]);
  const uniqueVars = Array.from(
    new Set(
      matches
        .map((m) => m.toLowerCase())
        .filter((m) => !excludeList.has(m))
    )
  );
  return uniqueVars;
}

/**
 * Évalue la moyenne globale selon la règle : (Somme des notes réelles / Somme des notes possibles) * 20
 */
function evaluateFormula(formula, scores) {
  if (!formula || typeof formula !== "string" || formula.trim() === "") {
    const vals = Object.values(scores)
      .map(Number)
      .filter((v) => !isNaN(v));
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const vars = extractVariables(formula);
  if (vars.length === 0) return null;

  const filledVars = vars.filter(
    (v) => scores[v] !== undefined && scores[v] !== null && scores[v] !== ""
  );
  if (filledVars.length === 0) return null;

  const safeEval = (expr) => {
    try {
      const cleanExpr = expr.replace(/[^0-9+\-*/().\s]/g, "");
      const fn = new Function(`return (${cleanExpr});`);
      const val = fn();
      return typeof val === "number" && !isNaN(val) && isFinite(val) ? val : null;
    } catch {
      return null;
    }
  };

  let actualExpr = formula;
  vars.forEach((v) => {
    const val =
      scores[v] !== undefined && scores[v] !== null && scores[v] !== ""
        ? Number(scores[v])
        : 0;
    actualExpr = actualExpr.replace(new RegExp(`\\b${v}\\b`, "gi"), val);
  });
  const actualVal = safeEval(actualExpr);

  let maxExpr = formula;
  vars.forEach((v) => {
    const val =
      scores[v] !== undefined && scores[v] !== null && scores[v] !== ""
        ? 20
        : 0;
    maxExpr = maxExpr.replace(new RegExp(`\\b${v}\\b`, "gi"), val);
  });
  const maxVal = safeEval(maxExpr);

  if (actualVal === null || maxVal === null || maxVal === 0) {
    const vals = filledVars.map((v) => Number(scores[v])).filter((v) => !isNaN(v));
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  return (actualVal / maxVal) * 20;
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
        const avg = evaluateFormula(subj.formula, scores);
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
