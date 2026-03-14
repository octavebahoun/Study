/**
 * Logique de calcul simplifiée :
 * Moyenne = (Moyenne des Interros + Moyenne des Devoirs) / 2
 * Si un groupe est totalement vide, on prend l'autre groupe à 100%.
 */

/**
 * Calcule la moyenne d'un ensemble de notes
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
export function evaluateFormula(formula, scores) {
  const avgI = calculateGroupAverage(scores, 'i');
  const avgD = calculateGroupAverage(scores, 'd');

  if (avgI !== null && avgD !== null) return (avgI + avgD) / 2;
  if (avgI !== null) return avgI;
  if (avgD !== null) return avgD;
  return null;
}

/**
 * Extrait les variables (i1, d1, etc.)
 */
export function extractVariables(formula) {
  // Dans la version simplifiée, on ne regarde plus la formule mais les préfixes standard
  return ['i', 'd'];
}

/**
 * Calcule la note requise pour atteindre un objectif
 */
export function calculateRequired(formula, filledScores, allVars, target) {
  const targetNum = Number(target) || 10;

  // Dans cette version, on cherche la note 'x' à avoir dans TOUS les contrôles restants
  // pour que la moyenne pondérée atteigne 'targetNum'

  let low = 0, high = 20;

  // On vérifie d'abord si c'est possible avec 20
  const testMax = { ...filledScores };
  // On identifie quels types de contrôles sont présents mais non remplis
  // Note: On utilise allVars qui contient ici les préfixes 'i' et 'd'

  // Pour la recherche binaire, on va injecter la même note 'mid' dans tous les slots vides
  // Mais on a besoin de savoir quels slots sont vides.
  // On va utiliser un mapping simplifié.

  for (let i = 0; i < 25; i++) {
    const mid = (low + high) / 2;

    // On construit un set de scores virtuels : notes existantes + 'mid' pour les trous
    // On doit savoir quels iX et dX existent. On va regarder filledScores.
    // En fait, on a besoin de la liste des contrôles de la matière.
    // Alternative: Simuler le calcul via une fonction locale qui connaît la structure

    // Pour simplifier ici, on va utiliser evaluateFormula en passant 'mid' là où il manque des données.
    // Cependant evaluateFormula ne sait pas combien de 'i' manquent.
    // Donc on va passer une version modifiée de filledScores.

    // Attends, la fonction est appelée avec 'allVars'. Dans le nouveau système, 
    // allVars devrait être les IDs des contrôles manquants.

    const testScores = { ...filledScores };
    allVars.forEach(v => {
      if (testScores[v] === undefined || testScores[v] === null) {
        testScores[v] = mid;
      }
    });

    const result = evaluateFormula("", testScores);
    if (result === null) {
      // Si rien n'est rempli, la moyenne est 'mid'
      if (mid < targetNum) low = mid;
      else high = mid;
    } else {
      if (result < targetNum) low = mid;
      else high = mid;
    }
  }

  // On arrondit proprement à 1 chiffre après la virgule
  // Pour éviter le 18.1 au lieu de 18.0, on utilise un arrondi classique à 0.1 près
  const required = Math.round(high * 10) / 10;
  const res = {};
  allVars.forEach(v => {
    if (filledScores[v] === undefined || filledScores[v] === null) {
      res[v] = required;
    }
  });

  return {
    requiredScores: res,
    isPossible: required <= 20
  };
}

/**
 * Analyse la moyenne d'un sujet
 */
export function getSubjectAverage(subject) {
  const scores = {};
  let allFilled = true;
  let filledCount = 0;

  subject.controls.forEach(ctrl => {
    if (ctrl.score !== null && ctrl.score !== undefined) {
      scores[ctrl.variable] = ctrl.score;
      filledCount++;
    } else {
      allFilled = false;
    }
  });

  const avg = evaluateFormula("", scores);
  return { average: avg, allFilled, filledCount };
}
