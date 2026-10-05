/**
 * ⚠️ MOCK DATA — DEVELOPMENT ONLY.
 * Static fixtures that let the UI render before the backend exists.
 * Held in module memory, never mutated, never persisted (no localStorage/sessionStorage/IndexedDB/cookies).
 * Delete the whole `src/mocks` folder once VITE_USE_MOCK_API=false is used everywhere.
 */

const day = (offset, time = '09:00') => {
  const d = new Date('2026-10-02T00:00:00');
  d.setDate(d.getDate() + offset);
  return `${d.toISOString().slice(0, 10)}T${time}:00`;
};
const dateOnly = (offset) => day(offset).slice(0, 10);

export const branches = [
  { id: 'br-1', name: 'Durbanville', code: 'DBV', city: 'Cape Town', address: '12 Wellington Rd, Durbanville', phone: '021 975 0000', email: 'durbanville@futurehearing.co.za', managerName: 'Anika Botha', practiceId: 'pr-1', practiceName: 'Future Hearing Durbanville Practice', warehouseCount: 3, userCount: 3, status: 'active' },
  { id: 'br-2', name: 'Claremont', code: 'CLM', city: 'Cape Town', address: '5 Main Rd, Claremont', phone: '021 671 0000', email: 'claremont@futurehearing.co.za', managerName: 'Thabo Mokoena', practiceId: 'pr-2', practiceName: 'Future Hearing Claremont Practice', warehouseCount: 2, userCount: 2, status: 'active' },
  { id: 'br-3', name: 'Stellenbosch', code: 'STB', city: 'Stellenbosch', address: '44 Dorp St, Stellenbosch', phone: '021 883 0000', email: 'stellenbosch@futurehearing.co.za', managerName: 'Megan van Wyk', practiceId: 'pr-3', practiceName: 'Winelands Audiology', warehouseCount: 1, userCount: 1, status: 'active' },
  { id: 'br-4', name: 'Paarl', code: 'PRL', city: 'Paarl', address: '210 Main St, Paarl', phone: '021 872 0000', email: 'paarl@futurehearing.co.za', managerName: null, practiceId: null, practiceName: null, warehouseCount: 1, userCount: 0, status: 'inactive' },
];

export const warehouses = [
  { id: 'wh-1', name: 'Main Stock', branchId: 'br-1', branchName: 'Durbanville', type: 'main', isDefault: true, description: 'Primary sellable stock', status: 'active' },
  { id: 'wh-2', name: 'Broken Stock', branchId: 'br-1', branchName: 'Durbanville', type: 'damaged', isDefault: false, description: 'Damaged / awaiting repair', status: 'active' },
  { id: 'wh-3', name: 'Loan Units', branchId: 'br-1', branchName: 'Durbanville', type: 'other', isDefault: false, description: 'Trial and loaner devices', status: 'active' },
  { id: 'wh-4', name: 'Main Stock', branchId: 'br-2', branchName: 'Claremont', type: 'main', isDefault: true, description: '', status: 'active' },
  { id: 'wh-5', name: 'Broken Stock', branchId: 'br-2', branchName: 'Claremont', type: 'damaged', isDefault: false, description: '', status: 'active' },
  { id: 'wh-6', name: 'Main Stock', branchId: 'br-3', branchName: 'Stellenbosch', type: 'main', isDefault: true, description: '', status: 'active' },
  { id: 'wh-7', name: 'Main Stock', branchId: 'br-4', branchName: 'Paarl', type: 'main', isDefault: true, description: '', status: 'inactive' },
];

export const practices = [
  { id: 'pr-1', name: 'Future Hearing Durbanville Practice', practiceNumber: '0123456', hpcsaNumber: 'AU 0012345', vatNumber: '4123456789', branchId: 'br-1', branchName: 'Durbanville', practitionerName: 'Anika Botha', email: 'claims.dbv@futurehearing.co.za', phone: '021 975 0000', address: '12 Wellington Rd, Durbanville', bankingDetails: 'FNB · 62000000001 · 250655', status: 'active' },
  { id: 'pr-2', name: 'Future Hearing Claremont Practice', practiceNumber: '0234567', hpcsaNumber: 'AU 0023456', vatNumber: '4123456789', branchId: 'br-2', branchName: 'Claremont', practitionerName: 'Thabo Mokoena', email: 'claims.clm@futurehearing.co.za', phone: '021 671 0000', address: '5 Main Rd, Claremont', bankingDetails: 'FNB · 62000000002 · 250655', status: 'active' },
  { id: 'pr-3', name: 'Winelands Audiology', practiceNumber: '0345678', hpcsaNumber: 'AU 0034567', vatNumber: '', branchId: 'br-3', branchName: 'Stellenbosch', practitionerName: 'Megan van Wyk', email: 'info@winelandsaudiology.co.za', phone: '021 883 0000', address: '44 Dorp St, Stellenbosch', bankingDetails: '', status: 'active' },
];

export const companies = [
  { id: 'co-1', name: 'Sonova AG', country: 'Switzerland', website: 'https://www.sonova.com', email: 'za@sonova.com', phone: '011 000 0001', brandCount: 2, status: 'active' },
  { id: 'co-2', name: 'Demant A/S', country: 'Denmark', website: 'https://www.demant.com', email: 'info@demant.com', phone: '011 000 0002', brandCount: 2, status: 'active' },
  { id: 'co-3', name: 'WS Audiology', country: 'Denmark', website: 'https://www.wsa.com', email: 'info@wsa.com', phone: '011 000 0003', brandCount: 2, status: 'active' },
  { id: 'co-4', name: 'GN Hearing', country: 'Denmark', website: 'https://www.gn.com', email: 'info@gn.com', phone: '011 000 0004', brandCount: 1, status: 'active' },
  { id: 'co-5', name: 'Duracell', country: 'United States', website: 'https://www.duracell.com', email: '', phone: '', brandCount: 1, status: 'active' },
];

export const brands = [
  { id: 'bd-1', name: 'Phonak', companyId: 'co-1', companyName: 'Sonova AG', modelCount: 2, status: 'active' },
  { id: 'bd-2', name: 'Unitron', companyId: 'co-1', companyName: 'Sonova AG', modelCount: 1, status: 'active' },
  { id: 'bd-3', name: 'Oticon', companyId: 'co-2', companyName: 'Demant A/S', modelCount: 2, status: 'active' },
  { id: 'bd-4', name: 'Bernafon', companyId: 'co-2', companyName: 'Demant A/S', modelCount: 0, status: 'inactive' },
  { id: 'bd-5', name: 'Signia', companyId: 'co-3', companyName: 'WS Audiology', modelCount: 1, status: 'active' },
  { id: 'bd-6', name: 'Widex', companyId: 'co-3', companyName: 'WS Audiology', modelCount: 1, status: 'active' },
  { id: 'bd-7', name: 'ReSound', companyId: 'co-4', companyName: 'GN Hearing', modelCount: 1, status: 'active' },
  { id: 'bd-8', name: 'Activair', companyId: 'co-5', companyName: 'Duracell', modelCount: 1, status: 'active' },
];

export const models = [
  { id: 'md-1', name: 'Audéo Lumity L90', brandId: 'bd-1', brandName: 'Phonak', companyId: 'co-1', companyName: 'Sonova AG', status: 'active' },
  { id: 'md-2', name: 'Naída Lumity', brandId: 'bd-1', brandName: 'Phonak', companyId: 'co-1', companyName: 'Sonova AG', status: 'active' },
  { id: 'md-3', name: 'Vivante V7', brandId: 'bd-2', brandName: 'Unitron', companyId: 'co-1', companyName: 'Sonova AG', status: 'active' },
  { id: 'md-4', name: 'Intent 1', brandId: 'bd-3', brandName: 'Oticon', companyId: 'co-2', companyName: 'Demant A/S', status: 'active' },
  { id: 'md-5', name: 'Real 2', brandId: 'bd-3', brandName: 'Oticon', companyId: 'co-2', companyName: 'Demant A/S', status: 'active' },
  { id: 'md-6', name: 'Pure Charge&Go IX', brandId: 'bd-5', brandName: 'Signia', companyId: 'co-3', companyName: 'WS Audiology', status: 'active' },
  { id: 'md-7', name: 'SmartRIC 440', brandId: 'bd-6', brandName: 'Widex', companyId: 'co-3', companyName: 'WS Audiology', status: 'active' },
  { id: 'md-8', name: 'Nexia 9', brandId: 'bd-7', brandName: 'ReSound', companyId: 'co-4', companyName: 'GN Hearing', status: 'active' },
  { id: 'md-9', name: 'Size 312 (6-pack)', brandId: 'bd-8', brandName: 'Activair', companyId: 'co-5', companyName: 'Duracell', status: 'active' },
];

