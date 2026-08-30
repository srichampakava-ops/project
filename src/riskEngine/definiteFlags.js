// src/riskEngine/definiteFlags.js
// Each flag fires if ALL keyword groups have at least one match nearby in the text.
// This survives translation wording variance much better than exact phrases.

export const DEFINITE_FLAGS = [
  { id: 'nonrefundable_deposit', groups: [['deposit'], ['not refund', 'non-refund', 'cannot be refund', 'will not be return', 'not returned', 'no refund', 'not be refund', 'not refundable', 'forfeit']] },
  { id: 'no_leave', groups: [['leave', 'holiday', 'day off', 'weekly off', 'sick leave'], ['no', 'not allowed', 'not given', 'not granted', 'not provided']] },
  { id: 'no_rest_day', groups: [['rest day', 'day off', 'weekly off', 'holiday'], ['no', 'not entitled', 'not given', 'not provided']] },
  { id: 'salary_withheld', groups: [['salary', 'wage', 'pay'], ['withhold', 'held', 'deduct without notice', 'not paid', 'delayed indefinitely']] },
  { id: 'no_notice_termination', groups: [['terminat', 'dismiss', 'fired', 'end employment'], ['without notice', 'no notice', 'any time', 'no warning', 'sole discretion']] },
  { id: 'unlimited_hours', groups: [['working hours', 'work hours', 'hours of work'], ['no limit', 'unlimited', 'not fixed', 'as required', 'no fixed', 'not set', 'undetermined', 'undecided']] },
  { id: 'passport_confiscation', groups: [['passport', 'document', 'aadhaar', 'id card', 'identity card'], ['held', 'retain', 'kept by', 'submitted and kept', 'confiscated', 'employer will keep']] },
  { id: 'below_minimum_wage', groups: [['wage', 'salary', 'pay rate'], ['below minimum', 'less than minimum', 'not disclosed']] },
  { id: 'no_overtime_pay', groups: [['overtime', 'extra hour', 'extra time'], ['no pay', 'not paid', 'no extra payment', 'unpaid', 'no compensation']] },
  { id: 'forced_resignation', groups: [['resign'], ['must', 'forced', 'required', 'deemed']] },
  { id: 'penalty_for_leaving', groups: [['leaving', 'quit', 'resign', 'exit'], ['penalty', 'fine', 'must pay', 'bond', 'recovery of cost', 'compensation to employer']] },
  { id: 'illegal_wage_deduction', groups: [['salary', 'wage', 'pay'], ['deduct', 'fine', 'penalty cut', 'unexplained deduction']] },
  { id: 'restricted_movement', groups: [['leave premises', 'movement', 'worksite', 'outside the facility'], ['not allowed', 'restricted', 'confined', 'prohibited', 'permission required']] },
  { id: 'isolation', groups: [['contact with family', 'phone use', 'communication', 'visitors'], ['restricted', 'not allowed', 'prohibited', 'monitored', 'controlled']] },
  { id: 'no_medical_benefits', groups: [['medical', 'health', 'insurance'], ['no', 'not covered', 'not provided']] },
  { id: 'unsafe_conditions', groups: [['safety equipment', 'protective gear', 'safety gear'], ['not provided', 'employee must arrange', 'at own cost', 'not supplied']] },
  { id: 'debt_bondage_risk', groups: [['advance', 'loan', 'recruitment fee', 'agent fee'], ['repaid through work', 'adjusted against', 'recovery from salary', 'deducted from wages']] },
  { id: 'no_written_agreement', groups: [['agreement', 'terms', 'contract'], ['verbal only', 'may change without notice', 'employer reserves right to change', 'subject to change']] },
  { id: 'threats_penalty', groups: [['violation of rules', 'breach of contract', 'misconduct'], ['legal action', 'police', 'blacklist', 'report to authorities']] },
  { id: 'no_grievance_process', groups: [['complaint', 'grievance', 'dispute'], ['no process', 'not entertained', 'final decision of employer']] },
  { id: 'no_appointment_letter', groups: [['appointment letter', 'offer letter', 'employment letter'], ['not provided', 'not issued', 'verbal only', 'no formal']] },
  { id: 'no_pf_esi', groups: [['provident fund', 'pf', 'esi', 'employee state insurance', 'social security'], ['not applicable', 'not provided', 'not covered', 'no deduction made', 'not enrolled']] },
  { id: 'no_gratuity', groups: [['gratuity'], ['not applicable', 'not provided', 'not eligible', 'no gratuity']] },
  { id: 'no_wage_payment_date', groups: [['salary', 'wage', 'payment'], ['as convenient', 'no fixed date', 'employer discretion', 'irregular basis']] },
  { id: 'no_migrant_travel_allowance', groups: [['travel allowance', 'home visit', 'native place'], ['not applicable', 'not provided', 'employee expense']] },
  { id: 'no_equal_pay', groups: [['wage', 'salary', 'pay'], ['based on gender', 'different for men and women', 'less for women']] },
  { id: 'no_night_shift_consent', groups: [['night shift', 'night duty'], ['mandatory', 'compulsory', 'no consent required', 'without consent']] },
  { id: 'no_harassment_policy', groups: [['harassment', 'posh', 'grievance committee'], ['not applicable', 'no policy', 'not provided']] },
  { id: 'no_settlement_terms', groups: [['full and final settlement', 'final settlement', 'dues on leaving'], ['not specified', 'employer discretion', 'no timeline']] },
  { id: 'excessive_liability', groups: [['damage', 'loss', 'accident', 'liability'], ['employee solely responsible', 'employee bears full cost', 'employee liable for all']] },
  { id: 'forced_arbitration', groups: [['dispute', 'disagreement', 'grievance'], ['arbitration only', 'no court', 'waive right to sue', 'binding arbitration']] },
];

export function runDefiniteFlags(text) {
  const lower = text.toLowerCase();
  return DEFINITE_FLAGS.filter((flag) =>
    flag.groups.every((group) => group.some((kw) => lower.includes(kw)))
  ).map((flag) => ({ id: flag.id, title: flag.id.replace(/_/g, ' ') }));
}