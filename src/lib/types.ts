export type ProjectType = 'House' | 'Apartment' | 'Shop' | 'Office' | 'Villa' | 'Factory';
export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type InvoiceStatus = 'unpaid' | 'paid' | 'partial' | 'overdue';
export type PaymentStatus = 'pending' | 'paid' | 'partial';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank' | 'Cheque';
export type Unit = 'Nos' | 'Coil' | 'Meter' | 'Feet' | 'Box' | 'Piece' | 'Set';

export type ProductCategory =
  | 'Switches'
  | 'Sockets'
  | 'Wires'
  | 'Conduit'
  | 'MCB & DB'
  | 'Lights'
  | 'Fans'
  | 'Earthing'
  | 'Labour'
  | 'Accessories'
  | 'Other';

export const CATEGORIES: ProductCategory[] = [
  'Switches',
  'Sockets',
  'Wires',
  'Conduit',
  'MCB & DB',
  'Lights',
  'Fans',
  'Earthing',
  'Labour',
  'Accessories',
  'Other',
];

export const UNITS: Unit[] = ['Nos', 'Coil', 'Meter', 'Feet', 'Box', 'Piece', 'Set'];

export const PROJECT_TYPES: ProjectType[] = ['House', 'Apartment', 'Shop', 'Office', 'Villa', 'Factory'];

export interface Profile {
  id: string;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  city: string | null;
  logo_url: string | null;
  gst_number: string | null;
  upi_id: string | null;
  address: string | null;
  theme: string | null;
  language: string | null;
  notifications: boolean | null;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  project_name: string | null;
  project_type: string | null;
  site_address: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  unit: string;
  default_price: number;
  is_custom: boolean;
}

export interface EstimateItem {
  id: string;
  estimate_id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface Estimate {
  id: string;
  user_id: string;
  customer_id: string | null;
  estimate_number: string;
  estimate_date: string;
  status: EstimateStatus;
  subtotal: number;
  discount: number;
  gst: number;
  labour: number;
  transport: number;
  grand_total: number;
  advance: number;
  balance: number;
  notes: string | null;
  terms: string | null;
  created_at: string;
  customer?: Customer | null;
  estimate_items?: EstimateItem[];
}

export interface Invoice {
  id: string;
  user_id: string;
  estimate_id: string | null;
  customer_id: string | null;
  invoice_number: string;
  invoice_date: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  gst: number;
  labour: number;
  transport: number;
  grand_total: number;
  advance: number;
  balance: number;
  notes: string | null;
  terms: string | null;
  created_at: string;
  customer?: Customer | null;
}

export interface Payment {
  id: string;
  user_id: string;
  invoice_id: string | null;
  customer_id: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_date: string;
  notes: string | null;
  created_at: string;
  customer?: Customer | null;
  invoice?: Invoice | null;
}
