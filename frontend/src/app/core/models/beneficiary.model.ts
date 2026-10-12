export interface Beneficiary {
  id: string;
  ownerId: string;
  displayName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  bankName: string;
  routingCode: string;
  currency: string;
  verified: boolean;
  coolingOffUntil?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBeneficiaryRequest {
  displayName: string;
  accountNumber: string;
  bankName: string;
  routingCode?: string;
  currency?: string;
}
