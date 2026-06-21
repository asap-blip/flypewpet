import type {
  Airline,
  AirlineRule,
  CabinType,
  Carrier,
  Merchant,
  MerchantProduct,
  ProductCode,
} from "./types";

// ---------------------------------------------------------------------------
// Canonical seed data. This is the single source of truth for development and
// for the static (no-database) data layer. `scripts/generate-sql-seed.ts`
// renders this same data into supabase/seed.sql so the two never drift.
//
// IMPORTANT: airline rule values below reflect publicly documented patterns at
// the time of seeding and are illustrative. They MUST be re-verified against
// each airline's live policy before being relied on. `sourceUrl` and
// `lastVerifiedAt` are populated so staleness is visible in the UI.
// ---------------------------------------------------------------------------

const inch = (n: number) => Number((n * 2.54).toFixed(1));
const lb = (n: number) => Number((n * 0.453592).toFixed(2));

const CABIN_LABELS: Record<CabinType, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First Class",
};

function cabinSlug(cabin: CabinType): string {
  return cabin.replace("_", "-");
}

function cabinBaseId(ruleId: string): string {
  return ruleId
    .replace(/-economy$/, "")
    .replace(/-cargo-only$/, "")
    .replace(/-no-pets$/, "");
}

function cloneEconomyRule(
  base: AirlineRule,
  cabin: CabinType,
  patch: Partial<AirlineRule> & { unverified?: boolean } = {},
): AirlineRule {
  const unverified = patch.unverified ?? true;
  const cabinLabel = CABIN_LABELS[cabin];
  const baseNotes = base.notes ?? "Airline in-cabin pet rule.";
  const fallbackNotes = unverified
    ? `${baseNotes} Unverified cabin-specific fallback: no separate ${cabinLabel.toLowerCase()} in-cabin carrier rule found; copied from Economy as a conservative stand-in.`
    : baseNotes;

  return {
    ...base,
    id: patch.id ?? `${cabinBaseId(base.id)}-${cabinSlug(cabin)}`,
    cabin,
    aircraftType: patch.aircraftType === undefined ? base.aircraftType : patch.aircraftType,
    maxLengthCm: patch.maxLengthCm === undefined ? base.maxLengthCm : patch.maxLengthCm,
    maxWidthCm: patch.maxWidthCm === undefined ? base.maxWidthCm : patch.maxWidthCm,
    maxHeightCm: patch.maxHeightCm === undefined ? base.maxHeightCm : patch.maxHeightCm,
    maxCombinedWeightKg: patch.maxCombinedWeightKg === undefined ? base.maxCombinedWeightKg : patch.maxCombinedWeightKg,
    softSidedRequirement: patch.softSidedRequirement === undefined ? base.softSidedRequirement : patch.softSidedRequirement,
    aircraftVaries: patch.aircraftVaries === undefined ? base.aircraftVaries : patch.aircraftVaries,
    notes: patch.notes === undefined ? fallbackNotes : patch.notes,
    sourceUrl: patch.sourceUrl === undefined ? base.sourceUrl : patch.sourceUrl,
    sourceLabel: patch.sourceLabel === undefined ? `${base.sourceLabel} (${cabinLabel} fallback)` : patch.sourceLabel,
    sourceType: patch.sourceType === undefined ? base.sourceType : patch.sourceType,
    lastVerifiedAt: patch.lastVerifiedAt === undefined ? base.lastVerifiedAt : patch.lastVerifiedAt,
  };
}

function cloneEconomyRules(
  baseRules: AirlineRule[],
  skip: Record<string, CabinType[]> = {},
): AirlineRule[] {
  const cabins: CabinType[] = ["premium_economy", "business", "first"];
  return baseRules.flatMap((rule) =>
    cabins
      .filter((cabin) => !skip[rule.id]?.includes(cabin))
      .map((cabin) => cloneEconomyRule(rule, cabin)),
  );
}

export const airlines: Airline[] = [
  { id: "air-canada", name: "Air Canada", iata: "AC", country: "CA" },
  { id: "delta", name: "Delta Air Lines", iata: "DL", country: "US" },
  { id: "united", name: "United Airlines", iata: "UA", country: "US" },
  { id: "american", name: "American Airlines", iata: "AA", country: "US" },
  { id: "southwest", name: "Southwest Airlines", iata: "WN", country: "US" },
  { id: "jetblue", name: "JetBlue Airways", iata: "B6", country: "US" },
  { id: "alaska", name: "Alaska Airlines", iata: "AS", country: "US" },
  { id: "lufthansa", name: "Lufthansa", iata: "LH", country: "DE" },
  { id: "porter", name: "Porter Airlines", iata: "PD", country: "CA" },
  { id: "westjet", name: "WestJet", iata: "WS", country: "CA" },
  { id: "air-transat", name: "Air Transat", iata: "TS", country: "CA" },
  { id: "flair", name: "Flair Airlines", iata: "F8", country: "CA" },
  { id: "klm", name: "KLM Royal Dutch Airlines", iata: "KL", country: "NL" },
  { id: "air-france", name: "Air France", iata: "AF", country: "FR" },
  { id: "frontier", name: "Frontier Airlines", iata: "F9", country: "US" },
  { id: "spirit", name: "Spirit Airlines", iata: "NK", country: "US" },
  { id: "avelo", name: "Avelo Airlines", iata: "XP", country: "US" },
  { id: "british-airways", name: "British Airways", iata: "BA", country: "GB" },
  { id: "allegiant", name: "Allegiant Air", iata: "G4", country: "US" },
  { id: "hawaiian", name: "Hawaiian Airlines", iata: "HA", country: "US" },
  { id: "emirates", name: "Emirates", iata: "EK", country: "AE" },
  { id: "ryanair", name: "Ryanair", iata: "FR", country: "IE" },
];