export const categories = [
  { id: 'ct-1', name: 'Hearing Aids', appliesTo: 'standard', description: 'Hearing aid devices', subcategoryCount: 3, status: 'active' },
  { id: 'ct-2', name: 'Accessories', appliesTo: 'standard', description: 'Chargers, streamers, domes', subcategoryCount: 2, status: 'active' },
  { id: 'ct-3', name: 'Batteries', appliesTo: 'standard', description: '', subcategoryCount: 1, status: 'active' },
  { id: 'ct-4', name: 'Diagnostic Services', appliesTo: 'service', description: 'Hearing tests and assessments', subcategoryCount: 2, status: 'active' },
  { id: 'ct-5', name: 'Fitting & Aftercare', appliesTo: 'service', description: '', subcategoryCount: 2, status: 'active' },
];

export const subcategories = [
  { id: 'sc-1', name: 'Receiver-in-canal (RIC)', categoryId: 'ct-1', categoryName: 'Hearing Aids', status: 'active' },
  { id: 'sc-2', name: 'Behind-the-ear (BTE)', categoryId: 'ct-1', categoryName: 'Hearing Aids', status: 'active' },
  { id: 'sc-3', name: 'In-the-ear (ITE)', categoryId: 'ct-1', categoryName: 'Hearing Aids', status: 'active' },
  { id: 'sc-4', name: 'Chargers', categoryId: 'ct-2', categoryName: 'Accessories', status: 'active' },
  { id: 'sc-5', name: 'Domes & Wax Guards', categoryId: 'ct-2', categoryName: 'Accessories', status: 'active' },
  { id: 'sc-6', name: 'Zinc-air', categoryId: 'ct-3', categoryName: 'Batteries', status: 'active' },
  { id: 'sc-7', name: 'Audiometry', categoryId: 'ct-4', categoryName: 'Diagnostic Services', status: 'active' },
  { id: 'sc-8', name: 'Tympanometry', categoryId: 'ct-4', categoryName: 'Diagnostic Services', status: 'active' },
  { id: 'sc-9', name: 'Fitting', categoryId: 'ct-5', categoryName: 'Fitting & Aftercare', status: 'active' },
  { id: 'sc-10', name: 'Follow-up', categoryId: 'ct-5', categoryName: 'Fitting & Aftercare', status: 'active' },
];

export const icdCodes = [
  { id: 'icd-1', code: 'H90.3', description: 'Sensorineural hearing loss, bilateral', category: 'Hearing loss', status: 'active' },
  { id: 'icd-2', code: 'H90.4', description: 'Sensorineural hearing loss, unilateral with unrestricted hearing on the contralateral side', category: 'Hearing loss', status: 'active' },
  { id: 'icd-3', code: 'H90.6', description: 'Mixed conductive and sensorineural hearing loss, bilateral', category: 'Hearing loss', status: 'active' },
  { id: 'icd-4', code: 'H91.1', description: 'Presbycusis', category: 'Hearing loss', status: 'active' },
  { id: 'icd-5', code: 'H93.1', description: 'Tinnitus', category: 'Other disorders of ear', status: 'active' },
  { id: 'icd-6', code: 'H61.2', description: 'Impacted cerumen', category: 'External ear', status: 'active' },
  { id: 'icd-7', code: 'Z01.1', description: 'Examination of ears and hearing', category: 'Examination', status: 'active' },
  { id: 'icd-8', code: 'H83.3', description: 'Noise effects on inner ear', category: 'Inner ear', status: 'inactive' },
];

export const procedureCodes = [
  { id: 'pc-1', code: '1004', description: 'Pure tone audiometry (air and bone)', defaultPrice: 650, status: 'active' },
  { id: 'pc-2', code: '1006', description: 'Speech audiometry', defaultPrice: 420, status: 'active' },
  { id: 'pc-3', code: '1008', description: 'Tympanometry and acoustic reflexes', defaultPrice: 380, status: 'active' },
  { id: 'pc-4', code: '1015', description: 'Otoacoustic emissions', defaultPrice: 520, status: 'active' },
  { id: 'pc-5', code: '1101', description: 'Hearing aid fitting (per ear)', defaultPrice: 1450, status: 'active' },
  { id: 'pc-6', code: '1105', description: 'Hearing aid follow-up / fine tuning', defaultPrice: 480, status: 'active' },
  { id: 'pc-7', code: '0190', description: 'Consultation', defaultPrice: 550, status: 'active' },
];

export const products = [
  { id: 'p-1', type: 'standard', name: 'Phonak Audéo Lumity L90-R', sku: 'PH-LUM-L90R', barcode: '7613389000011', companyId: 'co-1', companyName: 'Sonova AG', brandId: 'bd-1', brandName: 'Phonak', modelId: 'md-1', modelName: 'Audéo Lumity L90', categoryId: 'ct-1', categoryName: 'Hearing Aids', subcategoryId: 'sc-1', subcategoryName: 'Receiver-in-canal (RIC)', price: 38500, cost: 24000, vatRate: 15, stockOnHand: 6, reorderLevel: 4, trackSerials: true, description: 'Premium rechargeable RIC hearing aid.', status: 'active' },
  { id: 'p-2', type: 'standard', name: 'Oticon Intent 1 miniRITE R', sku: 'OT-INT1-MR', barcode: '5707131000022', companyId: 'co-2', companyName: 'Demant A/S', brandId: 'bd-3', brandName: 'Oticon', modelId: 'md-4', modelName: 'Intent 1', categoryId: 'ct-1', categoryName: 'Hearing Aids', subcategoryId: 'sc-1', subcategoryName: 'Receiver-in-canal (RIC)', price: 41200, cost: 26500, vatRate: 15, stockOnHand: 2, reorderLevel: 3, trackSerials: true, description: '', status: 'active' },
  { id: 'p-3', type: 'standard', name: 'Signia Pure Charge&Go 7IX', sku: 'SG-PCG-7IX', barcode: '4049386000033', companyId: 'co-3', companyName: 'WS Audiology', brandId: 'bd-5', brandName: 'Signia', modelId: 'md-6', modelName: 'Pure Charge&Go IX', categoryId: 'ct-1', categoryName: 'Hearing Aids', subcategoryId: 'sc-1', subcategoryName: 'Receiver-in-canal (RIC)', price: 32900, cost: 20100, vatRate: 15, stockOnHand: 0, reorderLevel: 2, trackSerials: true, description: '', status: 'active' },
  { id: 'p-4', type: 'standard', name: 'ReSound Nexia 9 BTE', sku: 'RS-NEX9-BTE', barcode: '5709000000044', companyId: 'co-4', companyName: 'GN Hearing', brandId: 'bd-7', brandName: 'ReSound', modelId: 'md-8', modelName: 'Nexia 9', categoryId: 'ct-1', categoryName: 'Hearing Aids', subcategoryId: 'sc-2', subcategoryName: 'Behind-the-ear (BTE)', price: 36000, cost: 22800, vatRate: 15, stockOnHand: 4, reorderLevel: 2, trackSerials: true, description: '', status: 'active' },
  { id: 'p-5', type: 'standard', name: 'Phonak Charger Case Go', sku: 'PH-CHG-GO', barcode: '7613389000055', companyId: 'co-1', companyName: 'Sonova AG', brandId: 'bd-1', brandName: 'Phonak', modelId: 'md-1', modelName: 'Audéo Lumity L90', categoryId: 'ct-2', categoryName: 'Accessories', subcategoryId: 'sc-4', subcategoryName: 'Chargers', price: 2950, cost: 1600, vatRate: 15, stockOnHand: 11, reorderLevel: 5, trackSerials: false, description: '', status: 'active' },
  { id: 'p-6', type: 'standard', name: 'Activair 312 Batteries (6-pack)', sku: 'AC-312-6', barcode: '4000000000066', companyId: 'co-5', companyName: 'Duracell', brandId: 'bd-8', brandName: 'Activair', modelId: 'md-9', modelName: 'Size 312 (6-pack)', categoryId: 'ct-3', categoryName: 'Batteries', subcategoryId: 'sc-6', subcategoryName: 'Zinc-air', price: 95, cost: 48, vatRate: 15, stockOnHand: 140, reorderLevel: 60, trackSerials: false, description: '', status: 'active' },
  { id: 's-1', type: 'service', name: 'Pure Tone Audiometry', sku: 'SVC-PTA', categoryId: 'ct-4', categoryName: 'Diagnostic Services', subcategoryId: 'sc-7', subcategoryName: 'Audiometry', price: 650, vatRate: 0, durationMinutes: 30, icdCodeIds: ['icd-1', 'icd-7'], icdCodes: 'H90.3, Z01.1', procedureCodeIds: ['pc-1'], procedureCodes: '1004', description: 'Air and bone conduction thresholds.', status: 'active' },
  { id: 's-2', type: 'service', name: 'Speech Audiometry', sku: 'SVC-SPA', categoryId: 'ct-4', categoryName: 'Diagnostic Services', subcategoryId: 'sc-7', subcategoryName: 'Audiometry', price: 420, vatRate: 0, durationMinutes: 15, icdCodeIds: ['icd-1'], icdCodes: 'H90.3', procedureCodeIds: ['pc-2'], procedureCodes: '1006', description: '', status: 'active' },
  { id: 's-3', type: 'service', name: 'Tympanometry', sku: 'SVC-TYM', categoryId: 'ct-4', categoryName: 'Diagnostic Services', subcategoryId: 'sc-8', subcategoryName: 'Tympanometry', price: 380, vatRate: 0, durationMinutes: 15, icdCodeIds: ['icd-7'], icdCodes: 'Z01.1', procedureCodeIds: ['pc-3'], procedureCodes: '1008', description: '', status: 'active' },
  { id: 's-4', type: 'service', name: 'Hearing Aid Fitting (per ear)', sku: 'SVC-FIT', categoryId: 'ct-5', categoryName: 'Fitting & Aftercare', subcategoryId: 'sc-9', subcategoryName: 'Fitting', price: 1450, vatRate: 0, durationMinutes: 60, icdCodeIds: ['icd-1'], icdCodes: 'H90.3', procedureCodeIds: ['pc-5'], procedureCodes: '1101', description: '', status: 'active' },
  { id: 's-5', type: 'service', name: 'Follow-up & Fine Tuning', sku: 'SVC-FUP', categoryId: 'ct-5', categoryName: 'Fitting & Aftercare', subcategoryId: 'sc-10', subcategoryName: 'Follow-up', price: 480, vatRate: 0, durationMinutes: 30, icdCodeIds: [], icdCodes: '', procedureCodeIds: ['pc-6'], procedureCodes: '1105', description: '', status: 'inactive' },
];

