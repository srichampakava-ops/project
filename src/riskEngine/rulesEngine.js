// src/riskEngine/rulesEngine.js

export const RULES = [
  {
    id: 'missing_overtime',
    title: 'Overtime pay not mentioned',
    check: (text) => !/overtime/i.test(text),
  },
  {
    id: 'missing_termination_notice',
    title: 'No termination notice period mentioned',
    check: (text) => !/(notice period|days notice|weeks notice|\d+\s*(day|week|month)s?\s*notice)/i.test(text),
  },
  {
    id: 'missing_leave_policy',
    title: 'No leave/holiday policy mentioned',
    check: (text) => !/(leave|holiday|vacation)/i.test(text),
  },
  {
    id: 'missing_wage_amount',
    title: 'No clear salary/wage amount mentioned',
    check: (text) => !/(salary|wage|pay).{0,30}(rs\.?|₹|inr|\d{3,})/i.test(text),
  },
  {
    id: 'missing_working_hours',
    title: 'No fixed working hours mentioned',
    check: (text) => !/(working hours|hours of work|\d{1,2}\s*(am|pm|hours))/i.test(text),
  },
  {
    id: 'missing_deposit_terms',
    title: 'Deposit mentioned but refund terms unclear',
    check: (text) => /deposit/i.test(text) && !/(refund|returned|refundable)/i.test(text),
  },
];

export function runRulesEngine(englishText) {
  return RULES
    .filter((rule) => rule.check(englishText))
    .map((rule) => ({ id: rule.id, title: rule.title }));
}