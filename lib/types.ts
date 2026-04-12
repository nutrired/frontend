// frontend/lib/types.ts

export interface NutritionistProfile {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string;
  city: string;
  years_exp: number | null;
  specialties: string[];
  languages: string[];
  certifications: string[];
  status: 'draft' | 'published';
  tier: string;
  stripe_connect_account_id: string;
  intro_consultation_required: boolean;
  created_at: string;
  updated_at: string;
  packages: ServicePackage[];
}

export interface ServicePackage {
  id: string;
  profile_id: string;
  name: string;
  description: string;
  price_cents: number;
  sessions: number;
  billing_type: 'one_time' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface ProfileSummary {
  id: string;
  slug: string;
  display_name: string;
  city: string;
  years_exp: number | null;
  specialties: string[];
  languages: string[];
  lowest_price_cents: number | null;
}

export interface ProfileListResponse {
  profiles: ProfileSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  city: string;
  birth_date: string | null;       // "YYYY-MM-DD" or null
  height_cm: number | null;
  activity_level: string;          // "" | "sedentary" | "lightly_active" | "moderately_active" | "very_active"
  goals: string[];
  dietary_restrictions: string[];
  allergies: string[];
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight_kg: number;
  recorded_at: string;  // "YYYY-MM-DD"
  created_at: string;
}

export interface ActivityEntry {
  id: string;
  user_id: string;
  activity_type: string;
  duration_minutes: number;
  recorded_at: string;  // "YYYY-MM-DD"
  created_at: string;
}

export interface Relationship {
  id: string;
  client_id: string;
  nutritionist_id: string;
  package_id: string;
  status: 'pending_payment' | 'pending_intro' | 'active' | 'cancelled';
  billing_type: 'one_time' | 'monthly';
  stripe_session_id: string;
  stripe_payment_intent_id: string;
  stripe_subscription_id: string;
  amount_cents: number;
  commission_cents: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RefundRequest {
  id: string;
  relationship_id: string;
  client_id: string;
  reason: string;
  status: 'pending' | 'auto_approved' | 'approved' | 'rejected';
  created_at: string;
  resolved_at: string | null;
}

export interface EarningsSummary {
  total_earned_cents: number;
  total_commission_cents: number;
  active_client_count: number;
  relationships: Relationship[];
}
