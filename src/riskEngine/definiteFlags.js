// src/riskEngine/definiteFlags.js
// Each flag fires if ALL keyword groups have at least one match nearby in the text.
// This survives translation wording variance much better than exact phrases.

export const DEFINITE_FLAGS = [
  { id: 'nonrefundable_deposit', groups: [['deposit'], ['not refund', 'non-refund', 'cannot be refund', 'will not be return', 'not returned', 'no refund']] },
  { id: 'no_leave', groups: [['leave', 'holiday', 'day off', 'weekly off'], ['no', 'not allowed', 'not given', 'not granted', 'not provided']] },
  { id: 'salary_withheld', groups: [['salary', 'wage', 'pay'], ['withhold', 'held', 'deduct without notice', 'not paid']] },
  { id: 'no_notice_termination', groups: [['terminat', 'dismiss', 'fired', 'end employment'], ['without notice', 'no notice', 'any time', 'no warning']] },
  { id: 'unlimited_hours', groups: [['working hours', 'work hours', 'hours of work'], ['no limit', 'unlimited', 'not fixed', 'as required', 'no fixed']] },
  { id: 'passport_confiscation', groups: [['passport', 'document', 'aadhaar', 'id card'], ['held', 'retain', 'kept by', 'submitted and kept']] },
  { id: 'below_minimum_wage', groups: [['wage', 'salary', 'pay rate'], ['below minimum', 'less than minimum', 'not disclosed']] },
  { id: 'no_overtime_pay', groups: [['overtime', 'extra hour', 'extra time'], ['no pay', 'not paid', 'no extra payment', 'unpaid', 'no compensation']] },
  { id: 'forced_resignation', groups: [['resign'], ['must', 'forced', 'required', 'deemed']] },
  { id: 'penalty_for_leaving', groups: [['leaving', 'quit', 'resign', 'exit'], ['penalty', 'fine', 'must pay', 'bond', 'recovery of cost']] },
  { id: 'illegal_wage_deduction', groups: [['salary', 'wage', 'pay'], ['deduct', 'fine', 'penalty cut']] },
  { id: 'restricted_movement', groups: [['leave premises', 'movement', 'worksite'], ['not allowed', 'restricted', 'confined']] },
  { id: 'no_medical_benefits', groups: [['medical', 'health', 'insurance'], ['no', 'not covered', 'not provided']] },
  { id: 'debt_bondage_risk', groups: [['advance', 'loan'], ['repaid through work', 'adjusted against', 'recovery from salary']] },
];

export function runDefiniteFlags(text) {
  const lower = text.toLowerCase();
  return DEFINITE_FLAGS.filter((flag) =>
    flag.groups.every((group) => group.some((kw) => lower.includes(kw)))
  ).map((flag) => ({ id: flag.id, title: flag.id.replace(/_/g, ' ') }));
}