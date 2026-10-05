/**
 * Status vocabularies per domain. Backend values are not final — change keys/labels/tones here only.
 * Tones: neutral | info | success | warning | danger | brand | purple
 */
export const STATUSES = {
  record: {
    active: { label: 'Active', tone: 'success' },
    inactive: { label: 'Inactive', tone: 'neutral' },
  },
  invoice: {
    draft: { label: 'Draft', tone: 'neutral' },
    quote: { label: 'Quote', tone: 'info' },
    proforma: { label: 'Pro Forma', tone: 'purple' },
    unpaid: { label: 'Unpaid', tone: 'warning' },
    partially_paid: { label: 'Partially paid', tone: 'warning' },
    paid: { label: 'Paid', tone: 'success' },
    overdue: { label: 'Overdue', tone: 'danger' },
    cancelled: { label: 'Cancelled', tone: 'neutral' },
  },
  invoiceType: {
    quote: { label: 'Quote', tone: 'info' },
    proforma: { label: 'Pro Forma', tone: 'purple' },
    invoice: { label: 'Invoice', tone: 'brand' },
  },
  invoicePayment: {
    unpaid: { label: 'Unpaid', tone: 'warning' },
    partial: { label: 'Partial', tone: 'warning' },
    paid: { label: 'Paid', tone: 'success' },
    overdue: { label: 'Overdue', tone: 'danger' },
    cancelled: { label: 'Cancelled', tone: 'neutral' },
  },
  purchase: {
    draft: { label: 'Draft', tone: 'neutral' },
    ordered: { label: 'Ordered', tone: 'info' },
    partially_received: { label: 'Partially received', tone: 'warning' },
    completed: { label: 'Received', tone: 'success' },
    cancelled: { label: 'Cancelled', tone: 'danger' },
  },
  claim: {
    draft: { label: 'Draft', tone: 'neutral' },
    submitted: { label: 'Submitted', tone: 'info' },
    processing: { label: 'Processing', tone: 'purple' },
    approved: { label: 'Approved', tone: 'success' },
    rejected: { label: 'Rejected', tone: 'danger' },
    paid: { label: 'Paid', tone: 'success' },
    requires_information: { label: 'Requires information', tone: 'warning' },
  },
  lead: {
    new: { label: 'New', tone: 'brand' },
    contacted: { label: 'Contacted', tone: 'info' },
    qualified: { label: 'Qualified', tone: 'purple' },
    appointment_booked: { label: 'Appointment booked', tone: 'warning' },
    converted: { label: 'Converted', tone: 'success' },
    lost: { label: 'Lost', tone: 'neutral' },
  },
  appointment: {
    scheduled: { label: 'Scheduled', tone: 'info' },
    confirmed: { label: 'Confirmed', tone: 'success' },
    completed: { label: 'Completed', tone: 'neutral' },
    cancelled: { label: 'Cancelled', tone: 'danger' },
    no_show: { label: 'No show', tone: 'warning' },
  },
  stock: {
    in_stock: { label: 'In stock', tone: 'success' },
    low: { label: 'Low stock', tone: 'warning' },
    out: { label: 'Out of stock', tone: 'danger' },
  },
  payment: {
    pending: { label: 'Pending', tone: 'warning' },
    completed: { label: 'Completed', tone: 'success' },
    failed: { label: 'Failed', tone: 'danger' },
    reversed: { label: 'Reversed', tone: 'neutral' },
  },
  refund: {
    requested: { label: 'Requested', tone: 'warning' },
    approved: { label: 'Approved', tone: 'info' },
    processed: { label: 'Processed', tone: 'success' },
    rejected: { label: 'Rejected', tone: 'danger' },
  },
  communication: {
    sent: { label: 'Sent', tone: 'info' },
    delivered: { label: 'Delivered', tone: 'info' },
    read: { label: 'Read', tone: 'success' },
    received: { label: 'Received', tone: 'success' },
    answered: { label: 'Answered', tone: 'success' },
    missed: { label: 'Missed', tone: 'danger' },
    failed: { label: 'Failed', tone: 'danger' },
    logged: { label: 'Logged', tone: 'neutral' },
  },
  productType: {
    standard: { label: 'Standard', tone: 'brand' },
    service: { label: 'Service', tone: 'purple' },
  },
};

export const OPTION_SETS = {
  productType: [
    { value: 'standard', label: 'Standard product (physical stock)' },
    { value: 'service', label: 'Service product (time-based)' },
  ],
  warehouseType: [
    { value: 'main', label: 'Main stock' },
    { value: 'damaged', label: 'Broken / damaged' },
    { value: 'other', label: 'Other' },
  ],
  categoryAppliesTo: [
    { value: 'standard', label: 'Standard products' },
    { value: 'service', label: 'Service products' },
    { value: 'both', label: 'Both' },
  ],
  leadSource: [
    { value: 'website', label: 'Website' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'referral', label: 'Referral' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'phone', label: 'Phone' },
    { value: 'other', label: 'Other' },
  ],
  appointmentType: [
    { value: 'hearing_test', label: 'Hearing test' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'fitting', label: 'Fitting' },
    { value: 'fine_tuning', label: 'Fine tuning' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'repair', label: 'Repair' },
  ],
  paymentMethod: [
    { value: 'card', label: 'Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'eft', label: 'EFT' },
    { value: 'medical_aid', label: 'Medical aid' },
  ],
  documentType: [
    { value: 'audiogram', label: 'Audiogram' },
    { value: 'identification', label: 'Identification' },
    { value: 'medical_aid', label: 'Medical aid card' },
    { value: 'referral', label: 'Referral letter' },
    { value: 'claim', label: 'Claim document' },
    { value: 'consent', label: 'Consent form' },
    { value: 'other', label: 'Other' },
  ],
  gender: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Other' },
  ],
  title: ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'].map((t) => ({ value: t, label: t })),
  direction: [
    { value: 'outbound', label: 'Outbound' },
    { value: 'inbound', label: 'Inbound' },
  ],
  membershipType: ['Comprehensive', 'Hospital', 'Saver', 'Network', 'Other'].map((t) => ({ value: t, label: t })),
};

export function humanize(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value).replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function getStatus(domain, value) {
  return STATUSES[domain]?.[value] ?? { label: humanize(value), tone: 'neutral' };
}

export function statusOptions(domain) {
  return Object.entries(STATUSES[domain] ?? {}).map(([value, s]) => ({ value, label: s.label }));
}

export function optionLabel(set, value) {
  return OPTION_SETS[set]?.find((o) => o.value === value)?.label ?? humanize(value);
}
