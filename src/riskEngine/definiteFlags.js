// src/riskEngine/definiteFlags.js

export const DEFINITE_FLAGS = [
  { id: 'nonrefundable_deposit', phrases: ['non-refundable deposit', 'deposit will not be returned', 'deposit is not refundable', 'security deposit forfeited'] },
  { id: 'no_leave', phrases: ['no leave will be granted', 'no paid leave', 'leave is not allowed', 'no sick leave', 'no weekly off'] },
  { id: 'salary_withheld', phrases: ['salary will be withheld', 'wages may be withheld', 'salary deducted without notice', 'salary held until', 'pay withheld as penalty'] },
  { id: 'no_notice_termination', phrases: ['terminate without notice', 'termination without notice', 'may be dismissed at any time', 'employment may end without warning', 'fired without cause'] },
  { id: 'unlimited_hours', phrases: ['no limit on working hours', 'unlimited working hours', 'work as required with no fixed hours', 'must work as long as needed', 'no fixed shift timing'] },
  { id: 'passport_confiscation', phrases: ['passport will be held', 'documents will be kept by employer', 'identity documents retained', 'original documents submitted and retained', 'aadhaar card kept by employer'] },
  { id: 'below_minimum_wage', phrases: ['wage below minimum', 'salary less than minimum wage', 'pay rate not disclosed'] },
  { id: 'no_overtime_pay', phrases: ['no overtime pay', 'overtime not compensated', 'no extra payment for overtime', 'extra hours unpaid'] },
  { id: 'forced_resignation', phrases: ['must resign if', 'forced to resign', 'resignation required upon', 'deemed resigned if absent'] },
  { id: 'penalty_for_leaving', phrases: ['penalty for leaving early', 'must pay employer if resigns', 'fine for quitting', 'bond amount payable on exit', 'recovery of training cost if resigns'] },
  { id: 'illegal_wage_deduction', phrases: ['deduction for damages', 'fine deducted from salary', 'penalty deducted from wages', 'salary cut for mistakes'] },
  { id: 'no_written_agreement', phrases: ['verbal agreement only', 'terms may change without notice', 'employer reserves right to change terms'] },
  { id: 'restricted_movement', phrases: ['not allowed to leave premises', 'confined to worksite', 'movement restricted during employment'] },
  { id: 'no_medical_benefits', phrases: ['no medical insurance', 'no health benefits provided', 'medical expenses not covered'] },
  { id: 'debt_bondage_risk', phrases: ['advance must be repaid through work', 'wages adjusted against advance', 'loan recovery from salary'] },
];