export const fullTests = [
  {
    id: 'ft-1', name: 'Full Diagnostic Hearing Test', description: 'Complete adult diagnostic hearing assessment.', defaultIcdCodeIds: ['icd-1'], price: 1450, status: 'active',
    services: [
      { productId: 's-1', productName: 'Pure Tone Audiometry', procedureCode: '1004', procedureCodeId: 'pc-1', price: 650 },
      { productId: 's-2', productName: 'Speech Audiometry', procedureCode: '1006', procedureCodeId: 'pc-2', price: 420 },
      { productId: 's-3', productName: 'Tympanometry', procedureCode: '1008', procedureCodeId: 'pc-3', price: 380 },
    ],
  },
  {
    id: 'ft-2', name: 'Screening Test', description: 'Quick screening with tympanometry.', defaultIcdCodeIds: ['icd-7'], price: 1030, status: 'active',
    services: [
      { productId: 's-1', productName: 'Pure Tone Audiometry', procedureCode: '1004', procedureCodeId: 'pc-1', price: 650 },
      { productId: 's-3', productName: 'Tympanometry', procedureCode: '1008', procedureCodeId: 'pc-3', price: 380 },
    ],
  },
];

export const suppliers = [
  { id: 'sp-1', name: 'Sonova South Africa (Pty) Ltd', contactPerson: 'Lize Pretorius', email: 'orders@sonova.co.za', phone: '011 555 1001', vatNumber: '4010203040', registrationNumber: '2001/012345/07', bankName: 'Standard Bank', accountNumber: '070000001', branchCode: '051001', address: 'Midrand, Gauteng', notes: '30-day account', status: 'active' },
  { id: 'sp-2', name: 'Demant South Africa', contactPerson: 'Johan Smit', email: 'orders@demant.co.za', phone: '011 555 1002', vatNumber: '4020304050', registrationNumber: '1999/054321/07', bankName: 'Nedbank', accountNumber: '1100000002', branchCode: '198765', address: 'Johannesburg, Gauteng', notes: '', status: 'active' },
  { id: 'sp-3', name: 'Hearing Accessories Direct', contactPerson: 'Priya Naidoo', email: 'sales@had.co.za', phone: '031 555 1003', vatNumber: '', registrationNumber: '', bankName: '', accountNumber: '', branchCode: '', address: 'Durban, KZN', notes: 'Cash on delivery', status: 'inactive' },
];

export const medicalAids = [
  { id: 'ma-1', name: 'Discovery Health Medical Scheme', code: 'DHMS', administrator: 'Discovery Health', phone: '0860 99 88 77', email: 'claims@discovery.co.za', claimsEmail: 'claims@discovery.co.za', website: 'https://www.discovery.co.za', planCount: 3, status: 'active' },
  { id: 'ma-2', name: 'Bonitas Medical Fund', code: 'BON', administrator: 'Medscheme', phone: '0860 002 108', email: 'service@bonitas.co.za', claimsEmail: 'claims@bonitas.co.za', website: 'https://www.bonitas.co.za', planCount: 2, status: 'active' },
  { id: 'ma-3', name: 'Momentum Health', code: 'MMH', administrator: 'Momentum Health Solutions', phone: '0860 11 78 59', email: 'member@momentum.co.za', claimsEmail: 'claims@momentum.co.za', website: 'https://www.momentum.co.za', planCount: 1, status: 'active' },
  { id: 'ma-4', name: 'GEMS', code: 'GEMS', administrator: 'Metropolitan Health', phone: '0860 00 4367', email: 'enquiries@gems.gov.za', claimsEmail: 'claims@gems.gov.za', website: 'https://www.gems.gov.za', planCount: 0, status: 'inactive' },
];

export const medicalAidPlans = [
  { id: 'pl-1', name: 'Classic Comprehensive', code: 'CLCOMP', medicalAidId: 'ma-1', medicalAidName: 'Discovery Health Medical Scheme', membershipType: 'Comprehensive', benefitNotes: 'Hearing aids covered from Above Threshold Benefit.', status: 'active' },
  { id: 'pl-2', name: 'Executive', code: 'EXEC', medicalAidId: 'ma-1', medicalAidName: 'Discovery Health Medical Scheme', membershipType: 'Comprehensive', benefitNotes: '', status: 'active' },
  { id: 'pl-3', name: 'Coastal Saver', code: 'COAST', medicalAidId: 'ma-1', medicalAidName: 'Discovery Health Medical Scheme', membershipType: 'Saver', benefitNotes: 'MSA only', status: 'active' },
  { id: 'pl-4', name: 'BonComprehensive', code: 'BCOMP', medicalAidId: 'ma-2', medicalAidName: 'Bonitas Medical Fund', membershipType: 'Comprehensive', benefitNotes: '', status: 'active' },
  { id: 'pl-5', name: 'BonEssential', code: 'BESS', medicalAidId: 'ma-2', medicalAidName: 'Bonitas Medical Fund', membershipType: 'Hospital', benefitNotes: '', status: 'active' },
  { id: 'pl-6', name: 'Summit', code: 'SUM', medicalAidId: 'ma-3', medicalAidName: 'Momentum Health', membershipType: 'Comprehensive', benefitNotes: '', status: 'active' },
];

const firstNames = ['Ryan', 'Lerato', 'Johan', 'Sipho', 'Elsa', 'Fatima', 'Peter', 'Nomsa', 'David', 'Karin', 'Themba', 'Grace', 'Willem', 'Ayesha', 'Michael', 'Zanele', 'Hendrik', 'Lindiwe', 'Charl', 'Precious', 'Andre', 'Busisiwe'];
const lastNames = ['Lloyd', 'Nkosi', 'van der Merwe', 'Dlamini', 'Joubert', 'Patel', 'Smith', 'Khumalo', 'Brown', 'Venter', 'Mthembu', 'Adams', 'Pretorius', 'Essop', 'Jacobs', 'Ndlovu', 'Steyn', 'Zulu', 'Fourie', 'Mokoena', 'Coetzee', 'Sithole'];

