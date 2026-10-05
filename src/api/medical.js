import { http } from './client';
import { createResource, endpoint } from './resource';

export const medicalAidsApi = createResource('/medical-aids', 'medicalAids');
export const medicalAidPlansApi = createResource('/medical-aid-plans', 'medicalAidPlans');

export const icdCodesApi = {
  ...createResource('/icd-codes', 'icdCodes'),
  /** POST /icd-codes/import (multipart: file) -> { imported, skipped, errors } */
  import: endpoint('icdCodes.import', (formData) => http.post('/icd-codes/import', formData)),
};

export const procedureCodesApi = createResource('/procedure-codes', 'procedureCodes');

export const claimsApi = {
  ...createResource('/claims', 'claims'),
  /** PATCH /claims/:id/status { status, comment } */
  updateStatus: endpoint('claims.updateStatus', (id, payload) => http.patch(`/claims/${id}/status`, payload)),
};
