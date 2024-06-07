import { createClient } from '@supabase/supabase-js';

let supabase;

export function getSupabaseClient() {
    if (!supabase) {
        supabase = createClient('https://upkigeauanwefsngyhqb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa2lnZWF1YW53ZWZzbmd5aHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMjQxOTQsImV4cCI6MjAzMTgwMDE5NH0.s60GCwAeFC5zdmGKiJ0oxm7WXf2gcsCUWkUhEguUlvM');
    }
    return supabase;
}
