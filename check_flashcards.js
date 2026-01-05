
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking flashcard_decks...');
    const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*');

    if (error) {
        console.error('Error fetching decks:', error);
    } else {
        console.log('Found decks:', data?.length);
        console.log(data);
    }
}

checkData();

