import { createClient } from '@supabase/supabase-js';

// Supabase-URL und Anon-Key aus deinem Supabase-Projekt kopieren
const supabaseUrl = 'https://kfxdfjivdcsdmfvismpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeGRmaml2ZGNzZG1mdmlzbXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5OTQzMjUsImV4cCI6MjA0MTU3MDMyNX0.PUbH05aV-rKaonE-T0a1Rgf1XMIfoS7fAGyrcHmZMzM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