export const patients = firstNames.map((first, i) => {
  const branch = branches[i % 3];
  const second = i % 5 === 0 ? branches[(i + 1) % 3] : null;
  const aid = i % 4 === 3 ? null : medicalAids[i % 3];
  const plan = aid ? medicalAidPlans.find((p) => p.medicalAidId === aid.id) : null;
  return {
    id: `pt-${i + 1}`,
    patientNumber: `PT-2026-${String(i + 1).padStart(5, '0')}`,
    title: i % 2 ? 'Mrs' : 'Mr',
    firstName: first,
    lastName: lastNames[i],
    fullName: `${first} ${lastNames[i]}`,
    idNumber: `${String(50 + (i % 40)).padStart(2, '0')}0${(i % 9) + 1}15${String(5000 + i * 37).slice(0, 4)}08${i % 10}`,
    dateOfBirth: `19${50 + (i % 40)}-0${(i % 9) + 1}-15`,
    gender: i % 2 ? 'female' : 'male',
    mobile: `08${2 + (i % 4)} ${String(100 + i * 7).padStart(3, '0')} ${String(1000 + i * 13).slice(0, 4)}`,
    email: `${first.toLowerCase()}.${lastNames[i].toLowerCase().replace(/\s/g, '')}@example.com`,
    address: `${10 + i} Example Street, ${branch.city}`,
    branchIds: second ? [branch.id, second.id] : [branch.id],
    branchNames: second ? `${branch.name}, ${second.name}` : branch.name,
    medicalAidId: aid?.id ?? null,
    medicalAidName: aid?.name ?? null,
    medicalAidPlanId: plan?.id ?? null,
    planName: plan?.name ?? null,
    membershipNumber: aid ? `${aid.code}${String(900000 + i * 1111)}` : null,
    dependantCode: aid ? '00' : null,
    mainMember: aid ? `${first} ${lastNames[i]}` : null,
    referredBy: i % 3 === 0 ? 'Dr. K. Naidoo (GP)' : null,
    status: i % 9 === 8 ? 'inactive' : 'active',
    createdAt: day(-120 + i * 5),
    lastVisitAt: day(-i * 3, '10:30'),
  };
});

const pt = (n) => patients[n - 1];

export const invoices = [
  { id: 'inv-1', number: 'INV-2026-0101', type: 'invoice', status: 'paid', patientId: 'pt-1', patientName: pt(1).fullName, branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', date: dateOnly(-20), dueDate: dateOnly(10), subtotal: 77000, vat: 11550, total: 88550, balance: 0, createdByName: 'Anika Botha', icdCodeIds: ['icd-1'],
    lines: [
      { id: 'l-1', productId: 'p-1', productName: 'Phonak Audéo Lumity L90-R', type: 'standard', quantity: 2, unitPrice: 38500, vatRate: 15, total: 88550, icdCodeIds: ['icd-1'], procedureCodeId: null, serialNumbers: ['PH24A001', 'PH24A002'] },
    ] },
  { id: 'inv-2', number: 'INV-2026-0102', type: 'invoice', status: 'partially_paid', patientId: 'pt-2', patientName: pt(2).fullName, branchId: 'br-2', branchName: 'Claremont', warehouseId: 'wh-4', warehouseName: 'Main Stock', date: dateOnly(-8), dueDate: dateOnly(22), subtotal: 42650, vat: 6180, total: 48830, balance: 18830, createdByName: 'Thabo Mokoena', icdCodeIds: ['icd-3'],
    lines: [
      { id: 'l-2', productId: 'p-2', productName: 'Oticon Intent 1 miniRITE R', type: 'standard', quantity: 1, unitPrice: 41200, vatRate: 15, total: 47380, icdCodeIds: ['icd-3'], procedureCodeId: null },
      { id: 'l-3', productId: 's-4', productName: 'Hearing Aid Fitting (per ear)', type: 'service', quantity: 1, unitPrice: 1450, vatRate: 0, total: 1450, icdCodeIds: ['icd-3'], procedureCodeId: 'pc-5' },
    ] },
  { id: 'inv-3', number: 'QUO-2026-0045', type: 'quote', status: 'quote', patientId: 'pt-3', patientName: pt(3).fullName, branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', date: dateOnly(-2), dueDate: dateOnly(28), subtotal: 65800, vat: 9870, total: 75670, balance: 75670, createdByName: 'Anika Botha', icdCodeIds: [],
    lines: [
      { id: 'l-4', productId: 'p-3', productName: 'Signia Pure Charge&Go 7IX', type: 'standard', quantity: 2, unitPrice: 32900, vatRate: 15, total: 75670, icdCodeIds: [], procedureCodeId: null },
    ] },
  { id: 'inv-4', number: 'PRO-2026-0012', type: 'proforma', status: 'proforma', patientId: 'pt-4', patientName: pt(4).fullName, branchId: 'br-3', branchName: 'Stellenbosch', warehouseId: 'wh-6', warehouseName: 'Main Stock', date: dateOnly(-1), dueDate: dateOnly(14), subtotal: 1450, vat: 0, total: 1450, balance: 1450, createdByName: 'Megan van Wyk', icdCodeIds: ['icd-1'],
    lines: [
      { id: 'l-5', productId: 's-1', productName: 'Pure Tone Audiometry', type: 'service', quantity: 1, unitPrice: 650, vatRate: 0, total: 650, icdCodeIds: ['icd-1'], procedureCodeId: 'pc-1', fullTestId: 'ft-1' },
      { id: 'l-6', productId: 's-2', productName: 'Speech Audiometry', type: 'service', quantity: 1, unitPrice: 420, vatRate: 0, total: 420, icdCodeIds: ['icd-1'], procedureCodeId: 'pc-2', fullTestId: 'ft-1' },
      { id: 'l-7', productId: 's-3', productName: 'Tympanometry', type: 'service', quantity: 1, unitPrice: 380, vatRate: 0, total: 380, icdCodeIds: ['icd-1'], procedureCodeId: 'pc-3', fullTestId: 'ft-1' },
    ] },
  { id: 'inv-5', number: 'INV-2026-0103', type: 'invoice', status: 'overdue', patientId: 'pt-5', patientName: pt(5).fullName, branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', date: dateOnly(-45), dueDate: dateOnly(-15), subtotal: 2950, vat: 442.5, total: 3392.5, balance: 3392.5, createdByName: 'Anika Botha', icdCodeIds: [],
    lines: [{ id: 'l-8', productId: 'p-5', productName: 'Phonak Charger Case Go', type: 'standard', quantity: 1, unitPrice: 2950, vatRate: 15, total: 3392.5, icdCodeIds: [], procedureCodeId: null }] },
  { id: 'inv-6', number: 'INV-2026-0104', type: 'invoice', status: 'unpaid', patientId: 'pt-1', patientName: pt(1).fullName, branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', date: dateOnly(-3), dueDate: dateOnly(27), subtotal: 570, vat: 85.5, total: 655.5, balance: 655.5, createdByName: 'Anika Botha', icdCodeIds: [],
    lines: [{ id: 'l-9', productId: 'p-6', productName: 'Activair 312 Batteries (6-pack)', type: 'standard', quantity: 6, unitPrice: 95, vatRate: 15, total: 655.5, icdCodeIds: [], procedureCodeId: null }] },
  { id: 'inv-7', number: 'INV-2026-0100', type: 'invoice', status: 'cancelled', patientId: 'pt-6', patientName: pt(6).fullName, branchId: 'br-2', branchName: 'Claremont', warehouseId: 'wh-4', warehouseName: 'Main Stock', date: dateOnly(-30), dueDate: dateOnly(0), subtotal: 650, vat: 0, total: 650, balance: 0, createdByName: 'Thabo Mokoena', icdCodeIds: [], lines: [] },
];

