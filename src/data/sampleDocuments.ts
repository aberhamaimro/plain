export interface SampleDocument {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  sampleText: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'medical-bill',
    title: 'Hospital Emergency Bill',
    category: 'Medical',
    badge: 'Surprise Charges',
    description: 'Post-ER visit bill containing out-of-network facility charges and unbundled laboratory fees.',
    sampleText: `METROPOLITAN GENERAL HOSPITAL
STATEMENT OF ACCOUNT / FINAL NOTICE PRIOR TO COLLECTIONS
Patient Name: Jane Doe
Account Number: 8492-3921-9941
Date of Service: August 14, 2026
Billing Date: October 01, 2026
PAYMENT DUE DATE: November 01, 2026

SUMMARY OF CHARGES:
1. Emergency Dept Level 4 Exam (CPT 99284): $1,420.00
2. Facility & Trauma Activation Fee: $2,850.00
3. Out-of-Network Emergency Physician Surcharge: $890.00
4. Blood Chemistry Panel (Unbundled): $340.00
5. Pharmacy Dispensing / IV Saline (1 Liter): $265.00

TOTAL CHARGES: $5,765.00
INSURANCE ADJUSTMENTS / PAYMENTS: -$3,922.50
PATIENT RESPONSIBILITY (AMOUNT DUE NOW): $1,842.50

IMPORTANT NOTICE:
Under the terms of admission, patient is personally responsible for any balance remaining after primary insurance adjudication. If balance of $1,842.50 is not satisfied within thirty (30) days of this statement, account will immediately be transferred to Credit Control Bureau with statutory interest of 1.5% per month and negative reporting to major consumer credit reporting agencies.

To dispute any line item, you must submit a written appeal via certified mail within 14 calendar days.`,
  },
  {
    id: 'lease-renewal',
    title: 'Apartment Lease Renewal',
    category: 'Housing',
    badge: 'Auto-Renewal Trap',
    description: 'Standard residential lease agreement clause with automatic renewal, 60-day notice, and penalty forfeiture.',
    sampleText: `RESIDENTIAL APARTMENT LEASE AGREEMENT
Landlord: Highline Metro Properties LLC
Tenant: Alex Rivera
Premises: Apt 4B, 742 Evergreen Terrace, Unit 4B
Current Lease Expiration Date: December 31, 2026
Monthly Base Rent: $2,150.00 (Proposed Renewal: $2,380.00 / mo)

SECTION 18. AUTOMATIC RENEWAL & NOTICE TO VACATE:
Tenant agrees that unless Tenant provides formal written notice via certified USPS mail to Landlord at least sixty (60) days prior to the expiration date (Notice Deadline: November 1, 2026), this Agreement shall automatically renew for an additional consecutive twelve (12) month term at the increased monthly rate of $2,380.00 plus a mandatory $120.00 monthly Community Tech & Trash Amenity Fee.

SECTION 19. LIQUIDATED DAMAGES & FORFEITURE:
If Tenant vacates the premises prior to the expiration of the renewed term, or fails to satisfy the 60-day written notice requirement, Tenant shall forfeit the full security deposit of $2,150.00 and shall remain liable for an Early Termination Liquidated Damages Fee equal to two (2) full months' gross rent ($4,760.00) plus re-letting costs.

SECTION 27. BINDING ARBITRATION & CLASS ACTION WAIVER:
Tenant knowingly waives any right to jury trial or participation in representative class actions for maintenance defaults, deposit withholdings, or habitability claims.`,
  },
  {
    id: 'debt-notice',
    title: 'Debt Collection Notice',
    category: 'Collections',
    badge: '30-Day Window',
    description: 'Collection agency notice threatening credit reporting and legal referral if not validated in 30 days.',
    sampleText: `PINNACLE ASSET RECOVERY & REVENUE MANAGEMENT SERVICES
PO Box 9821, Suite 400
DATE OF NOTICE: October 10, 2026
RE: Delinquent Debt Assignment
Creditor: Apex Broadband & Wireless Communications
Original Account: 0092-4820-1172
Consumer Reference: PAR-7729104

TOTAL BALANCE DUE: $648.20
(Principal: $412.00 | Collection Recovery Fee: $185.00 | Accrued Interest: $51.20)

DEMAND FOR SATISFACTION:
Your delinquent account with Apex Wireless has been purchased and formally assigned to Pinnacle Asset Recovery for immediate recovery. Unless you dispute the validity of this debt, or any portion thereof, within thirty (30) days after receipt of this notice (Deadline: November 12, 2026), this debt will be assumed to be valid by Pinnacle Asset Recovery.

CONSEQUENCES OF NON-PAYMENT:
If you do not remit payment of $648.20 or establish a pre-approved settlement plan by the stated deadline, we will initiate formal derogatory reporting to Equifax, Experian, and TransUnion, which may impair your credit score for up to seven (7) years. We may also recommend referral to our regional legal counsel for judicial recovery including wage attachment where permitted by law.

CONSUMER RIGHTS DISPUTE:
If you notify us in writing within the 30-day period that the debt is disputed, we will obtain verification of the debt or a copy of a judgment and mail it to you.`,
  },
  {
    id: 'job-offer',
    title: 'Employment Offer Letter',
    category: 'Employment',
    badge: 'Clawback Clauses',
    description: 'Offer letter with non-compete restrictions, relocation bonus clawback, and mandatory arbitration.',
    sampleText: `STRATA LOGIC DYNAMICS INC.
CONFIDENTIAL OFFER OF EMPLOYMENT
Candidate: Marcus Vance
Date: October 14, 2026
Position: Senior Systems Coordinator
Base Salary: $115,000.00 annually (Bi-weekly exempt)
Sign-on & Relocation Advance: $12,500.00
Target Start Date: November 17, 2026
OFFER EXPIRATION: October 22, 2026 at 5:00 PM EST

CONTINGENCIES AND TERMS:
1. At-Will Employment: Employment with the Company is for no specified period and constitutes at-will employment, terminable by either party at any time with or without cause or notice.
2. Sign-On & Relocation Clawback: In the event you voluntarily resign or are terminated for cause within twenty-four (24) months of your start date, you agree to immediately repay 100% of the $12,500 advance within thirty (30) days of separation, and authorize deduction of this amount from your final paycheck.
3. Non-Competition & Restrictive Covenants: For a period of twelve (12) months following separation, you shall not directly or indirectly provide consulting, engineering, or sales services to any entity operating in the cloud infrastructure domain within a 150-mile radius of any Company office.
4. Mandatory Dispute Resolution: All claims arising from your employment or separation must be submitted to confidential individual binding arbitration in Delaware.`,
  },
];
