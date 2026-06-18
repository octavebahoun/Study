/**
 * Calcule la moyenne d'un ensemble de notes selon une formule personnalisée.
 */

/**
 * Extrait les variables uniques (ex: i1, d2) d'une formule.
 */
export function extractVariables(formula) {
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
 * pour s'assurer que la moyenne s'adapte dynamiquement au nombre de notes saisies.
 */
export function evaluateFormula(formula, scores) {
  if (!formula || typeof formula !== "string" || formula.trim() === "") {
    // Repli : moyenne simple de toutes les notes existantes
    const vals = Object.values(scores)
      .map(Number)
      .filter((v) => !isNaN(v));
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const vars = extractVariables(formula);
  if (vars.length === 0) return null;

  // Filtrer les variables qui ont effectivement une note
  const filledVars = vars.filter(
    (v) => scores[v] !== undefined && scores[v] !== null && scores[v] !== ""
  );
  if (filledVars.length === 0) return null;

  // Fonction interne d'évaluation sécurisée d'une expression mathématique simple
  const safeEval = (expr) => {
    try {
      // N'autorise que les chiffres, opérateurs mathématiques de base, parenthèses et espaces
      const cleanExpr = expr.replace(/[^0-9+\-*/().\s]/g, "");
      const fn = new Function(`return (${cleanExpr});`);
      const val = fn();
      return typeof val === "number" && !isNaN(val) && isFinite(val) ? val : null;
    } catch {
      return null;
    }
  };

  // 1. Évaluation avec les notes réelles (0 pour les notes manquantes)
  let actualExpr = formula;
  vars.forEach((v) => {
    const val =
      scores[v] !== undefined && scores[v] !== null && scores[v] !== ""
        ? Number(scores[v])
        : 0;
    actualExpr = actualExpr.replace(new RegExp(`\\b${v}\\b`, "gi"), val);
  });
  const actualVal = safeEval(actualExpr);

  // 2. Évaluation avec 20 pour les notes réelles (0 pour les notes manquantes)
  // pour mesurer la pondération totale des contrôles actuellement saisis
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
    // En cas d'erreur ou si la pondération actuelle est nulle, repli sur la moyenne arithmétique simple
    const vals = filledVars.map((v) => Number(scores[v])).filter((v) => !isNaN(v));
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  return (actualVal / maxVal) * 20;
}

/**
 * Calcule la note requise pour atteindre un objectif
 */
export function calculateRequired(formula, filledScores, allVars, target) {
  const targetNum = Number(target) || 10;

  // On recherche par dichotomie la note 'x' à obtenir dans tous les contrôles restants
  // pour atteindre l'objectif targetNum.
  let low = 0,
    high = 20;

  for (let i = 0; i < 25; i++) {
    const mid = (low + high) / 2;

    const testScores = { ...filledScores };
    allVars.forEach((v) => {
      if (testScores[v] === undefined || testScores[v] === null || testScores[v] === "") {
        testScores[v] = mid;
      }
    });

    const result = evaluateFormula(formula, testScores);
    if (result === null) {
      if (mid < targetNum) low = mid;
      else high = mid;
    } else {
      if (result < targetNum) low = mid;
      else high = mid;
    }
  }

  const required = Math.round(high * 10) / 10;
  const res = {};
  allVars.forEach((v) => {
    if (filledScores[v] === undefined || filledScores[v] === null || filledScores[v] === "") {
      res[v] = required;
    }
  });

  return {
    requiredScores: res,
    isPossible: required <= 20,
  };
}

/**
 * Analyse la moyenne d'un sujet (matière)
 */
export function getSubjectAverage(subject) {
  const scores = {};
  let allFilled = true;
  let filledCount = 0;

  subject.controls.forEach((ctrl) => {
    if (ctrl.score !== null && ctrl.score !== undefined && ctrl.score !== "") {
      scores[ctrl.variable] = ctrl.score;
      filledCount++;
    } else {
      allFilled = false;
    }
  });

  const avg = evaluateFormula(subject.formula, scores);
  return { average: avg, allFilled, filledCount };
}
