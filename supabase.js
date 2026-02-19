import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con tu URL de Supabase
const supabaseUrl = 'https://snsikvvgleilxqqutjlz.supabase.co';

// Reemplaza esto con tu llave Anon de Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuc2lrdnZnbGVpbHhxcXV0amx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTI3MTcsImV4cCI6MjA4Njk4ODcxN30.QIu9o_WZ0VJIoaoApdhR0duSph8WGezHf2tNMt4OKd8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});