export const payments = [
  { id: 'pay-1', number: 'PAY-0201', patientId: 'pt-1', patientName: pt(1).fullName, invoiceId: 'inv-1', invoiceNumber: 'INV-2026-0101', date: dateOnly(-18), method: 'medical_aid', amount: 70000, reference: 'DHMS-REMIT-5521', status: 'completed' },
  { id: 'pay-2', number: 'PAY-0202', patientId: 'pt-1', patientName: pt(1).fullName, invoiceId: 'inv-1', invoiceNumber: 'INV-2026-0101', date: dateOnly(-18), method: 'card', amount: 18550, reference: 'POS 88213', status: 'completed' },
  { id: 'pay-3', number: 'PAY-0203', patientId: 'pt-2', patientName: pt(2).fullName, invoiceId: 'inv-2', invoiceNumber: 'INV-2026-0102', date: dateOnly(-6), method: 'eft', amount: 30000, reference: 'EFT LLOYD', status: 'completed' },
  { id: 'pay-4', number: 'PAY-0204', patientId: 'pt-5', patientName: pt(5).fullName, invoiceId: 'inv-5', invoiceNumber: 'INV-2026-0103', date: dateOnly(-1), method: 'card', amount: 3392.5, reference: 'POS 88340', status: 'failed' },
];

export const refunds = [
  { id: 'ref-1', number: 'REF-0011', patientId: 'pt-6', patientName: pt(6).fullName, invoiceId: 'inv-7', invoiceNumber: 'INV-2026-0100', date: dateOnly(-28), amount: 650, method: 'eft', reason: 'Appointment cancelled', status: 'processed' },
  { id: 'ref-2', number: 'REF-0012', patientId: 'pt-1', patientName: pt(1).fullName, invoiceId: 'inv-1', invoiceNumber: 'INV-2026-0101', date: dateOnly(-2), amount: 1200, method: 'card', reason: 'Overpayment', status: 'requested' },
];

export const purchases = [
  { id: 'pur-1', number: 'PUR-2026-0031', supplierId: 'sp-1', supplierName: suppliers[0].name, branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', patientId: 'pt-1', patientName: pt(1).fullName, date: dateOnly(-25), supplierReference: 'SO-778812', itemCount: 2, total: 48000, status: 'completed', notes: '',
    lines: [{ id: 'pl-1', productId: 'p-1', productName: 'Phonak Audéo Lumity L90-R', trackSerials: true, quantity: 2, unitCost: 24000, serialNumbers: ['PH24A001', 'PH24A002'] }] },
  { id: 'pur-2', number: 'PUR-2026-0032', supplierId: 'sp-2', supplierName: suppliers[1].name, branchId: 'br-2', branchName: 'Claremont', warehouseId: 'wh-4', warehouseName: 'Main Stock', patientId: null, patientName: null, date: dateOnly(-4), supplierReference: 'DM-55102', itemCount: 3, total: 79500, status: 'draft', notes: 'Awaiting delivery note',
    lines: [{ id: 'pl-2', productId: 'p-2', productName: 'Oticon Intent 1 miniRITE R', trackSerials: true, quantity: 3, unitCost: 26500, serialNumbers: ['OT9921', '', ''] }] },
  { id: 'pur-3', number: 'PUR-2026-0033', supplierId: 'sp-1', supplierName: suppliers[0].name, branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', patientId: null, patientName: null, date: dateOnly(-1), supplierReference: '', itemCount: 60, total: 2880, status: 'completed', notes: '',
    lines: [{ id: 'pl-3', productId: 'p-6', productName: 'Activair 312 Batteries (6-pack)', trackSerials: false, quantity: 60, unitCost: 48, serialNumbers: [] }] },
];

