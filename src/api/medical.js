import { http } from './client';
import { createResource, endpoint } from './resource';

export const medicalAidsApi = {
  ...createResource('/medical-aids'),
  /** POST /medical-aids/import (multipart: file) — Hearing Aid Labs scheme/plan CSV. */
  import: endpoint((formData) => http.post('/medical-aids/import', formData)),
};
export const medicalAidPlansApi = createResource('/medical-aid-plans');

export const icdCodesApi = {
  ...createResource('/icd-codes'),
  /** POST /icd-codes/import (multipart: file) -> { imported, skipped, errors } */
  import: endpoint((formData) => http.post('/icd-codes/import', formData)),
};

export const procedureCodesApi = {
  ...createResource('/procedure-codes'),
  /** POST /procedure-codes/import (multipart: file) — Hearing Aid Labs 082/083 CSV. */
  import: endpoint((formData) => http.post('/procedure-codes/import', formData)),
};

export const claimsApi = {
  ...createResource('/claims'),
  /** PATCH /claims/:id/status { status, comment } */
  updateStatus: endpoint((id, payload) => http.patch(`/claims/${id}/status`, payload)),
};
