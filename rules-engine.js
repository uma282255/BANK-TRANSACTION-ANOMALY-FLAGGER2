/**
 * Bank Transaction Anomaly Flagger
 * Phase 2: DMGT (Discrete Mathematics & Graph Theory) Propositional Logic Rule Engine
 * 
 * Formal Propositions:
 * P: Transaction Amount > High Value Threshold (₹50,000)
 * Q: Payee is New / Unverified (First-time transfer)
 * R: Location is Unrecognized / High-Risk Region
 * S: Transaction Velocity Spike Detected (> 3 transfers in short window)
 * 
 * Propositional Logic Deductions:
 * Rule 1: P ∧ Q  => FLAG (High-Value transfer to Unregistered Payee)
 * Rule 2: P ∧ R  => FLAG (High-Value transfer from Unrecognized Location)
 * Rule 3: S      => FLAG (Velocity Spike Anomaly)
 * 
 * Composite Anomaly Formula:
 * Anomaly ⇔ (P ∧ Q) ∨ (P ∧ R) ∨ S
 */

const DMGT_CONFIG = {
  HIGH_AMOUNT_THRESHOLD: 50000,
  SAFE_LOCATIONS: ['Mumbai, IN', 'Delhi, IN', 'Bengaluru, IN', 'Hyderabad, IN', 'Chennai, IN', 'Kolkata, IN', 'Pune, IN']
};

/**
 * Evaluates transaction parameters using discrete propositional logic
 * @param {Object} txn
 * @param {string} txn.accountId
 * @param {string} txn.transactionId
 * @param {number} txn.amount
 * @param {string} txn.payeeId
 * @param {boolean} txn.isNewPayee
 * @param {string} txn.location
 * @param {string} [txn.transactionType]
 * @returns {Object} DMGT evaluation report
 */
function evaluateDMGTRules(txn) {
  const amount = Number(txn.amount) || 0;
  const isNewPayee = Boolean(txn.isNewPayee);
  const location = (txn.location || '').trim();
  
  // 1. Evaluate Truth Values for Formal Atomic Propositions
  const P = amount > DMGT_CONFIG.HIGH_AMOUNT_THRESHOLD;
  const Q = isNewPayee;
  const R = location ? !DMGT_CONFIG.SAFE_LOCATIONS.some(loc => loc.toLowerCase() === location.toLowerCase()) : false;
  const S = Boolean(txn.velocitySpike); // Velocity spike flag

  // 2. Evaluate Compound Propositional Formulas
  const rule1Triggered = P && Q;  // P ∧ Q
  const rule2Triggered = P && R;  // P ∧ R
  const rule3Triggered = S;       // S

  // 3. Composite Logical Evaluation: (P ∧ Q) ∨ (P ∧ R) ∨ S
  const isAnomaly = rule1Triggered || rule2Triggered || rule3Triggered;

  // Determine Risk Level & Explanations
  let riskLevel = 'LOW';
  let triggeredRules = [];
  let detailedNotes = [];

  if (rule1Triggered) {
    triggeredRules.push({
      ruleId: 'RULE-DMGT-01',
      formula: 'P ∧ Q',
      description: `High-Value Amount (₹${amount.toLocaleString()}) transferred to an Unregistered New Payee (${txn.payeeId}).`,
      severity: 'HIGH'
    });
    detailedNotes.push(`Proposition P (Amount > ₹50k) is TRUE and Proposition Q (New Payee) is TRUE.`);
  }

  if (rule2Triggered) {
    triggeredRules.push({
      ruleId: 'RULE-DMGT-02',
      formula: 'P ∧ R',
      description: `High-Value Amount (₹${amount.toLocaleString()}) initiated from Unrecognized Location (${location}).`,
      severity: 'MEDIUM'
    });
    detailedNotes.push(`Proposition P is TRUE and Proposition R (Unrecognized Geo-Location) is TRUE.`);
  }

  if (rule3Triggered) {
    triggeredRules.push({
      ruleId: 'RULE-DMGT-03',
      formula: 'S',
      description: `Velocity spike anomaly detected within a short time-window.`,
      severity: 'MEDIUM'
    });
    detailedNotes.push(`Proposition S (Velocity Spike) is TRUE.`);
  }

  if (isAnomaly) {
    riskLevel = rule1Triggered ? 'HIGH' : 'MEDIUM';
  }

  return {
    isFlagged: isAnomaly,
    status: isAnomaly ? 'FLAGGED FOR REVIEW' : 'NORMAL',
    riskLevel: riskLevel,
    propositions: {
      P: {
        symbol: 'P',
        name: 'High Amount (Amount > ₹50,000)',
        value: P,
        description: `₹${amount.toLocaleString()} ${P ? '> ₹50,000 [TRUE]' : '≤ ₹50,000 [FALSE]'}`
      },
      Q: {
        symbol: 'Q',
        name: 'New Payee',
        value: Q,
        description: Q ? 'First-time beneficiary [TRUE]' : 'Existing beneficiary [FALSE]'
      },
      R: {
        symbol: 'R',
        name: 'Unrecognized Location',
        value: R,
        description: R ? `Unrecognized origin (${location}) [TRUE]` : `Recognized origin (${location}) [FALSE]`
      },
      S: {
        symbol: 'S',
        name: 'Velocity Spike',
        value: S,
        description: S ? 'Rapid repeated transactions [TRUE]' : 'Normal transaction interval [FALSE]'
      }
    },
    compositeFormula: '(P ∧ Q) ∨ (P ∧ R) ∨ S',
    formulaEvaluation: `(${P} ∧ ${Q}) ∨ (${P} ∧ ${R}) ∨ ${S} = ${isAnomaly}`,
    triggeredRules: triggeredRules,
    explanation: isAnomaly 
      ? `Transaction violated propositional logic constraints: ${triggeredRules.map(r => r.formula).join(', ')}. Flagged for manual compliance inspection.`
      : `Transaction passed all DMGT propositional logic safety rules. Formula (P ∧ Q) ∨ (P ∧ R) ∨ S evaluated to FALSE.`
  };
}

// Export for module/browser environments
if (typeof window !== 'undefined') {
  window.evaluateDMGTRules = evaluateDMGTRules;
  window.DMGT_CONFIG = DMGT_CONFIG;
}