const economyRules: AirlineRule[] = [
  {
    id: "air-canada-economy",
    airlineId: "air-canada",
    cabin: "economy",
    aircraftType: null,
    // Soft-sided allowance 55 x 40 x 27 cm; combined pet + carrier <= 10 kg.
    maxLengthCm: 55,
    maxWidthCm: 40,
    maxHeightCm: 27,
    maxCombinedWeightKg: 10,
    softSidedRequirement: "required",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier required in cabin since 1 Jun 2025. Soft max 55x40x27 cm (hard 55x40x23 cm no longer permitted in cabin). Pet + carrier must not exceed 10 kg.",
    sourceUrl:
      "https://www.aircanada.com/ca/en/aco/home/plan/special-assistance/pets.html",
    sourceLabel: "Air Canada — Travelling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "delta-economy",
    airlineId: "delta",
    cabin: "economy",
    aircraftType: null,
    // Delta does not publish fixed maximums; carrier must fit under the seat,
    // which varies by aircraft. Modelled as incomplete + aircraft-variable.
    maxLengthCm: null,
    maxWidthCm: null,
    maxHeightCm: null,
    maxCombinedWeightKg: null,
    softSidedRequirement: "recommended",
    aircraftVaries: true,
    notes:
      "No guaranteed published maximum; the kennel must fit under the seat, which varies by aircraft. Delta recommends a soft kennel up to 18x11x11 in but confirms exact size by flight. Modelled as incomplete on purpose.",
    sourceUrl: "https://www.delta.com/us/en/pet-travel/overview",
    sourceLabel: "Delta — Pet travel overview",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "united-economy",
    airlineId: "united",
    cabin: "economy",
    aircraftType: null,
    // Hard 44.5x30.5x19, soft 45.7x27.9x27.9. We model the soft allowance.
    maxLengthCm: inch(18),
    maxWidthCm: inch(11),
    maxHeightCm: inch(11),
    maxCombinedWeightKg: null,
    softSidedRequirement: "recommended",
    aircraftVaries: true,
    notes:
      "Soft carrier max 18x11x11 in (modelled). Hard carrier max 17.5x12x9 in. No published weight limit. Under-seat clearance varies by aircraft.",
    sourceUrl:
      "https://www.united.com/en/us/fly/travel/special-needs/pets.html",
    sourceLabel: "United — Travelling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "american-economy",
    airlineId: "american",
    cabin: "economy",
    aircraftType: null,
    maxLengthCm: inch(19),
    maxWidthCm: inch(13),
    maxHeightCm: inch(9),
    maxCombinedWeightKg: null,
    softSidedRequirement: "recommended",
    aircraftVaries: false,
    notes:
      "Hard kennel max 19x13x9 in (modelled); soft carrier max 18x11x11 in and preferred. Combined weight commonly cited as ~20 lb but AA does not publish a single in-cabin figure, so weight is left unmodeled — confirm with AA.",
    sourceUrl:
      "https://www.aa.com/i18n/travel-info/special-assistance/pets.jsp",
    sourceLabel: "American Airlines — Traveling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "southwest-economy",
    airlineId: "southwest",
    cabin: "economy",
    aircraftType: null,
    maxLengthCm: inch(18.5),
    maxWidthCm: inch(8.5),
    maxHeightCm: inch(13.5),
    maxCombinedWeightKg: null,
    softSidedRequirement: null,
    aircraftVaries: false,
    notes:
      "Carrier max 18.5x8.5x13.5 in; hard or soft permitted. Sources differ on the small dimension (8.5 vs 9.5 in) — we use the more conservative 8.5 in. No published weight limit.",
    sourceUrl:
      "https://www.southwest.com/help/traveling-with-pets",
    sourceLabel: "Southwest — Traveling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "jetblue-economy",
    airlineId: "jetblue",
    cabin: "economy",
    aircraftType: null,
    maxLengthCm: inch(17),
    maxWidthCm: inch(12.5),
    maxHeightCm: inch(8.5),
    maxCombinedWeightKg: lb(20),
    softSidedRequirement: "recommended",
    aircraftVaries: false,
    notes:
      "Carrier max 17x12.5x8.5 in. Both soft and hard carriers are allowed; soft is preferred. Combined pet + carrier max 20 lb.",
    sourceUrl: "https://www.jetblue.com/traveling-together/traveling-with-pets",
    sourceLabel: "JetBlue — Traveling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "alaska-economy",
    airlineId: "alaska",
    cabin: "economy",
    aircraftType: null,
    // Soft 17x11x9.5 in (hard slightly less tall).
    maxLengthCm: inch(17),
    maxWidthCm: inch(11),
    maxHeightCm: inch(9.5),
    maxCombinedWeightKg: null,
    softSidedRequirement: "recommended",
    aircraftVaries: false,
    notes:
      "Soft carrier max 17x11x9.5 in (modelled); hard carrier max 17x11x7.5 in. No published weight limit; hard carriers may not fit under all aircraft seats.",
    sourceUrl:
      "https://www.alaskaair.com/content/travel-info/policies/pets-traveling-with-pets",
    sourceLabel: "Alaska Airlines — Pets traveling with you",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "lufthansa-economy",
    airlineId: "lufthansa",
    cabin: "economy",
    aircraftType: null,
    maxLengthCm: 55,
    maxWidthCm: 40,
    maxHeightCm: 23,
    maxCombinedWeightKg: 8,
    softSidedRequirement: "required",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier required in cabin. Carrier max 55x40x23 cm. Combined pet + carrier max 8 kg in cabin.",
    sourceUrl:
      "https://www.lufthansa.com/de/en/travelling-with-animals",
    sourceLabel: "Lufthansa — Travelling with animals",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "porter-economy",
    airlineId: "porter",
    cabin: "economy",
    aircraftType: null,
    // Soft-sided only; 55 x 40 x 23 cm (22 x 16 x 9 in); pet + carrier <= 9 kg.
    maxLengthCm: 55,
    maxWidthCm: 40,
    maxHeightCm: 23,
    maxCombinedWeightKg: 9,
    softSidedRequirement: "required",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier only. Max 55x40x23 cm (22x16x9 in). Combined pet + carrier max 9 kg (20 lb). Must fit under the seat.",
    sourceUrl: "https://www.flyporter.com/en-ca/travel-information/baggage/pets",
    sourceLabel: "Porter Airlines — Travelling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "westjet-economy",
    airlineId: "westjet",
    cabin: "economy",
    aircraftType: null,
    // Soft-sided; 16 x 8.5 x 10 in; pet + carrier <= 10 kg.
    maxLengthCm: inch(16),
    maxWidthCm: inch(8.5),
    maxHeightCm: inch(10),
    maxCombinedWeightKg: 10,
    softSidedRequirement: "required",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier required in cabin. Max 16x8.5x10 in (41x21.6x25.4 cm). Combined pet + carrier max 10 kg (22 lb).",
    sourceUrl: "https://www.westjet.com/en-ca/pets",
    sourceLabel: "WestJet — Travelling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "air-transat-economy",
    airlineId: "air-transat",
    cabin: "economy",
    aircraftType: null,
    // Soft-sided only (hard not permitted); 43 L x 24 W x 25 H cm; <= 8 kg.
    maxLengthCm: 43,
    maxWidthCm: 24,
    maxHeightCm: 25,
    maxCombinedWeightKg: 8,
    softSidedRequirement: "required",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier required (hard-sided not permitted in cabin). Max 43x24x25 cm (17x9x10 in). Combined pet + carrier max 8 kg.",
    sourceUrl: "https://www.airtransat.com/en-CA/forms/pet-information",
    sourceLabel: "Air Transat — Travelling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  {
    id: "flair-economy",
    airlineId: "flair",
    cabin: "economy",
    aircraftType: null,
    // Soft-sided; 41 x 23 x 25 cm (16 x 9 x 10 in); <= 10.4 kg. Domestic Canada only.
    maxLengthCm: 41,
    maxWidthCm: 23,
    maxHeightCm: 25,
    maxCombinedWeightKg: 10.4,
    softSidedRequirement: "required",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier required. Max 41x23x25 cm (16x9x10 in). Combined pet + carrier max 10.4 kg (23 lb). In-cabin pets on domestic Canada flights only — not offered on US/international routes.",
    sourceUrl: "https://www.flyflair.com/travel-info/baggage/pets-onboard",
    sourceLabel: "Flair Airlines — Pets onboard",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-05-26",
  },
  // ---------------------------------------------------------------------------
  // New airlines added 2026-06-18
  // ---------------------------------------------------------------------------
  {
    id: "klm-economy",
    airlineId: "klm",
    cabin: "economy",
    aircraftType: null,
    // Economy (all routes) and Business (Europe only): 46 x 28 x 24 cm; pet + carrier <= 8 kg.
    maxLengthCm: 46,
    maxWidthCm: 28,
    maxHeightCm: 24,
    maxCombinedWeightKg: 8,
    softSidedRequirement: null,
    aircraftVaries: false,
    notes:
      "Economy (all routes) and Business within Europe. Carrier max 46x28x24 cm (18x11x9 in). Combined pet + carrier max 8 kg (17.6 lb). Must fit under the seat. Not allowed in Premium Comfort or Business on intercontinental routes.",
    sourceUrl: "https://www.klm.com/information/pets/reservation",
    sourceLabel: "KLM — Flying with your pet in the cabin or hold",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  {
    id: "air-france-economy",
    airlineId: "air-france",
    cabin: "economy",
    aircraftType: null,
    // Air France does not publish explicit carrier dimensions. Weight limit is official.
    // Dimensions below are from third-party sources and need re-verification.
    maxLengthCm: inch(18),
    maxWidthCm: inch(11),
    maxHeightCm: inch(11),
    maxCombinedWeightKg: 8,
    softSidedRequirement: null,
    aircraftVaries: true,
    notes:
      "Pet + carrier must weigh less than 8 kg (17.6 lb) for in-cabin travel. Air France does not publish explicit carrier maximum dimensions — the values below (~18x11x11 in) are from third-party sources and need re-verification against official Air France policy. Confirm directly with Air France before travel.",
    sourceUrl: "https://wwws.airfrance.fr/en/information/passagers/voyager-avec-son-animal-chien-chat",
    sourceLabel: "Air France — Travel with your pet",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  {
    id: "frontier-economy",
    airlineId: "frontier",
    cabin: "economy",
    aircraftType: null,
    // Hard-sided: 18 x 14 x 8 in; soft-sided: 18 x 14 x 11 in. Domestic US only.
    maxLengthCm: inch(18),
    maxWidthCm: inch(14),
    maxHeightCm: inch(11),
    maxCombinedWeightKg: null,
    softSidedRequirement: "recommended",
    aircraftVaries: false,
    notes:
      "Hard-sided max 18x14x8 in; soft-sided max 18x14x11 in. Soft-sided recommended. No published weight limit. Domestic US flights only — no cargo hold pets. Only service dogs accepted on international flights.",
    sourceUrl: "https://faq.flyfrontier.com/help/do-you-allow-pets-on-the-plane",
    sourceLabel: "Frontier Airlines — Pets Onboard",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  {
    id: "spirit-economy",
    airlineId: "spirit",
    cabin: "economy",
    aircraftType: null,
    // Soft-sided only: 18 x 14 x 9 in; pet + carrier <= 40 lb.
    maxLengthCm: inch(18),
    maxWidthCm: inch(14),
    maxHeightCm: inch(9),
    maxCombinedWeightKg: lb(40),
    softSidedRequirement: "required",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier required (hard-sided not permitted). Max 18x14x9 in. Combined pet + carrier max 40 lb (18.1 kg). Domestic US only. Spirit is strict on carrier dimensions — carrier must slide completely under the seat.",
    sourceUrl: "https://www.spirit.com/en/us/pets",
    sourceLabel: "Spirit Airlines — Pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  {
    id: "avelo-economy",
    airlineId: "avelo",
    cabin: "economy",
    aircraftType: null,
    // Hard-sided: 17 x 13 x 9 in; soft-sided must fit in same space.
    maxLengthCm: inch(17),
    maxWidthCm: inch(9),
    maxHeightCm: inch(13),
    maxCombinedWeightKg: null,
    softSidedRequirement: null,
    aircraftVaries: false,
    notes:
      "Hard-sided max 17x13x9 in (43x33x22 cm); soft-sided must fit in the same space. Both hard and soft permitted. No published weight limit. Domestic US only. Up to 8 pet carriers per flight.",
    sourceUrl: "https://www.aveloair.com/help/pet-policy",
    sourceLabel: "Avelo Airlines — Pet Policy",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  {
    id: "british-airways-cargo-only",
    airlineId: "british-airways",
    cabin: "economy",
    aircraftType: null,
    // BA does not allow pets in cabin at all (except assistance dogs).
    maxLengthCm: null,
    maxWidthCm: null,
    maxHeightCm: null,
    maxCombinedWeightKg: null,
    softSidedRequirement: null,
    aircraftVaries: false,
    notes:
      "British Airways does NOT allow pets in the cabin on any route (except assistance/service dogs). All pets must travel in the hold via cargo. This airline is listed so users get an honest answer instead of 'unsupported airline'. Confirm arrangements with PetAir UK (export) or IAG Cargo (import).",
    sourceUrl: "https://www.britishairways.com/content/information/travel-assistance/travelling-with-pets",
    sourceLabel: "British Airways — Travelling with pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  // ---------------------------------------------------------------------------
  // New airlines added 2026-06-18 (round 2)
  // ---------------------------------------------------------------------------
  {
    id: "allegiant-economy",
    airlineId: "allegiant",
    cabin: "economy",
    aircraftType: null,
    // Max carrier: 19 x 16 x 9 in. Soft-sided recommended. In-cabin only, no cargo.
    maxLengthCm: inch(19),
    maxWidthCm: inch(16),
    maxHeightCm: inch(9),
    maxCombinedWeightKg: null,
    softSidedRequirement: "recommended",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier recommended. Max 19x16x9 in (48x41x23 cm). Combined pet + carrier max 20 lb (9 kg) per carrier (up to 2 carriers per booking). In-cabin only — no cargo hold pets. Domestic US (contiguous 48 states) and Puerto Rico only. Up to 2 pets per carrier, 2 carriers per booking.",
    sourceUrl: "https://www.allegiantair.com/traveling-with-pets",
    sourceLabel: "Allegiant Air — Traveling with Pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  {
    id: "hawaiian-economy",
    airlineId: "hawaiian",
    cabin: "economy",
    aircraftType: null,
    // Cabin: 17 x 11 x 9.5 in; pet + carrier max 25 lb. Hawaii-mainland and interisland.
    maxLengthCm: inch(17),
    maxWidthCm: inch(11),
    maxHeightCm: inch(9.5),
    maxCombinedWeightKg: lb(25),
    softSidedRequirement: "required",
    aircraftVaries: false,
    notes:
      "Soft-sided carrier required in cabin. Max 17x11x9.5 in (43x28x24 cm). Combined pet + carrier max 25 lb (11.3 kg). Allowed on Hawaii-mainland and interisland routes. $35 interisland, $125 mainland-Hawaii. Pets not accepted in cabin on international flights.",
    sourceUrl: "https://www.hawaiianairlines.com/content/travel-info/pets",
    sourceLabel: "Hawaiian Airlines — Traveling with Pets",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  {
    id: "emirates-cargo-only",
    airlineId: "emirates",
    cabin: "economy",
    aircraftType: null,
    maxLengthCm: null,
    maxWidthCm: null,
    maxHeightCm: null,
    maxCombinedWeightKg: null,
    softSidedRequirement: null,
    aircraftVaries: false,
    notes:
      "Emirates does NOT allow pets in the cabin (except falcons on select Dubai-Pakistan routes and certified guide dogs/assistance animals). All other pets must travel as manifest cargo via Emirates SkyCargo. This airline is listed so users get an honest answer instead of 'unsupported airline'.",
    sourceUrl: "https://www.emirates.com/english/help/faq/449416/can-i-carry-live-animals-on-emirates-flights",
    sourceLabel: "Emirates — Can I carry live animals on Emirates flights?",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },
  {
    id: "ryanair-no-pets",
    airlineId: "ryanair",
    cabin: "economy",
    aircraftType: null,
    maxLengthCm: null,
    maxWidthCm: null,
    maxHeightCm: null,
    maxCombinedWeightKg: null,
    softSidedRequirement: null,
    aircraftVaries: false,
    notes:
      "Ryanair does NOT carry animals on board any flights (except certified guide/assistance dogs on certain routes). Pets cannot travel in the cabin or cargo hold. This airline is listed so users get an honest answer instead of 'unsupported airline'.",
    sourceUrl: "https://help.ryanair.com/hc/en-gb/articles/12890968181521-Does-Ryanair-carry-animals",
    sourceLabel: "Ryanair — Does Ryanair carry animals?",
    sourceType: "airline_official",
    lastVerifiedAt: "2026-06-18",
  },

];

const specificCabinRules: AirlineRule[] = [
  // Lufthansa Business was already modeled before this cabin-class expansion.
  cloneEconomyRule(
    economyRules.find((r) => r.id === "lufthansa-economy")!,
    "business",
    {
      aircraftVaries: true,
      notes:
        "Soft-sided carrier required. Same 55x40x23 cm / 8 kg limits as Economy, but lie-flat seat footwells vary by aircraft.",
      sourceLabel: "Lufthansa — Travelling with animals (business)",
      unverified: false,
    },
  ),

  // Air Canada: Premium Economy does not allow cabin pets; Business has aircraft-specific exceptions.
  cloneEconomyRule(
    economyRules.find((r) => r.id === "air-canada-economy")!,
    "premium_economy",
    {
      maxLengthCm: null,
      maxWidthCm: null,
      maxHeightCm: null,
      maxCombinedWeightKg: null,
      softSidedRequirement: null,
      aircraftVaries: false,
      notes:
        "Air Canada states pets in cabin are not permitted in Premium Economy because the seat layout does not allow safe stowage of a pet carrier.",
      sourceLabel: "Air Canada — Travelling with pets (Premium Economy no cabin pets)",
      unverified: false,
    },
  ),
  cloneEconomyRule(
    economyRules.find((r) => r.id === "air-canada-economy")!,
    "business",
    {
      aircraftVaries: true,
      notes:
        "Same general soft-sided cabin rule as Economy, but Air Canada publishes aircraft-specific Business Class exceptions for A330/777/787 widebody aircraft. Provide aircraft or flight details for the most precise check.",
      sourceLabel: "Air Canada — Travelling with pets (Business fallback)",
      unverified: true,
    },
  ),
  // Delta: Delta Premium, Business Class (international), and Delta One do not permit cabin pets; Delta First (domestic) does.
  cloneEconomyRule(
    economyRules.find((r) => r.id === "delta-economy")!,
    "premium_economy",
    {
      maxLengthCm: null,
      maxWidthCm: null,
      maxHeightCm: null,
      maxCombinedWeightKg: null,
      softSidedRequirement: null,
      aircraftVaries: false,
      notes:
        "Delta Premium (Domestic and International) allows 0 in-cabin pets and does not permit pets in cabin at any time.",
      sourceLabel: "Delta — Pet travel overview (Premium Economy no cabin pets)",
      unverified: false,
    },
  ),
  cloneEconomyRule(
    economyRules.find((r) => r.id === "delta-economy")!,
    "business",
    {
      maxLengthCm: null,
      maxWidthCm: null,
      maxHeightCm: null,
      maxCombinedWeightKg: null,
      softSidedRequirement: null,
      aircraftVaries: false,
      notes:
        "Delta One and Business Class (International) allow 0 in-cabin pets and do not permit pets in cabin at any time.",
      sourceLabel: "Delta — Pet travel overview (Business no cabin pets)",
      unverified: false,
    },
  ),
  cloneEconomyRule(
    economyRules.find((r) => r.id === "delta-economy")!,
    "first",
    {
      notes:
        "Delta First (Domestic) permits cabin pets, but not in cabins with flat-bed seats. No separate First Class dimensions were found; use Delta's under-seat/aircraft guidance.",
      sourceLabel: "Delta — Pet travel overview (First fallback)",
      unverified: true,
    },
  ),

  // American: premium cabins vary by aircraft; some premium cabins have no under-seat stowage.
  cloneEconomyRule(
    economyRules.find((r) => r.id === "american-economy")!,
    "premium_economy",
    {
      aircraftVaries: true,
      notes:
        "Premium cabin under-seat space varies by aircraft. American notes that some premium cabins/aircraft have no under-seat storage, so confirm aircraft-specific stowage before relying on this rule.",
      sourceLabel: "American Airlines — Carry-on pet carrier guidelines (Premium Economy fallback)",
      unverified: true,
    },
  ),
  cloneEconomyRule(
    economyRules.find((r) => r.id === "american-economy")!,
    "business",
    {
      aircraftVaries: true,
      notes:
        "Business cabin under-seat space varies by aircraft. American notes that some premium cabins/aircraft have no under-seat storage, so confirm aircraft-specific stowage before relying on this rule.",
      sourceLabel: "American Airlines — Carry-on pet carrier guidelines (Business fallback)",
      unverified: true,
    },
  ),
  cloneEconomyRule(
    economyRules.find((r) => r.id === "american-economy")!,
    "first",
    {
      aircraftVaries: true,
      notes:
        "First cabin under-seat space varies by aircraft. American notes that some premium cabins/aircraft have no under-seat storage, so confirm aircraft-specific stowage before relying on this rule.",
      sourceLabel: "American Airlines — Carry-on pet carrier guidelines (First fallback)",
      unverified: true,
    },
  ),

  // Lufthansa: Premium Economy follows the same short/medium-haul cabin-pet limits; First has no separate allowance found.
  cloneEconomyRule(
    economyRules.find((r) => r.id === "lufthansa-economy")!,
    "premium_economy",
    {
      notes:
        "Premium Economy follows the same 55x40x23 cm / 8 kg cabin-pet limits where Lufthansa accepts pets in cabin; availability varies by route and aircraft.",
      sourceLabel: "Lufthansa — Travelling with animals (Premium Economy fallback)",
      unverified: true,
    },
  ),
  cloneEconomyRule(
    economyRules.find((r) => r.id === "lufthansa-economy")!,
    "first",
    {
      maxLengthCm: null,
      maxWidthCm: null,
      maxHeightCm: null,
      maxCombinedWeightKg: null,
      softSidedRequirement: null,
      aircraftVaries: false,
      notes:
        "No separate First Class in-cabin pet allowance found in the current Lufthansa policy; do not assume cabin pets are accepted in First.",
      sourceLabel: "Lufthansa — Travelling with animals (First no separate allowance)",
      unverified: true,
    },
  ),

  // KLM: Premium Comfort is not allowed; Business is allowed within Europe; First has no separate allowance found.
  cloneEconomyRule(
    economyRules.find((r) => r.id === "klm-economy")!,
    "premium_economy",
    {
      maxLengthCm: null,
      maxWidthCm: null,
      maxHeightCm: null,
      maxCombinedWeightKg: null,
      softSidedRequirement: null,
      aircraftVaries: false,
      notes:
        "KLM does not allow pets in the cabin when travelling in Premium Comfort Class.",
      sourceLabel: "KLM — Reservation for pets (Premium Comfort no cabin pets)",
      unverified: false,
    },
  ),
  cloneEconomyRule(
    economyRules.find((r) => r.id === "klm-economy")!,
    "business",
    {
      notes:
        "KLM allows pets in cabin in Business Class within Europe only; Premium Comfort and intercontinental Business do not allow cabin pets.",
      sourceLabel: "KLM — Reservation for pets (Business within Europe)",
      unverified: false,
    },
  ),
  cloneEconomyRule(
    economyRules.find((r) => r.id === "klm-economy")!,
    "first",
    {
      maxLengthCm: null,
      maxWidthCm: null,
      maxHeightCm: null,
      maxCombinedWeightKg: null,
      softSidedRequirement: null,
      aircraftVaries: false,
      notes:
        "No separate First Class in-cabin pet allowance found in the current KLM policy; do not assume cabin pets are accepted in First.",
      sourceLabel: "KLM — Reservation for pets (First no separate allowance)",
      unverified: true,
    },
  ),

  // Air France: Premium Economy and Business follow the same cabin-pet limits; First/La Première has no separate allowance found.
  cloneEconomyRule(
    economyRules.find((r) => r.id === "air-france-economy")!,
    "first",
    {
      maxLengthCm: null,
      maxWidthCm: null,
      maxHeightCm: null,
      maxCombinedWeightKg: null,
      softSidedRequirement: null,
      aircraftVaries: false,
      notes:
        "No separate First Class/La Première in-cabin pet allowance found in the current Air France policy; do not assume cabin pets are accepted in First.",
      sourceLabel: "Air France — Traveling with pets (First no separate allowance)",
      unverified: true,
    },
  ),
];

export const airlineRules: AirlineRule[] = [
  ...economyRules,
  ...cloneEconomyRules(economyRules, {
    "air-canada-economy": ["premium_economy", "business"],
    "delta-economy": ["premium_economy", "business", "first"],
    "american-economy": ["premium_economy", "business", "first"],
    "lufthansa-economy": ["premium_economy", "business", "first"],
    "klm-economy": ["premium_economy", "business", "first"],
    "air-france-economy": ["first"],
  }),
  ...specificCabinRules,
];

const AMZ_CA = "https://www.amazon.ca/dp/";
const affBase = (q: string) => `https://www.amazon.ca/s?k=${encodeURIComponent(q)}`;
const amzProduct = (asin: string) => `${AMZ_CA}${asin}`;

export const carriers: Carrier[] = [
  c("sherpa-original-md", "Sherpa", "Original Deluxe (Medium)", "SHP-OD-M", true, 43, 27, 27, 1.2, "team_verified", 6.8, 45, "Airline-favorite soft carrier with mesh panels.", "B000FLETX8"),
  c("sherpa-original-lg", "Sherpa", "Original Deluxe (Large)", "SHP-OD-L", true, 48, 29, 29, 1.5, "team_verified", 8.0, 55, undefined, "B000FLETX8"),
  c("sleepypod-air", "Sleepypod", "Air In-Cabin", "SLP-AIR", true, 55, 27, 27, 2.0, "team_verified", 4.5, 200, "Adjustable length to compress under the seat.", "B0030NJXQQ"),
  c("sturdibag-large", "SturdiBag", "Large Flexible-Height", "STB-LG", true, 46, 30, 30, 1.0, "team_verified", 4.5, 95, "Flex-height top collapses for under-seat fit.", "B07TQH99JC"),
  c("sturdibag-small", "SturdiBag", "Small Flexible-Height", "STB-SM", true, 41, 25, 25, 0.9, "team_verified", 3.6, 80, undefined, "B07TQH99JC"),
  c("petmate-two-door", "Petmate", "Two Door Top Load", "PTM-2DTL", false, 48, 32, 33, 2.5, "team_verified", 5.4, 40, "Hard-sided; better for cargo than most cabins.", "B0062JFGM0"),
  c("amazonbasics-soft-sm", "Amazon Basics", "Soft-Sided (Small)", "AMZ-SS-S", true, 41, 28, 28, 1.0, "not_verified_yet", 4.0, 28, undefined, "B00QHC01C2"),
  c("amazonbasics-soft-md", "Amazon Basics", "Soft-Sided (Medium)", "AMZ-SS-M", true, 49, 29, 29, 1.3, "not_verified_yet", 5.5, 33, undefined, "B00QHC0050"),
  c("kh-lookout", "K&H", "Lookout Pet Carrier", "KH-LO", true, 45, 28, 28, 1.1, "traveler_reported", 4.5, 50, undefined, "B07GD26XK3"),
  c("away-pet-carrier", "Away", "The Pet Carrier", "AWY-PC", true, 47, 28, 24, 1.6, "team_verified", 6.0, 250, "Premium soft carrier sized for under-seat."),
  c("diggs-passenger", "Diggs", "Passenger Travel Carrier", "DGS-PSG", true, 46, 28, 29, 1.8, "team_verified", 7.0, 175, undefined, "B09Y8354NB"),
  c("mr-peanuts-aspen", "Mr. Peanut's", "Aspen Series", "MPN-ASP", true, 43, 27, 27, 1.0, "traveler_reported", 4.5, 60, undefined, "B07TQH99JC"),
  c("petsfit-expandable", "Petsfit", "Expandable Carrier", "PSF-EXP", true, 46, 28, 28, 1.4, "not_verified_yet", 5.0, 45, "Side panels expand once on the ground.", "B01KXB7DVO"),
  c("henkelion-small", "Henkelion", "Soft-Sided (Small)", "HKL-SS-S", true, 40, 21, 28, 0.8, "not_verified_yet", 3.2, 25, undefined, "B07JZ31KX9"),
  c("pawaboo-backpack", "Pawaboo", "Pet Travel Backpack", "PWB-BP", true, 32, 28, 42, 0.9, "traveler_reported", 4.0, 40, "Backpack form factor; tall profile.", "B01NAK4VXM"),
  c("texsens-bubble", "Texsens", "Bubble Backpack", "TXS-BB", false, 42, 33, 28, 1.5, "traveler_reported", 4.5, 55, "Semi-rigid bubble shell.", "B07KHPLFMS"),
  c("petsfit-sturdy", "Petsfit", "Sturdy Hard Carrier", "PSF-HARD", false, 50, 33, 33, 2.8, "not_verified_yet", 6.0, 70, "Large hard-sided; rarely cabin-legal."),
  c("elitefield-3door-lg", "EliteField", "3-Door Soft (Large)", "ELF-3D-L", true, 51, 33, 33, 1.7, "traveler_reported", 6.5, 60, "Roomy but oversized for most cabins.", "B004ABH1LG"),
  c("frisco-soft", "Frisco", "Soft-Sided Carrier", "FRS-SS", true, 44, 28, 28, 1.1, "team_verified", 4.8, 35, undefined, "B00XHFTIU8"),
  c("vceoa-small", "Vceoa", "Soft Carrier (Small)", "VCE-SS-S", true, 41, 28, 28, 0.9, "not_verified_yet", 3.8, 27, undefined, "B07ZPPSR2L"),
  c("petmate-sky-100", "Petmate", "Sky Kennel 100", "PTM-SK100", false, 53, 38, 38, 3.5, "team_verified", 8.0, 45, "IATA cargo kennel; not a cabin carrier.", "B000HHL0MQ"),
  c("morpilot-expandable", "Morpilot", "Expandable Carrier", "MRP-EXP", true, 46, 28, 28, 1.3, "not_verified_yet", 5.0, 42, undefined, "B0G24Z559P"),
  // ---------------------------------------------------------------------------
  // New carriers added 2026-06-18
  // ---------------------------------------------------------------------------
  c("roverlund-carrier", "Roverlund", "Pet Carrier", "RVL-PC", true, inch(18), inch(11.5), inch(11.5), 1.45, "not_verified_yet", 11.3, 180, "Structured soft carrier with luggage sleeve and convertible shoulder strap.", "B081Y8L1VL"),
  c("katziela-rolling", "Katziela", "Rolling Rover", "KTZ-RR", true, inch(18), inch(11), inch(10.5), 1.3, "not_verified_yet", 6.8, 70, "Rolling pet carrier with telescopic handle and six wheels for easy airport navigation.", "B0CXWFNP19"),
  c("mr-peanuts-gold", "Mr. Peanut's", "Gold Series Expandable", "MPN-GOLD", true, inch(18), inch(11), inch(11), 1.2, "traveler_reported", 6.8, 65, "Expandable airline-capable tote. Ranked #1 overall by Hepper.", "B09K4GKHJ1"),
  c("petfusion-carrier", "PetFusion", "Pet Carrier", "PTF-PC", true, inch(17), inch(11), inch(11), 1.1, "not_verified_yet", 6.8, 115, "Structured nylon carrier with self-locking zippers and leash tether.", "B07P6KYZWJ"),
  c("sleepypod-atom", "Sleepypod", "Atom In-Cabin", "SLP-ATOM", true, 40, 24, 24, 1.0, "team_verified", 4.5, 120, "Smaller sibling of the Sleepypod Air. Good for small cats and toy breed dogs.", "B08J82QZ3M"),
  c("elitefield-3door-sm", "EliteField", "3-Door Soft (Small)", "ELF-3D-S", true, inch(19), inch(13), inch(10), 1.0, "not_verified_yet", 8.0, 50, "Smaller EliteField model that fits under most airline seats."),
  // ---------------------------------------------------------------------------
  // New carriers added 2026-06-18 (round 2)
  // ---------------------------------------------------------------------------
  c("bergan-comfort-lg", "Bergan", "Comfort Carrier (Large)", "BRG-CC-L", true, inch(19), inch(10), inch(13), 1.4, "not_verified_yet", 9.1, 45, "Soft duffle-style carrier with fleece bed and pet-connect zipper. K9 of Mine best overall pick.", "B002SE9DRG"),
  c("petami-classic-sm", "PetAmi", "Classic Carrier (Small)", "PTM-CC-S", true, inch(17), inch(10.2), inch(11.2), 0.9, "not_verified_yet", 8.2, 35, "Hepper #1 overall pick. 15 color options. Structured soft-sided with sherpa bedding.", "B074W36PLR"),
  c("gorilla-grip-sm", "Gorilla Grip", "TSA Carrier (Small)", "GRP-TSA-S", true, inch(17), inch(11), inch(11), 0.9, "not_verified_yet", 6.8, 35, "TSA-approved carrier with breathable mesh, washable fleece pad, and grip feet. PawsUp Express #1 pick.", "B0CWPKHMH7"),
  c("xzone-expandable-sm", "X-Zone", "Expandable Carrier (Small)", "XZN-EXP-S", true, inch(17), inch(11), inch(11), 0.9, "not_verified_yet", 6.8, 35, "Fold-out expandable panels give pets extra space. K9 of Mine best expandable pick."),
  c("prodigen-soft-sm", "Prodigen", "Soft Carrier (Small)", "PRD-SS-S", true, inch(17.5), inch(10), inch(11), 0.8, "not_verified_yet", 6.4, 25, "Budget-friendly 3-door carrier with 4-sided mesh. K9 of Mine most affordable pick."),
];

function c(
  id: string,
  brand: string,
  model: string,
  sku: string,
  softSided: boolean,
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  weightKg: number,
  verification: Carrier["verification"],
  maxPetWeightKg: number,
  priceUsd: number,
  description?: string,
  amazonAsin?: string,
): Carrier {
  // Use a direct Amazon.ca product URL when we have an ASIN, otherwise fall
  // back to a search URL. The affiliate tag is injected at runtime via
  // NEXT_PUBLIC_AFFILIATE_TAG.
  const amazonUrl = amazonAsin
    ? amzProduct(amazonAsin)
    : affBase(`${brand} ${model} pet carrier`);
  return {
    id,
    brand,
    model,
    sku,
    softSided,
    lengthCm,
    widthCm,
    heightCm,
    weightKg,
    maxPetWeightKg,
    verification,
    verifiedAt: verification === "team_verified" ? "2026-03-15" : null,
    travelerReports: verification === "traveler_reported" ? 2 : null,
    imageUrl: null,
    affiliateUrl: amazonUrl,
    affiliateTargets: {
      amazon: amazonUrl,
      chewy: `https://www.chewy.com/s?query=${encodeURIComponent(`${brand} ${model}`)}`,
    },
    priceUsd,
    description: description ?? null,
  };
}

export const productCodes: ProductCode[] = [
  { code: "FPP-SHP-OD-M", carrierId: "sherpa-original-md" },
  { code: "FPP-SLP-AIR", carrierId: "sleepypod-air" },
  { code: "FPP-STB-LG", carrierId: "sturdibag-large" },
  { code: "FPP-AWY-PC", carrierId: "away-pet-carrier" },
  { code: "FPP-DGS-PSG", carrierId: "diggs-passenger" },
  { code: "FPP-PTM-SK100", carrierId: "petmate-sky-100" },
];

export const merchants: Merchant[] = [
  { id: "petgearco", name: "PetGear Co.", slug: "petgearco", websiteUrl: "https://example.com/petgearco" },
  { id: "traveltails", name: "Travel Tails", slug: "traveltails", websiteUrl: "https://example.com/traveltails" },
];

export const merchantProducts: MerchantProduct[] = [
  { id: "mp-1", merchantId: "petgearco", carrierId: "sherpa-original-md", externalProductId: "PG-1001", productUrl: "https://example.com/petgearco/products/PG-1001" },
  { id: "mp-2", merchantId: "petgearco", carrierId: "sturdibag-large", externalProductId: "PG-1002", productUrl: "https://example.com/petgearco/products/PG-1002" },
  { id: "mp-3", merchantId: "traveltails", carrierId: "away-pet-carrier", externalProductId: "TT-555", productUrl: "https://example.com/traveltails/products/TT-555" },
  { id: "mp-4", merchantId: "traveltails", carrierId: "diggs-passenger", externalProductId: "TT-556", productUrl: "https://example.com/traveltails/products/TT-556" },
];
