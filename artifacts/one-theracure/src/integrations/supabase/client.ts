// Supabase stub — replaced with Replit-native auth and database.
// The only active Supabase call (patients insert) now falls through to the
// local-patient fallback that was already in PatientRegistrationModal.tsx.

const noop = () => Promise.resolve({ data: null, error: null });

const authStub = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  signInWithPassword: noop,
  signUp: noop,
  signOut: noop,
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
};

const fromStub = (_table: string) => ({
  select: () => ({ data: [], error: null }),
  insert: () => Promise.resolve({ data: null, error: new Error("Database not configured") }),
  update: () => Promise.resolve({ data: null, error: new Error("Database not configured") }),
  delete: () => Promise.resolve({ data: null, error: new Error("Database not configured") }),
  eq: function(this: any) { return this; },
  single: function(this: any) { return Promise.resolve({ data: null, error: new Error("Database not configured") }); },
});

// @ts-ignore — intentional stub
export const supabase = {
  auth: authStub,
  from: fromStub,
};
