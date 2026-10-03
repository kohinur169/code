import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Complete SQL Schema for Supabase PostgreSQL
export const SUPABASE_SQL_SCHEMA = `
-- ====================================================================
-- ভূমিসেবা সহায়তা কেন্দ্র (LSFC) - পূর্ণাঙ্গ ডাটাবেজ স্কিমা ও RLS পলিসি
-- ====================================================================

-- ১. Business / Tenant Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    lsfc_name VARCHAR(255) NOT NULL,
    license_no VARCHAR(100) NOT NULL,
    license_issue_date DATE,
    license_expiry_date DATE,
    division VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    upazila VARCHAR(100) NOT NULL,
    address_details TEXT,
    incharge_name VARCHAR(255) NOT NULL,
    incharge_designation VARCHAR(100) DEFAULT 'কেন্দ্র ইনচার্জ',
    mobile VARCHAR(20) NOT NULL,
    ac_land_office VARCHAR(255),
    ministry_memo_ref TEXT,
    signature_url TEXT,
    logo_url TEXT,
    tier VARCHAR(50) DEFAULT 'union_upazila',
    auto_receipt_seq INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Business
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view their own business" ON public.businesses
    FOR ALL USING (id = auth.uid());

-- ২. Services Catalog (পরিশিষ্ট-৭ অনুযায়ী ৩-স্তরীয় ফি)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    fee_union NUMERIC(10, 2) NOT NULL,
    fee_municipality NUMERIC(10, 2) NOT NULL,
    fee_city_corp NUMERIC(10, 2) NOT NULL,
    govt_fee NUMERIC(10, 2) DEFAULT 0,
    per_page_scan_fee NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৩. Customers / Citizens (নাগরিক রেকর্ড - কোনো লগইন একাউন্ট নেই)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    nid_masked VARCHAR(50),
    nid_encrypted TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৪. Receipts (৮.২৭" × ৩.৮৯" রিসিট রেকর্ড - অপরিবর্তনীয়)
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    receipt_no VARCHAR(100) UNIQUE NOT NULL,
    verification_token VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(20),
    service_name VARCHAR(255) NOT NULL,
    service_fee NUMERIC(10, 2) NOT NULL,
    govt_fee NUMERIC(10, 2) DEFAULT 0,
    scanned_pages INT DEFAULT 0,
    extra_scan_fee NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(50) DEFAULT 'valid', -- 'valid', 'voided', 'refunded'
    void_reason TEXT,
    drive_pdf_id VARCHAR(255),
    drive_pdf_url TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৫. Govt Statements (হুবহু statment .jpg অনুযায়ী সংরক্ষিত ডাটা)
CREATE TABLE IF NOT EXISTS public.govt_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    statement_no VARCHAR(100) UNIQUE NOT NULL,
    memo_no VARCHAR(100) NOT NULL,
    statement_date DATE NOT NULL,
    period_type VARCHAR(50) NOT NULL,
    period_label VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_applications INT NOT NULL,
    breakdown_json JSONB NOT NULL,
    custom_remarks TEXT,
    status VARCHAR(50) DEFAULT 'finalized',
    drive_pdf_id VARCHAR(255),
    drive_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৬. Immutable Audit Logs (সম্পূর্ণ ডিজিটাল নিরীক্ষা রেকর্ড)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(50),
    device TEXT,
    before_data JSONB,
    after_data JSONB
);

-- ৭. Day End Cash Closing (দৈনিক ক্যাশ ক্লোজিং)
CREATE TABLE IF NOT EXISTS public.cash_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    opening_cash NUMERIC(10, 2) DEFAULT 0,
    cash_collections NUMERIC(10, 2) DEFAULT 0,
    digital_collections NUMERIC(10, 2) DEFAULT 0,
    cash_expenses NUMERIC(10, 2) DEFAULT 0,
    refunds NUMERIC(10, 2) DEFAULT 0,
    expected_cash NUMERIC(10, 2) NOT NULL,
    actual_cash NUMERIC(10, 2) NOT NULL,
    difference NUMERIC(10, 2) DEFAULT 0,
    closed_by VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
`;
