import { icdCodesApi, medicalAidPlansApi, medicalAidsApi, procedureCodesApi } from '../../api';
import { csvCell, parseCsv, schemeShortCode, toCsv } from '../../utils/csv';

async function listAll(listFn, params = {}) {
  const items = [];
  let page = 1;
  while (page <= 50) {
    const res = await listFn({ ...params, page, pageSize: 100 });
    const batch = res.items ?? [];
    items.push(...batch);
    if (items.length >= (res.total ?? items.length) || !batch.length) break;
    page += 1;
  }
  return items;
}

function uniqueCode(base, used) {
  const root = (base || 'CODE').slice(0, 12).toUpperCase();
  if (!used.has(root)) {
    used.add(root);
    return root;
  }
  for (let n = 2; n < 1000; n += 1) {
    const next = `${root.slice(0, 10)}${n}`;
    if (!used.has(next)) {
      used.add(next);
      return next;
    }
  }
  return root;
}

function csvNum(row, ...keys) {
  const raw = csvCell(row, ...keys).replace(/[, ]/g, '');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function csvBool(row, ...keys) {
  const raw = csvCell(row, ...keys).trim().toUpperCase();
  if (['YES', 'Y', 'TRUE', '1'].includes(raw)) return true;
  if (['NO', 'N', 'FALSE', '0'].includes(raw)) return false;
  return null;
}

function csvSchemeType(row) {
  const raw = csvCell(row, 'Scheme Type').trim().toUpperCase();
  if (raw === 'OPEN' || raw === 'RESTRICTED') return raw;
  return null;
}

function packPlanNotes(row) {
  const lines = [
    ['Hearing Aid Benefit (ZAR)', csvCell(row, 'Hearing Aid Benefit (ZAR)')],
    ['Benefit Basis', csvCell(row, 'Benefit Basis')],
    ['Cycle in Years', csvCell(row, 'Cycle in Years')],
    ['Per Ear Limit (ZAR)', csvCell(row, 'Per Ear Limit (ZAR)')],
    ['Per Member Limit (ZAR)', csvCell(row, 'Per Member Limit (ZAR)')],
    ['Per Family Limit (ZAR)', csvCell(row, 'Per Family Limit (ZAR)')],
    ['Hearing Aid Coverage Status', csvCell(row, 'Hearing Aid Coverage Status')],
    ['Benefit Verification Status', csvCell(row, 'Benefit Verification Status')],
    ['Scheme Type', csvCell(row, 'Scheme Type')],
    ['Benefit Year', csvCell(row, 'Benefit Year')],
    ['2026 CMS Option Status', csvCell(row, '2026 CMS Option Status')],
    ['Claims Automation Eligible', csvCell(row, 'Claims Automation Eligible')],
    ['Confirmation Required', csvCell(row, 'Confirmation Required')],
    ['Source URL', csvCell(row, 'Source URL')],
    ['Special Conditions / Notes', csvCell(row, 'Special Conditions / Notes')],
  ].filter(([, value]) => value);
  return lines.map(([label, value]) => `${label}: ${value}`).join('\n');
}

function planPayload(aidId, row) {
  return {
    medicalAidId: aidId,
    name: csvCell(row, 'Plan'),
    cycleYears: csvNum(row, 'Cycle in Years'),
    hearingAidBenefitZar: csvNum(row, 'Hearing Aid Benefit (ZAR)'),
    benefitBasis: csvCell(row, 'Benefit Basis') || null,
    perEarLimitZar: csvNum(row, 'Per Ear Limit (ZAR)'),
    perMemberLimitZar: csvNum(row, 'Per Member Limit (ZAR)'),
    perFamilyLimitZar: csvNum(row, 'Per Family Limit (ZAR)'),
    coverageStatus: csvCell(row, 'Hearing Aid Coverage Status') || null,
    verificationStatus: csvCell(row, 'Benefit Verification Status') || null,
    cmsOptionStatus: csvCell(row, '2026 CMS Option Status') || null,
    benefitYear: csvNum(row, 'Benefit Year'),
    benefitCategory: csvCell(row, 'Benefit Category') || null,
    confirmationRequired: csvBool(row, 'Confirmation Required'),
    claimsAutomationEligible: csvBool(row, 'Claims Automation Eligible'),
    sourceUrl: csvCell(row, 'Source URL') || null,
    specialConditions: csvCell(row, 'Special Conditions / Notes') || null,
    benefitNotes: packPlanNotes(row) || null,
    status: 'active',
  };
}

function importStats(res) {
  const body = res && typeof res === 'object' ? res : {};
  const errors = Array.isArray(body.errors) ? body.errors : [];
  return {
    imported: Number(body.imported ?? body.created ?? body.upserted ?? 0) || 0,
    skipped: Number(body.skipped ?? 0) || 0,
    errors,
  };
}

async function tryServerImport(importFn, file) {
  const form = new FormData();
  form.append('file', file);
  return importStats(await importFn(form));
}

/** Rewrite Hearing Aid Labs ICD CSV to the columns POST /icd-codes/import already accepts. */
export function remapIcdImportCsv(text) {
  const { rows } = parseCsv(text);
  const mapped = rows
    .map((row) => ({
      code: csvCell(row, 'code', 'ICD10_Code'),
      description: csvCell(row, 'description', 'Diagnosis_Description'),
      category: csvCell(row, 'category', 'Category'),
      status: csvCell(row, 'status') || 'active',
    }))
    .filter((row) => row.code && row.description);
  return { count: mapped.length, csv: toCsv(['code', 'description', 'category', 'status'], mapped) };
}

export async function importIcdFile(file) {
  try {
    const res = await tryServerImport(icdCodesApi.import, file);
    if (res.imported > 0 || res.errors.length) return res;
  } catch {
    /* fall back to remapped code/description/category CSV */
  }

  const name = file.name || 'icd.csv';
  let upload = file;
  if (/\.csv$/i.test(name) || file.type === 'text/csv') {
    const remapped = remapIcdImportCsv(await file.text());
    if (!remapped.count) {
      throw new Error('No ICD-10 rows found. Need code / ICD10_Code and description / Diagnosis_Description.');
    }
    upload = new File([remapped.csv], name, { type: 'text/csv' });
  }
  const form = new FormData();
  form.append('file', upload);
  return importStats(await icdCodesApi.import(form));
}

export async function importProcedureCsv(file) {
  try {
    const res = await tryServerImport(procedureCodesApi.import, file);
    if (res.imported > 0 || res.errors.length) return res;
  } catch {
    /* fall back to POST/PUT walk with structured fields */
  }

  const { rows } = parseCsv(await file.text());
  const errors = [];
  let imported = 0;
  let skipped = 0;
  const existing = await listAll(procedureCodesApi.list);
  const byCode = new Map(existing.map((row) => [String(row.code || '').trim().toUpperCase(), row]));

  for (const row of rows) {
    const code = csvCell(row, 'Procedure_Code', 'code');
    const description = csvCell(row, 'Procedure_Description', 'description');
    if (!code || !description) {
      skipped += 1;
      continue;
    }
    const tariff = csvCell(row, '2026_COIDA_Tariff_ZAR_Excl_VAT', 'defaultPrice');
    const payload = {
      code,
      description,
      defaultPrice: tariff ? Number(tariff) : null,
      practiceType: csvCell(row, 'Practice_Type') || null,
      serviceCategory: csvCell(row, 'Service_Category') || null,
      billingUnit: csvCell(row, 'Billing_Unit') || null,
      workflowStage: csvCell(row, 'Suggested_Workflow_Stage') || null,
      tariffSource: csvCell(row, 'Tariff_Source') || null,
      sourceUrl: csvCell(row, 'Source_URL') || null,
      schemePaymentGuaranteed: csvBool(row, 'Scheme_Payment_Guaranteed'),
      claimStatusNote: csvCell(row, 'Medical_Scheme_Claim_Status') || null,
      specialConditions: csvCell(row, 'Special_Conditions_Notes') || null,
      status: 'active',
    };
    try {
      const current = byCode.get(code.toUpperCase());
      if (current) {
        await procedureCodesApi.update(current.id, payload);
      } else {
        const saved = await procedureCodesApi.create(payload);
        byCode.set(code.toUpperCase(), saved);
      }
      imported += 1;
    } catch (err) {
      errors.push(`${code}: ${err.message}`);
    }
  }

  return { imported, skipped, errors };
}

export async function importMedicalAidCsv(file) {
  try {
    const res = await tryServerImport(medicalAidsApi.import, file);
    if (res.imported > 0 || res.errors.length) return res;
  } catch {
    /* fall back to POST/PUT walk with structured plan fields */
  }

  const { rows } = parseCsv(await file.text());
  if (!rows.length) throw new Error('No medical-aid rows found.');

  const existingAids = await listAll(medicalAidsApi.list);
  const byName = new Map(existingAids.map((row) => [String(row.name || '').trim().toLowerCase(), row]));
  const usedCodes = new Set(existingAids.map((row) => String(row.code || '').trim().toUpperCase()).filter(Boolean));

  const errors = [];
  let imported = 0;
  let skipped = 0;

  const grouped = new Map();
  for (const row of rows) {
    const scheme = csvCell(row, 'Medical Aid Name');
    const plan = csvCell(row, 'Plan');
    if (!scheme || !plan) {
      skipped += 1;
      continue;
    }
    if (!grouped.has(scheme)) grouped.set(scheme, []);
    grouped.get(scheme).push(row);
  }

  for (const [scheme, planRows] of grouped) {
    let aid = byName.get(scheme.toLowerCase());
    const schemeType = csvSchemeType(planRows[0]);
    try {
      const aidPayload = {
        name: scheme,
        schemeType,
        notes: csvCell(planRows[0], 'Source URL') ? `Source URL: ${csvCell(planRows[0], 'Source URL')}` : null,
        status: 'active',
      };
      if (!aid) {
        aid = await medicalAidsApi.create({
          ...aidPayload,
          code: uniqueCode(schemeShortCode(scheme), usedCodes),
        });
        byName.set(scheme.toLowerCase(), aid);
        imported += 1;
      } else {
        await medicalAidsApi.update(aid.id, aidPayload);
      }
    } catch (err) {
      errors.push(`${scheme}: ${err.message}`);
      continue;
    }

    const existingPlans = await listAll(medicalAidPlansApi.list, { medicalAidId: aid.id });
    const planByName = new Map(existingPlans.map((row) => [String(row.name || '').trim().toLowerCase(), row]));

    for (const row of planRows) {
      const planName = csvCell(row, 'Plan');
      const payload = planPayload(aid.id, row);
      try {
        const current = planByName.get(planName.toLowerCase());
        if (current) await medicalAidPlansApi.update(current.id, payload);
        else {
          const saved = await medicalAidPlansApi.create(payload);
          planByName.set(planName.toLowerCase(), saved);
        }
        imported += 1;
      } catch (err) {
        errors.push(`${scheme} / ${planName}: ${err.message}`);
      }
    }
  }

  return { imported, skipped, errors };
}
