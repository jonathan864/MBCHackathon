import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://swcajkmuryuxphhaskpe.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Y2Fqa211cnl1eHBoaGFza3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODE3MzIsImV4cCI6MjA4MDI1NzczMn0.OMSO5cS5RPXEgs9ALW3A0ga3gZbY26Opm7qYCopUXjU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("Seeding default policies...");

  const defaultPolicies = [
    {
      name: "Conservative Trading Policy",
      rules: [
        { type: "maxSize", max: 50 },
        { type: "perMarketCap", max: 30 },
        {
          type: "whitelistMarkets",
          allowedIds: ["election-2024", "btc-price", "eth-price"],
        },
      ],
    },
    {
      name: "Aggressive Trading Policy",
      rules: [
        { type: "maxSize", max: 200 },
        { type: "perMarketCap", max: 100 },
      ],
    },
    {
      name: "Market Restricted Policy",
      rules: [
        { type: "maxSize", max: 75 },
        {
          type: "whitelistMarkets",
          allowedIds: ["election-2024", "sports-final"],
        },
      ],
    },
  ];

  for (const policy of defaultPolicies) {
    const { data, error } = await supabase
      .from("policies")
      .insert(policy)
      .select()
      .single();

    if (error) {
      console.error(`Failed to create policy "${policy.name}":`, error.message);
    } else {
      console.log(`Created policy: ${data.name} (ID: ${data.id})`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