export const stockLevels = [
  { id: 'sl-1', productId: 'p-1', productName: 'Phonak Audéo Lumity L90-R', sku: 'PH-LUM-L90R', branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', onHand: 4, reserved: 0, available: 4, reorderLevel: 2, status: 'in_stock' },
  { id: 'sl-2', productId: 'p-1', productName: 'Phonak Audéo Lumity L90-R', sku: 'PH-LUM-L90R', branchId: 'br-2', branchName: 'Claremont', warehouseId: 'wh-4', warehouseName: 'Main Stock', onHand: 2, reserved: 0, available: 2, reorderLevel: 2, status: 'low' },
  { id: 'sl-3', productId: 'p-2', productName: 'Oticon Intent 1 miniRITE R', sku: 'OT-INT1-MR', branchId: 'br-2', branchName: 'Claremont', warehouseId: 'wh-4', warehouseName: 'Main Stock', onHand: 2, reserved: 1, available: 1, reorderLevel: 3, status: 'low' },
  { id: 'sl-4', productId: 'p-3', productName: 'Signia Pure Charge&Go 7IX', sku: 'SG-PCG-7IX', branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', onHand: 0, reserved: 0, available: 0, reorderLevel: 2, status: 'out' },
  { id: 'sl-5', productId: 'p-4', productName: 'ReSound Nexia 9 BTE', sku: 'RS-NEX9-BTE', branchId: 'br-3', branchName: 'Stellenbosch', warehouseId: 'wh-6', warehouseName: 'Main Stock', onHand: 3, reserved: 0, available: 3, reorderLevel: 2, status: 'in_stock' },
  { id: 'sl-6', productId: 'p-4', productName: 'ReSound Nexia 9 BTE', sku: 'RS-NEX9-BTE', branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-2', warehouseName: 'Broken Stock', onHand: 1, reserved: 0, available: 1, reorderLevel: 0, status: 'in_stock' },
  { id: 'sl-7', productId: 'p-5', productName: 'Phonak Charger Case Go', sku: 'PH-CHG-GO', branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', onHand: 8, reserved: 0, available: 8, reorderLevel: 3, status: 'in_stock' },
  { id: 'sl-8', productId: 'p-5', productName: 'Phonak Charger Case Go', sku: 'PH-CHG-GO', branchId: 'br-2', branchName: 'Claremont', warehouseId: 'wh-4', warehouseName: 'Main Stock', onHand: 3, reserved: 0, available: 3, reorderLevel: 3, status: 'low' },
  { id: 'sl-9', productId: 'p-6', productName: 'Activair 312 Batteries (6-pack)', sku: 'AC-312-6', branchId: 'br-1', branchName: 'Durbanville', warehouseId: 'wh-1', warehouseName: 'Main Stock', onHand: 96, reserved: 0, available: 96, reorderLevel: 30, status: 'in_stock' },
  { id: 'sl-10', productId: 'p-6', productName: 'Activair 312 Batteries (6-pack)', sku: 'AC-312-6', branchId: 'br-3', branchName: 'Stellenbosch', warehouseId: 'wh-6', warehouseName: 'Main Stock', onHand: 44, reserved: 0, available: 44, reorderLevel: 30, status: 'in_stock' },
];

export const stockMovements = [
  { id: 'mv-1', productName: 'Activair 312 Batteries (6-pack)', branchName: 'Durbanville', warehouseName: 'Main Stock', direction: 'in', quantity: 60, reason: 'Purchase received', reference: 'PUR-2026-0033', userName: 'Anika Botha', occurredAt: day(-1, '11:20') },
  { id: 'mv-2', productName: 'Activair 312 Batteries (6-pack)', branchName: 'Durbanville', warehouseName: 'Main Stock', direction: 'out', quantity: 6, reason: 'Invoice', reference: 'INV-2026-0104', userName: 'Anika Botha', occurredAt: day(-3, '14:05') },
  { id: 'mv-3', productName: 'ReSound Nexia 9 BTE', branchName: 'Durbanville', warehouseName: 'Broken Stock', direction: 'in', quantity: 1, reason: 'Damaged unit moved from Main Stock', reference: 'ADJ-0019', userName: 'Anika Botha', occurredAt: day(-5, '09:40') },
  { id: 'mv-4', productName: 'Oticon Intent 1 miniRITE R', branchName: 'Claremont', warehouseName: 'Main Stock', direction: 'out', quantity: 1, reason: 'Invoice', reference: 'INV-2026-0102', userName: 'Thabo Mokoena', occurredAt: day(-8, '15:30') },
  { id: 'mv-5', productName: 'Phonak Audéo Lumity L90-R', branchName: 'Durbanville', warehouseName: 'Main Stock', direction: 'out', quantity: 2, reason: 'Invoice', reference: 'INV-2026-0101', userName: 'Anika Botha', occurredAt: day(-20, '10:10') },
];

export const roles = [
  { id: 'rl-1', name: 'Administrator', description: 'Full access to all branches and settings.', isAdmin: true, userCount: 1, permissions: ['*'], status: 'active' },
  { id: 'rl-2', name: 'Store Manager', description: 'Manages a branch: sales, stock, patients.', isAdmin: false, userCount: 3, permissions: ['dashboard.view', 'products.view', 'stock.view', 'stock.adjust', 'invoices.view', 'invoices.create', 'invoices.edit', 'purchases.view', 'purchases.create', 'patients.view', 'patients.create', 'patients.edit', 'claims.view', 'claims.create', 'leads.view', 'leads.edit'], status: 'active' },
  { id: 'rl-3', name: 'Audiologist', description: 'Clinical access to patients and claims.', isAdmin: false, userCount: 2, permissions: ['dashboard.view', 'patients.view', 'patients.edit', 'invoices.view', 'invoices.create', 'claims.view', 'claims.create'], status: 'active' },
  { id: 'rl-4', name: 'Front Desk', description: 'Reception, leads and appointments.', isAdmin: false, userCount: 1, permissions: ['patients.view', 'patients.create', 'leads.view', 'leads.create', 'leads.edit'], status: 'active' },
];

export const users = [
  { id: 'u-1', fullName: 'Practice Admin', email: 'admin@futurehearing.co.za', phone: '', roleId: 'rl-1', roleName: 'Administrator', branchIds: ['br-1', 'br-2', 'br-3', 'br-4'], branchNames: 'All branches', defaultBranchId: 'br-1', defaultBranchName: 'Durbanville', defaultWarehouseId: 'wh-1', defaultWarehouseName: 'Main Stock', status: 'active', lastLoginAt: day(0, '08:12') },
  { id: 'u-2', fullName: 'Anika Botha', email: 'anika@futurehearing.co.za', phone: '082 111 2222', roleId: 'rl-2', roleName: 'Store Manager', branchIds: ['br-1'], branchNames: 'Durbanville', defaultBranchId: 'br-1', defaultBranchName: 'Durbanville', defaultWarehouseId: 'wh-1', defaultWarehouseName: 'Main Stock', status: 'active', lastLoginAt: day(0, '07:58') },
  { id: 'u-3', fullName: 'Thabo Mokoena', email: 'thabo@futurehearing.co.za', phone: '083 222 3333', roleId: 'rl-2', roleName: 'Store Manager', branchIds: ['br-2'], branchNames: 'Claremont', defaultBranchId: 'br-2', defaultBranchName: 'Claremont', defaultWarehouseId: 'wh-4', defaultWarehouseName: 'Main Stock', status: 'active', lastLoginAt: day(-1, '16:40') },
  { id: 'u-4', fullName: 'Megan van Wyk', email: 'megan@futurehearing.co.za', phone: '084 333 4444', roleId: 'rl-3', roleName: 'Audiologist', branchIds: ['br-3', 'br-1'], branchNames: 'Stellenbosch, Durbanville', defaultBranchId: 'br-3', defaultBranchName: 'Stellenbosch', defaultWarehouseId: 'wh-6', defaultWarehouseName: 'Main Stock', status: 'active', lastLoginAt: day(-2, '09:05') },
  { id: 'u-5', fullName: 'Kayla Adams', email: 'kayla@futurehearing.co.za', phone: '', roleId: 'rl-4', roleName: 'Front Desk', branchIds: ['br-1'], branchNames: 'Durbanville', defaultBranchId: 'br-1', defaultBranchName: 'Durbanville', defaultWarehouseId: null, defaultWarehouseName: null, status: 'inactive', lastLoginAt: day(-40, '12:00') },
];

export const leads = [
  { id: 'ld-1', fullName: 'Sarah Jansen', email: 'sarah.jansen@example.com', phone: '082 555 0101', source: 'website', status: 'new', interest: 'Free hearing screening', assignedToId: 'u-5', assignedToName: 'Kayla Adams', branchId: 'br-1', branchName: 'Durbanville', createdAt: day(-1, '10:12') },
  { id: 'ld-2', fullName: 'Kobus Visser', email: 'kobus@example.com', phone: '083 555 0102', source: 'facebook', status: 'contacted', interest: 'Rechargeable hearing aids', assignedToId: 'u-2', assignedToName: 'Anika Botha', branchId: 'br-1', branchName: 'Durbanville', createdAt: day(-4, '13:30') },
  { id: 'ld-3', fullName: 'Nandi Shabalala', email: 'nandi@example.com', phone: '084 555 0103', source: 'referral', status: 'appointment_booked', interest: 'Tinnitus consultation', assignedToId: 'u-4', assignedToName: 'Megan van Wyk', branchId: 'br-3', branchName: 'Stellenbosch', createdAt: day(-6, '09:00') },
  { id: 'ld-4', fullName: 'George Daniels', email: '', phone: '072 555 0104', source: 'walk_in', status: 'qualified', interest: 'Hearing test for father', assignedToId: 'u-3', assignedToName: 'Thabo Mokoena', branchId: 'br-2', branchName: 'Claremont', createdAt: day(-9, '11:45') },
  { id: 'ld-5', fullName: 'Marlene Kruger', email: 'marlene@example.com', phone: '082 555 0105', source: 'google_ads', status: 'converted', interest: 'Hearing aid upgrade', assignedToId: 'u-2', assignedToName: 'Anika Botha', branchId: 'br-1', branchName: 'Durbanville', createdAt: day(-15, '15:20') },
  { id: 'ld-6', fullName: 'Ismail Hendricks', email: 'ismail@example.com', phone: '079 555 0106', source: 'website', status: 'lost', interest: 'Price enquiry', assignedToId: null, assignedToName: null, branchId: 'br-2', branchName: 'Claremont', createdAt: day(-21, '08:30') },
];

export const communications = [
  { id: 'cm-1', channel: 'whatsapp', direction: 'outbound', from: 'Future Hearing', to: pt(1).mobile, subject: null, summary: 'Hi Ryan, your hearing aids are ready for collection at Durbanville. 😊', status: 'read', occurredAt: day(-2, '09:14'), staffName: 'Anika Botha', patientId: 'pt-1' },
  { id: 'cm-2', channel: 'whatsapp', direction: 'inbound', from: pt(1).mobile, to: 'Future Hearing', subject: null, summary: 'Thank you! I will come by on Friday morning.', status: 'received', occurredAt: day(-2, '09:31'), staffName: null, patientId: 'pt-1' },
  { id: 'cm-3', channel: 'call', direction: 'outbound', from: 'Durbanville reception', to: pt(1).mobile, subject: 'Follow-up call', summary: 'Checked in after fitting. Patient happy, minor feedback on left ear. Booked fine tuning.', status: 'answered', durationSeconds: 312, occurredAt: day(-6, '14:02'), staffName: 'Kayla Adams', patientId: 'pt-1' },
  { id: 'cm-4', channel: 'call', direction: 'inbound', from: pt(1).mobile, to: 'Durbanville reception', subject: 'Battery question', summary: 'Asked about charger case LED behaviour.', status: 'missed', durationSeconds: 0, occurredAt: day(-9, '11:47'), staffName: null, patientId: 'pt-1' },
  { id: 'cm-5', channel: 'email', direction: 'outbound', from: 'durbanville@futurehearing.co.za', to: pt(1).email, subject: 'Your invoice INV-2026-0101', summary: 'Please find attached your invoice and audiogram report.', status: 'delivered', occurredAt: day(-20, '16:20'), staffName: 'Anika Botha', patientId: 'pt-1' },
  { id: 'cm-6', channel: 'whatsapp', direction: 'outbound', from: 'Future Hearing', to: '082 555 0101', subject: null, summary: 'Hi Sarah, thanks for your enquiry! When would suit you for a free screening?', status: 'delivered', occurredAt: day(-1, '10:40'), staffName: 'Kayla Adams', leadId: 'ld-1' },
  { id: 'cm-7', channel: 'call', direction: 'outbound', from: 'Durbanville reception', to: '083 555 0102', subject: 'Intro call', summary: 'Discussed rechargeable options and pricing. Sending brochure.', status: 'answered', durationSeconds: 420, occurredAt: day(-3, '10:00'), staffName: 'Anika Botha', leadId: 'ld-2' },
];

export const appointments = [
  { id: 'ap-1', patientId: 'pt-1', patientName: pt(1).fullName, date: dateOnly(3), time: '10:00', durationMinutes: 30, branchId: 'br-1', branchName: 'Durbanville', staffName: 'Megan van Wyk', type: 'fine_tuning', status: 'confirmed', notes: 'Left ear feedback' },
  { id: 'ap-2', patientId: 'pt-1', patientName: pt(1).fullName, date: dateOnly(-20), time: '09:30', durationMinutes: 60, branchId: 'br-1', branchName: 'Durbanville', staffName: 'Megan van Wyk', type: 'fitting', status: 'completed', notes: '' },
  { id: 'ap-3', patientId: 'pt-1', patientName: pt(1).fullName, date: dateOnly(-35), time: '11:00', durationMinutes: 60, branchId: 'br-1', branchName: 'Durbanville', staffName: 'Megan van Wyk', type: 'hearing_test', status: 'completed', notes: '' },
  { id: 'ap-4', patientId: 'pt-2', patientName: pt(2).fullName, date: dateOnly(1), time: '14:30', durationMinutes: 30, branchId: 'br-2', branchName: 'Claremont', staffName: 'Thabo Mokoena', type: 'follow_up', status: 'scheduled', notes: '' },
  { id: 'ap-5', patientId: 'pt-3', patientName: pt(3).fullName, date: dateOnly(0), time: '11:15', durationMinutes: 60, branchId: 'br-1', branchName: 'Durbanville', staffName: 'Megan van Wyk', type: 'consultation', status: 'scheduled', notes: 'Discuss quote QUO-2026-0045' },
  { id: 'ap-6', leadId: 'ld-3', patientName: 'Nandi Shabalala (lead)', date: dateOnly(2), time: '09:00', durationMinutes: 45, branchId: 'br-3', branchName: 'Stellenbosch', staffName: 'Megan van Wyk', type: 'consultation', status: 'confirmed', notes: 'Tinnitus' },
  { id: 'ap-7', patientId: 'pt-6', patientName: pt(6).fullName, date: dateOnly(-30), time: '15:00', durationMinutes: 30, branchId: 'br-2', branchName: 'Claremont', staffName: 'Thabo Mokoena', type: 'hearing_test', status: 'cancelled', notes: '' },
];

export const notes = [
  { id: 'nt-1', patientId: 'pt-1', body: 'Patient prefers morning appointments. Hard of hearing on the phone — WhatsApp preferred.', authorName: 'Kayla Adams', createdAt: day(-30, '10:20'), updatedAt: null },
  { id: 'nt-2', patientId: 'pt-1', body: 'Fitted Lumity L90 bilateral. Real-ear measurements done. Review in 2 weeks.', authorName: 'Megan van Wyk', createdAt: day(-20, '10:45'), updatedAt: day(-20, '11:00') },
  { id: 'nt-3', leadId: 'ld-2', body: 'Interested in Phonak. Budget around R60k. Has Discovery Classic.', authorName: 'Anika Botha', createdAt: day(-3, '10:15'), updatedAt: null },
  { id: 'nt-4', claimId: 'cl-2', body: 'Medical aid requested audiogram. Uploaded and resubmitted.', authorName: 'Thabo Mokoena', createdAt: day(-3, '12:00'), updatedAt: null },
];

export const documents = [
  { id: 'dc-1', patientId: 'pt-1', name: 'Audiogram 2026-08-28.pdf', type: 'audiogram', size: 284000, uploadedAt: day(-35, '11:40'), uploadedBy: 'Megan van Wyk', url: null },
  { id: 'dc-2', patientId: 'pt-1', name: 'ID copy.jpg', type: 'identification', size: 912000, uploadedAt: day(-35, '11:02'), uploadedBy: 'Kayla Adams', url: null },
  { id: 'dc-3', patientId: 'pt-1', name: 'Medical aid card.jpg', type: 'medical_aid', size: 640000, uploadedAt: day(-35, '11:03'), uploadedBy: 'Kayla Adams', url: null },
  { id: 'dc-4', patientId: 'pt-1', claimId: 'cl-1', name: 'Claim pre-authorisation.pdf', type: 'claim', size: 120000, uploadedAt: day(-22, '09:15'), uploadedBy: 'Anika Botha', url: null },
  { id: 'dc-5', patientId: 'pt-2', claimId: 'cl-2', name: 'Audiogram 2026-09-20.pdf', type: 'audiogram', size: 301000, uploadedAt: day(-3, '11:55'), uploadedBy: 'Thabo Mokoena', url: null },
];

export const claims = [
  { id: 'cl-1', number: 'CLM-2026-0051', patientId: 'pt-1', patientName: pt(1).fullName, medicalAidId: 'ma-1', medicalAidName: 'Discovery Health Medical Scheme', planName: 'Classic Comprehensive', membershipNumber: pt(1).membershipNumber, invoiceId: 'inv-1', invoiceNumber: 'INV-2026-0101', date: dateOnly(-19), amount: 70000, approvedAmount: 70000, status: 'paid', practiceName: 'Future Hearing Durbanville Practice',
    icdCodes: [{ code: 'H90.3', description: 'Sensorineural hearing loss, bilateral' }],
    procedureCodes: [{ code: '1101', description: 'Hearing aid fitting (per ear)', quantity: 2, amount: 2900 }],
    timeline: [
      { id: 't1', type: 'claim', title: 'Claim created', actorName: 'Anika Botha', occurredAt: day(-19, '09:00') },
      { id: 't2', type: 'claim', title: 'Submitted to Discovery Health', actorName: 'Anika Botha', occurredAt: day(-19, '09:30') },
      { id: 't3', type: 'claim', title: 'Approved — R 70 000,00', actorName: 'System', occurredAt: day(-17, '14:00') },
      { id: 't4', type: 'payment', title: 'Remittance received', description: 'DHMS-REMIT-5521', actorName: 'System', occurredAt: day(-18, '08:00') },
    ] },
  { id: 'cl-2', number: 'CLM-2026-0052', patientId: 'pt-2', patientName: pt(2).fullName, medicalAidId: 'ma-2', medicalAidName: 'Bonitas Medical Fund', planName: 'BonComprehensive', membershipNumber: pt(2).membershipNumber, invoiceId: 'inv-2', invoiceNumber: 'INV-2026-0102', date: dateOnly(-7), amount: 30000, approvedAmount: null, status: 'requires_information', practiceName: 'Future Hearing Claremont Practice',
    icdCodes: [{ code: 'H90.6', description: 'Mixed conductive and sensorineural hearing loss, bilateral' }],
    procedureCodes: [{ code: '1101', description: 'Hearing aid fitting (per ear)', quantity: 1, amount: 1450 }],
    timeline: [
      { id: 't1', type: 'claim', title: 'Claim created', actorName: 'Thabo Mokoena', occurredAt: day(-7, '10:00') },
      { id: 't2', type: 'claim', title: 'Submitted to Bonitas', actorName: 'Thabo Mokoena', occurredAt: day(-7, '10:20') },
      { id: 't3', type: 'warning', title: 'Additional information requested', description: 'Audiogram required', actorName: 'Bonitas', occurredAt: day(-4, '13:00') },
    ] },
  { id: 'cl-3', number: 'CLM-2026-0053', patientId: 'pt-4', patientName: pt(4).fullName, medicalAidId: 'ma-1', medicalAidName: 'Discovery Health Medical Scheme', planName: 'Classic Comprehensive', membershipNumber: pt(4).membershipNumber, invoiceId: 'inv-4', invoiceNumber: 'PRO-2026-0012', date: dateOnly(-1), amount: 1450, approvedAmount: null, status: 'draft', practiceName: 'Winelands Audiology',
    icdCodes: [{ code: 'H90.3', description: 'Sensorineural hearing loss, bilateral' }],
    procedureCodes: [
      { code: '1004', description: 'Pure tone audiometry (air and bone)', quantity: 1, amount: 650 },
      { code: '1006', description: 'Speech audiometry', quantity: 1, amount: 420 },
      { code: '1008', description: 'Tympanometry and acoustic reflexes', quantity: 1, amount: 380 },
    ],
    timeline: [{ id: 't1', type: 'claim', title: 'Claim drafted', actorName: 'Megan van Wyk', occurredAt: day(-1, '12:00') }] },
  { id: 'cl-4', number: 'CLM-2026-0050', patientId: 'pt-5', patientName: pt(5).fullName, medicalAidId: 'ma-3', medicalAidName: 'Momentum Health', planName: 'Summit', membershipNumber: pt(5).membershipNumber, invoiceId: 'inv-5', invoiceNumber: 'INV-2026-0103', date: dateOnly(-40), amount: 2950, approvedAmount: 0, status: 'rejected', practiceName: 'Future Hearing Durbanville Practice', icdCodes: [], procedureCodes: [],
    timeline: [{ id: 't1', type: 'error', title: 'Rejected — accessory not covered', actorName: 'Momentum Health', occurredAt: day(-35, '10:00') }] },
  { id: 'cl-5', number: 'CLM-2026-0054', patientId: 'pt-3', patientName: pt(3).fullName, medicalAidId: 'ma-1', medicalAidName: 'Discovery Health Medical Scheme', planName: 'Executive', membershipNumber: pt(3).membershipNumber, invoiceId: null, invoiceNumber: null, date: dateOnly(0), amount: 65800, approvedAmount: null, status: 'processing', practiceName: 'Future Hearing Durbanville Practice', icdCodes: [], procedureCodes: [], timeline: [] },
];

export const activities = [
  { id: 'ac-1', type: 'whatsapp', title: 'WhatsApp sent', description: 'Hearing aids ready for collection', actorName: 'Anika Botha', occurredAt: day(-2, '09:14'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-2', type: 'call', title: 'Follow-up call', description: 'Booked fine tuning', actorName: 'Kayla Adams', occurredAt: day(-6, '14:02'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-3', type: 'payment', title: 'Payment received', description: 'R 18 550,00 card · INV-2026-0101', actorName: 'Anika Botha', occurredAt: day(-18, '10:00'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-4', type: 'medical_aid', title: 'Claim approved', description: 'CLM-2026-0051 · Discovery Health', actorName: 'System', occurredAt: day(-17, '14:00'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-5', type: 'invoice', title: 'Invoice created', description: 'INV-2026-0101 · R 88 550,00', actorName: 'Anika Botha', occurredAt: day(-20, '10:05'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-6', type: 'appointment', title: 'Fitting appointment completed', description: 'Megan van Wyk', actorName: 'Megan van Wyk', occurredAt: day(-20, '10:30'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-7', type: 'purchase', title: 'Purchase allocated', description: 'PUR-2026-0031 · 2 units', actorName: 'Anika Botha', occurredAt: day(-25, '12:00'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-8', type: 'note', title: 'Note added', description: 'Prefers morning appointments', actorName: 'Kayla Adams', occurredAt: day(-30, '10:20'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-9', type: 'created', title: 'Patient created', description: 'PT-2026-00001', actorName: 'Kayla Adams', occurredAt: day(-120, '09:00'), patientId: 'pt-1', branchId: 'br-1' },
  { id: 'ac-10', type: 'invoice', title: 'Quote created', description: 'QUO-2026-0045 · Lerato Nkosi', actorName: 'Anika Botha', occurredAt: day(-2, '15:00'), patientId: 'pt-3', branchId: 'br-1' },
  { id: 'ac-11', type: 'stock', title: 'Stock received', description: '60 × Activair 312 into Main Stock', actorName: 'Anika Botha', occurredAt: day(-1, '11:20'), branchId: 'br-1' },
  { id: 'ac-12', type: 'medical_aid', title: 'Claim requires information', description: 'CLM-2026-0052 · Bonitas', actorName: 'Bonitas', occurredAt: day(-4, '13:00'), patientId: 'pt-2', branchId: 'br-2' },
  { id: 'ac-13', type: 'created', title: 'Lead created', description: 'Website enquiry', actorName: 'System', occurredAt: day(-1, '10:12'), leadId: 'ld-1', branchId: 'br-1' },
  { id: 'ac-14', type: 'whatsapp', title: 'WhatsApp sent', description: 'Screening invite', actorName: 'Kayla Adams', occurredAt: day(-1, '10:40'), leadId: 'ld-1', branchId: 'br-1' },
  { id: 'ac-15', type: 'call', title: 'Intro call', description: '7 min · answered', actorName: 'Anika Botha', occurredAt: day(-3, '10:00'), leadId: 'ld-2', branchId: 'br-1' },
];

export const notifications = [
  { id: 'n-1', title: 'Low stock: Oticon Intent 1', description: 'Claremont · Main Stock — 1 available', type: 'warning', occurredAt: day(0, '07:30'), read: false, link: '/stock' },
  { id: 'n-2', title: 'Claim requires information', description: 'CLM-2026-0052 · Bonitas', type: 'medical_aid', occurredAt: day(-4, '13:00'), read: false, link: '/claims/cl-2' },
  { id: 'n-3', title: 'New lead from website', description: 'Sarah Jansen', type: 'lead', occurredAt: day(-1, '10:12'), read: true, link: '/leads/ld-1' },
];

export const permissionCatalogue = [
  ['dashboard', 'Dashboard', ['view']],
  ['products', 'Products & catalogue', ['view', 'create', 'edit', 'delete']],
  ['stock', 'Stock & warehouses', ['view', 'adjust']],
  ['invoices', 'Invoices & quotes', ['view', 'create', 'edit', 'convert', 'delete']],
  ['payments', 'Payments & refunds', ['view', 'create', 'approve']],
  ['purchases', 'Purchases', ['view', 'create', 'edit', 'complete']],
  ['patients', 'Patients', ['view', 'create', 'edit', 'delete']],
  ['claims', 'Medical claims', ['view', 'create', 'edit', 'submit']],
  ['medicalAids', 'Medical aids & codes', ['view', 'create', 'edit', 'delete']],
  ['leads', 'Leads', ['view', 'create', 'edit', 'delete']],
  ['branches', 'Branches & practices', ['view', 'create', 'edit', 'delete']],
  ['users', 'Users & roles', ['view', 'create', 'edit', 'delete']],
  ['settings', 'Settings', ['view', 'edit']],
].map(([module, label, actions]) => ({
  module,
  label,
  actions: actions.map((a) => ({ key: `${module}.${a}`, label: a.charAt(0).toUpperCase() + a.slice(1) })),
}));

export const settings = {
  general: { businessName: 'Future Hearing', tradingName: 'Future Hearing (Pty) Ltd', registrationNumber: '2018/123456/07', vatNumber: '4123456789', email: 'info@futurehearing.co.za', phone: '021 975 0000', address: '12 Wellington Rd, Durbanville, 7550', currency: 'ZAR', timezone: 'Africa/Johannesburg' },
  invoice: { invoicePrefix: 'INV-', quotePrefix: 'QUO-', proformaPrefix: 'PRO-', defaultDueDays: 30, defaultVatRate: 15, quoteValidityDays: 30, footerText: 'Thank you for choosing Future Hearing.', bankingDetails: 'FNB · Future Hearing (Pty) Ltd · 62000000001 · 250655', showVatBreakdown: true },
  product: { skuPrefix: 'FH-', defaultReorderLevel: 2, requireSerialsForHearingAids: true, allowNegativeStock: false, defaultProductType: 'standard' },
  system: { sessionTimeoutMinutes: 30, dateFormat: 'DD/MM/YYYY', enableWhatsapp: false, enableEmailNotifications: true, auditLogRetentionDays: 365 },
};

export const currentUser = {
  id: 'u-1',
  fullName: 'Practice Admin',
  email: 'admin@futurehearing.co.za',
  roleName: 'Administrator / Owner',
  isAdmin: true,
  permissions: ['*'],
  defaultBranchId: null,
  defaultWarehouseId: 'wh-1',
};

export const dashboard = {
  stats: { totalBranches: 4, totalPatients: 22, totalProducts: 11, lowStock: 3, outOfStock: 1, pendingInvoices: 4, pendingPurchases: 1, openClaims: 3, newLeads: 4, revenueMonth: 141078, revenueChange: 12.4 },
  revenueSeries: [
    { label: 'May', value: 98200 },
    { label: 'Jun', value: 121500 },
    { label: 'Jul', value: 87300 },
    { label: 'Aug', value: 134900 },
    { label: 'Sep', value: 125600 },
    { label: 'Oct', value: 141078 },
  ],
};

/** Map of mock collection keys (used by createResource) to fixture arrays. */
export const collections = {
  branches, warehouses, practices, companies, brands, models, categories, subcategories,
  products, fullTests, suppliers, medicalAids, medicalAidPlans, icdCodes, procedureCodes,
  patients, invoices, payments, refunds, purchases, roles, users, leads, communications,
  appointments, notes, documents, claims, activities,
};
