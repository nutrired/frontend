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
  tier: 'free' | 'pro' | 'premium';
  stripe_subscription_id: string;
  intro_consultation_required: boolean;
  accepting_new_clients: boolean;
  at_capacity: boolean;
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
  accepting_new_clients: boolean;
  at_capacity: boolean;
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
  birth_date: string | null;
  height_cm: number | null;
  activity_level: string;
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
  recorded_at: string;
  created_at: string;
}

export interface ActivityEntry {
  id: string;
  user_id: string;
  activity_type: string;
  duration_minutes: number;
  recorded_at: string;
  created_at: string;
}

export interface Relationship {
  id: string;
  client_id: string;
  nutritionist_id: string;
  package_id: string;
  status: 'pending_intro' | 'active' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ClientRelationshipView {
  id: string;
  client_id: string;
  nutritionist_id: string;
  package_id: string;
  status: 'pending_intro' | 'active' | 'cancelled';
  client_display_name: string;
  client_email: string;
  created_at: string;
  updated_at: string;
}

export interface NutritionistRelationshipView {
  id: string;
  client_id: string;
  nutritionist_id: string;
  package_id: string;
  status: 'pending_intro' | 'active' | 'cancelled';
  nutritionist_display_name: string;
  nutritionist_slug: string;
  nutritionist_bio: string;
  nutritionist_city: string;
  nutritionist_specialties: string[];
  nutritionist_years_exp: number | null;
  nutritionist_tier: 'free' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntryView {
  id: string;
  client_id: string;
  client_display_name: string;
  created_at: string;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export type PlanStatus = 'draft' | 'active' | 'archived';
export type PlanStyle = 'structured' | 'flexible';
export type MealType = 'breakfast' | 'mid_morning' | 'lunch' | 'snack' | 'dinner';

export interface MealOption {
  id: string;
  meal_id: string;
  name: string;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  display_order: number;
}

export interface SlotOption {
  id: string;
  slot_id: string;
  name: string;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  display_order: number;
}

export interface NutritionPlanSlot {
  id: string;
  plan_id: string;
  meal_type: MealType;
  display_order: number;
  options: SlotOption[];
}

export interface Meal {
  id: string;
  plan_day_id: string;
  name: string;
  meal_type: MealType;
  display_order: number;
  options: MealOption[];
}

export interface NutritionPlanDay {
  id: string;
  plan_id: string;
  day_number: number;
  label: string;
  notes: string;
  meals: Meal[];
}

export interface NutritionPlan {
  id: string;
  nutritionist_id: string;
  client_id: string;
  title: string;
  notes: string;
  plan_style: PlanStyle;
  status: PlanStatus;
  days: NutritionPlanDay[];
  slots: NutritionPlanSlot[];
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  block_id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  rest_seconds: number | null;
  notes: string;
  display_order: number;
}

export interface WorkoutBlock {
  id: string;
  plan_day_id: string;
  name: string;
  display_order: number;
  exercises: Exercise[];
}

export interface ExercisePlanDay {
  id: string;
  plan_id: string;
  day_number: number;
  label: string;
  notes: string;
  blocks: WorkoutBlock[];
}

export interface ExercisePlan {
  id: string;
  nutritionist_id: string;
  client_id: string;
  title: string;
  notes: string;
  status: PlanStatus;
  days: ExercisePlanDay[];
  created_at: string;
  updated_at: string;
}

export interface ClientProfileSummary {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  city: string;
  birth_date: string | null;
  height_cm: number | null;
  activity_level: string;
  goals: string[];
  dietary_restrictions: string[];
  allergies: string[];
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  amount: number;
  unit: string;
  ingredient_name: string;
  display_order: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface RecipePhoto {
  id: string;
  recipe_id: string;
  photo_url: string;
  is_primary: boolean;
  display_order: number;
  uploaded_at: string;
}

export interface Recipe {
  id: string;
  nutritionist_id: string;
  name: string;
  description: string;
  category: RecipeCategory;
  base_servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  calories_per_serving: number | null;
  protein_g_per_serving: number | null;
  carbs_g_per_serving: number | null;
  fat_g_per_serving: number | null;
  ingredients: RecipeIngredient[];
  tags: Tag[];
  photos: RecipePhoto[];
  created_at: string;
  updated_at: string;
}

// ─── Business Dashboard ───────────────────────────────────────────────────────

export interface PackageRevenue {
  package_name: string;
  price_cents: number;
  client_count: number;
  billing_cycle: 'monthly' | 'one_time';
}

export interface RevenueByType {
  total_cents: number;
  client_count: number;
  packages: PackageRevenue[];
}

export interface ContractItem {
  client_name: string;
  package_name: string;
  price_cents: number;
  billing_cycle: 'monthly' | 'one_time';
  starts_at: string;
  status: 'active' | 'pending_intro' | 'cancelled';
}

export interface BusinessDashboardData {
  mrr_cents: number;
  mrr_client_count: number;
  one_time_revenue_this_month_cents: number;
  one_time_client_count: number;
  total_active_contracts: number;
  avg_contract_value_cents: number;
  revenue_monthly: RevenueByType;
  revenue_one_time: RevenueByType;
  contracts: ContractItem[];
  nutritionist_tier: 'free' | 'pro' | 'premium';
  tier_cost_cents: number;
  tier_capacity: number;
  active_clients_count: number;
}
