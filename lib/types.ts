// frontend/lib/types.ts

export interface NutritionistProfile {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string;
  city: string;
  consultation_type: 'in_person' | 'online' | 'both';
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
  avatar_url: string | null;
  default_survey_template_id: string | null;
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
  avatar_url: string | null;
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
  gender: string | null;
  bmi: number | null;
  bmi_category: 'underweight' | 'normal' | 'overweight' | 'obese' | null;
  activity_level: string;
  goals: string[];
  dietary_restrictions: string[];
  allergies: string[];
  avatar_url: string | null;
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
  status: 'pending_intro' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ClientRelationshipView {
  id: string;
  client_id: string;
  nutritionist_id: string;
  package_id: string;
  status: 'pending_intro' | 'active' | 'completed' | 'cancelled';
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
  status: 'pending_intro' | 'active' | 'completed' | 'cancelled';
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
export type DayType = 'strength' | 'cardio' | 'rest';
export type SupplementTiming =
  | 'morning'
  | 'with_breakfast'
  | 'pre_workout'
  | 'post_workout'
  | 'with_lunch'
  | 'afternoon'
  | 'with_dinner'
  | 'before_bed';

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

export interface NutritionPlanSupplement {
  id: string;
  plan_id: string;
  name: string;
  brand: string | null;
  dosage: string;
  timing: SupplementTiming;
  linked_meal_id: string | null;
  notes: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
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
  include_supplements: boolean;
  supplements: NutritionPlanSupplement[];
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

export interface CardioActivity {
  id: string;
  plan_day_id: string;
  name: string;
  duration_minutes: number | null;
  distance_km: number | null;
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
  day_type: DayType;
  blocks: WorkoutBlock[];
  activities: CardioActivity[];
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
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  bmi: number | null;
  bmi_category: 'underweight' | 'normal' | 'overweight' | 'obese' | null;
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
  status: 'active' | 'pending_intro' | 'completed' | 'cancelled';
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

export interface EnhancedClient {
  relationship_id: string;
  client_id: string;
  client_display_name: string;
  client_email: string;
  client_goal: string;
  client_avatar_url: string | null;
  status: 'pending_intro' | 'active' | 'completed' | 'cancelled';
  package_id: string;
  package_name: string;
  package_price_cents: number;
  package_billing_type: 'one_time' | 'monthly';
  active_nutrition_plans_count: number;
  active_exercise_plans_count: number;
  completed_at: string | null;
  completion_notes: string;
  created_at: string;
}

export interface QuickStats {
  mrr_cents: number;
  active_clients_count: number;
  pending_intros_count: number;
  one_time_revenue_this_month_cents: number;
}

// ─── Exercise Templates ───────────────────────────────────────────────────────

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'balance';

export interface ExerciseTemplate {
  id: string;
  nutritionist_id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscle_groups: string;
  equipment: string;
  instructions: string;
  demo_video_url: string | null;
  photos: ExerciseTemplatePhoto[];
  created_at: string;
  updated_at: string;
}

export interface ExerciseTemplatePhoto {
  id: string;
  template_id: string;
  photo_url: string;
  is_primary: boolean;
  display_order: number;
  uploaded_at: string;
}

// ─── Appointments & Availability ──────────────────────────────────────────

export interface AppointmentType {
  id: string;
  nutritionist_id: string;
  name: string;
  duration_minutes: number;
  description: string;
  video_link: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityRule {
  id: string;
  nutritionist_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // Time only, e.g., "09:00:00"
  end_time: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  relationship_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  series_id?: string;
  appointment_type: {
    id: string;
    name: string;
    duration_minutes: number;
    description: string;
    video_link: string;
  };
  client_id: string;
  client_name: string;
  client_email: string;
  nutritionist_id: string;
  nutritionist_name: string;
  nutritionist_email: string;
}

export interface RecurrencePattern {
  id: string;
  series_id: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  interval: number;
  end_type: 'after_count' | 'on_date' | 'never';
  end_after_count?: number;
  end_date?: string;
  created_at: string;
}

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  reminder_type: '24h' | '1h';
  scheduled_for: string;
  sent_at?: string;
  created_at: string;
}

export interface RecurringSeriesDetails {
  pattern: RecurrencePattern;
  appointments: Appointment[];
}

export interface UpcomingAppointment {
  id: string;
  nutritionist_id: string;
  nutritionist_name: string;
  appointment_type: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  status: string;
  can_cancel: boolean;
  hours_until: number;
}

export interface CreateRecurringAppointmentRequest {
  relationship_id: string;
  appointment_type_id: string;
  start_time: string; // ISO 8601
  notes?: string;
  recurrence: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    interval: number;
    end_type: 'after_count' | 'on_date' | 'never';
    end_after_count?: number;
    end_date?: string; // YYYY-MM-DD
  };
}

export interface CreateRecurringAppointmentResponse {
  series_id: string;
  appointments_created: number;
  first_start_time: string;
  last_start_time: string;
}

// ─── Surveys ─────────────────────────────────────────────────────────────────

export type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'numeric_scale' | 'file_upload';

export type SurveyAssignmentStatus = 'pending' | 'completed' | 'reviewed';

export interface SurveyTemplateListItem {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  question_count: number;
  assigned_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateQuestion {
  question_text: string;
  question_type: QuestionType;
  options: unknown; // multiple_choice: string[], numeric_scale: { min: number; max: number; label: string }
  is_required: boolean;
  display_order: number;
}

export interface SurveyTemplateDetail {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  questions: TemplateQuestion[];
  created_at: string;
  updated_at: string;
}

export interface QuestionWithResponse {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: unknown;
  is_required: boolean;
  display_order: number;
  answer_text: string | null;
  answer_numeric: number | null;
  answer_file_url: string | null;
}

export interface SurveyAssignmentDetail {
  assignment_id: string;
  relationship_id: string;
  template_id: string;
  status: SurveyAssignmentStatus;
  assigned_at: string;
  completed_at: string | null;
  reviewed_at: string | null;
  responses: QuestionWithResponse[];
}

// Chat types
export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar_url?: string;
  message_text?: string;
  attachment_url?: string;
  attachment_filename?: string;
  attachment_size_bytes?: number;
  attachment_content_type?: string;
  created_at: string;
}

export interface Conversation {
  relationship_id: string;
  other_user_id: string;
  other_user_name: string;
  other_avatar_url?: string;
  last_message_text?: string;
  last_message_at?: string;
  last_sender_id?: string;
  unread_count: number;
}

export interface UploadAttachmentResponse {
  url: string;
  filename: string;
  size_bytes: number;
  content_type: string;
}
