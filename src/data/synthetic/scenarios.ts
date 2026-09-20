import type { LifeReceipt } from '@/types';

/**
 * Deterministic Synthetic Life Scenarios
 *
 * Provides ~320 high-fidelity synthetic life moments across 36 coherent life scenarios.
 * Generated deterministically with fixed timestamps, realistic location contexts,
 * shared semantic tags, and explicit multi-domain interaction chains.
 *
 * Provenance: "synthetic"
 * Source: "synthetic"
 *
 * Domains covered:
 * - music
 * - transaction
 * - expense
 * - place
 * - movie
 * - photo
 * - message
 * - search
 * - event
 * - note
 */

interface ScenarioConfig {
  id: string;
  family: string;
  title: string;
  baseDate: string; // ISO 8601 base
  city: string;
  state: string;
  locationName: string;
  tags: string[];
}

const SCENARIOS: ScenarioConfig[] = [
  // ─── Family A: Cafe & Study (6 scenarios) ──────────────────────────────────
  {
    id: 'scenario-cafe-01',
    family: 'cafe',
    title: 'Semester Project Coding at Campus Brew',
    baseDate: '2017-03-14T09:10:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Campus Brew Cafe',
    tags: ['coffee', 'study', 'college', 'coding'],
  },
  {
    id: 'scenario-cafe-02',
    family: 'cafe',
    title: 'Weekend Reading at Amethyst',
    baseDate: '2017-09-23T15:30:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Wild Garden Cafe at Amethyst',
    tags: ['coffee', 'reading', 'weekend'],
  },
  {
    id: 'scenario-cafe-03',
    family: 'cafe',
    title: 'Final Exam Preparation Sprint',
    baseDate: '2018-04-18T10:00:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Starbucks Velachery',
    tags: ['coffee', 'study', 'college', 'exam'],
  },
  {
    id: 'scenario-cafe-04',
    family: 'cafe',
    title: 'Remote Work Session at Third Wave Coffee',
    baseDate: '2022-06-15T14:15:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Third Wave Coffee Koramangala',
    tags: ['coffee', 'work', 'remote', 'tech'],
  },
  {
    id: 'scenario-cafe-05',
    family: 'cafe',
    title: 'Sunday Morning Journaling',
    baseDate: '2023-02-12T09:45:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Blue Tokai Cafe Indiranagar',
    tags: ['coffee', 'journaling', 'weekend', 'music'],
  },
  {
    id: 'scenario-cafe-06',
    family: 'cafe',
    title: 'Monsoon Study Afternoon',
    baseDate: '2023-08-19T16:00:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Araku Coffee Cafe',
    tags: ['coffee', 'study', 'monsoon', 'playlist'],
  },

  // ─── Family B: Movie Night (5 scenarios) ───────────────────────────────────
  {
    id: 'scenario-movie-01',
    family: 'movie',
    title: 'Interstellar IMAX Experience',
    baseDate: '2016-11-04T18:30:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'SPI Cinemas Palazzo',
    tags: ['movie', 'cinema', 'night-out', 'sci-fi'],
  },
  {
    id: 'scenario-movie-02',
    family: 'movie',
    title: 'Avengers Premiere Night',
    baseDate: '2018-04-27T19:00:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'PVR VR Mall',
    tags: ['movie', 'cinema', 'night-out', 'marvel'],
  },
  {
    id: 'scenario-movie-03',
    family: 'movie',
    title: 'Oppenheimer 70mm Weekend',
    baseDate: '2023-07-21T17:45:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'PVR Director Cut Forum Rex Walk',
    tags: ['movie', 'cinema', 'weekend', 'imax'],
  },
  {
    id: 'scenario-movie-04',
    family: 'movie',
    title: 'Late Night Dune 2 Screening',
    baseDate: '2024-03-01T21:00:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'INOX Nexus Koramangala',
    tags: ['movie', 'cinema', 'late-night', 'sci-fi'],
  },
  {
    id: 'scenario-movie-05',
    family: 'movie',
    title: 'Classic Film Festival Night',
    baseDate: '2017-12-15T18:00:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Sathyam Cinemas',
    tags: ['movie', 'cinema', 'classics', 'popcorn'],
  },

  // ─── Family C: Weekend Trip (5 scenarios) ──────────────────────────────────
  {
    id: 'scenario-trip-01',
    family: 'trip',
    title: 'Pondicherry French Quarter Weekend',
    baseDate: '2017-08-12T07:00:00Z',
    city: 'Pondicherry',
    state: 'Puducherry',
    locationName: 'Promenade Beach White Town',
    tags: ['travel', 'weekend', 'beach', 'roadtrip'],
  },
  {
    id: 'scenario-trip-02',
    family: 'trip',
    title: 'Mahabalipuram Coastal Drive',
    baseDate: '2018-02-17T08:30:00Z',
    city: 'Mahabalipuram',
    state: 'Tamil Nadu',
    locationName: 'Shore Temple East Coast Road',
    tags: ['travel', 'coastal', 'drive', 'photography'],
  },
  {
    id: 'scenario-trip-03',
    family: 'trip',
    title: 'Coorg Coffee Plantation Escape',
    baseDate: '2022-10-07T06:45:00Z',
    city: 'Coorg',
    state: 'Karnataka',
    locationName: 'Madikeri Highland Estate',
    tags: ['travel', 'nature', 'coffee', 'weekend'],
  },
  {
    id: 'scenario-trip-04',
    family: 'trip',
    title: 'Gokarna Sunset & Trek',
    baseDate: '2023-11-18T09:00:00Z',
    city: 'Gokarna',
    state: 'Karnataka',
    locationName: 'Om Beach Cliffside',
    tags: ['travel', 'beach', 'trekking', 'sunset'],
  },
  {
    id: 'scenario-trip-05',
    family: 'trip',
    title: 'Ooty Heritage Mountain Train Trip',
    baseDate: '2016-05-20T08:00:00Z',
    city: 'Ooty',
    state: 'Tamil Nadu',
    locationName: 'Nilgiri Mountain Railway',
    tags: ['travel', 'hills', 'heritage', 'chill'],
  },

  // ─── Family D: College & Tech Events (5 scenarios) ─────────────────────────
  {
    id: 'scenario-event-01',
    family: 'event',
    title: 'Shaastra Annual Tech Festival',
    baseDate: '2017-01-06T10:00:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'IIT Madras Campus',
    tags: ['event', 'college', 'tech-fest', 'coding'],
  },
  {
    id: 'scenario-event-02',
    family: 'event',
    title: 'Kurukshetra Tech Symposium',
    baseDate: '2018-02-02T11:00:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'College of Engineering Guindy',
    tags: ['event', 'college', 'robotics', 'project'],
  },
  {
    id: 'scenario-event-03',
    family: 'event',
    title: 'Bangalore Web3 Hackathon',
    baseDate: '2022-11-25T09:00:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Indiranagar Innovation Hub',
    tags: ['event', 'hackathon', 'coding', 'tech'],
  },
  {
    id: 'scenario-event-04',
    family: 'event',
    title: 'React India Developer Conference',
    baseDate: '2023-10-06T08:30:00Z',
    city: 'Goa',
    state: 'Goa',
    locationName: 'Goa Marriott Convention Centre',
    tags: ['event', 'conference', 'frontend', 'developer'],
  },
  {
    id: 'scenario-event-05',
    family: 'event',
    title: 'Cultural Fest Saarang',
    baseDate: '2016-01-09T17:00:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Open Air Theatre IITM',
    tags: ['event', 'college', 'concert', 'music'],
  },

  // ─── Family E: Shopping & Retail (4 scenarios) ─────────────────────────────
  {
    id: 'scenario-shop-01',
    family: 'shopping',
    title: 'Decathlon Marathon Gear Shopping',
    baseDate: '2017-06-18T16:00:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Decathlon OMR Padur',
    tags: ['shopping', 'fitness', 'running', 'gear'],
  },
  {
    id: 'scenario-shop-02',
    family: 'shopping',
    title: 'Bookstore Hunt at Higginbothams',
    baseDate: '2018-09-08T15:00:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Higginbothams Mount Road',
    tags: ['shopping', 'books', 'literature', 'weekend'],
  },
  {
    id: 'scenario-shop-03',
    family: 'shopping',
    title: 'IKEA Home Office Upgrade',
    baseDate: '2022-08-20T11:30:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'IKEA Nagasandra',
    tags: ['shopping', 'home', 'setup', 'furniture'],
  },
  {
    id: 'scenario-shop-04',
    family: 'shopping',
    title: 'Electronics & Audio Gear Upgrade',
    baseDate: '2023-12-09T14:00:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Croma Indiranagar',
    tags: ['shopping', 'audio', 'headphones', 'tech'],
  },

  // ─── Family F: Travel & Airport (4 scenarios) ──────────────────────────────
  {
    id: 'scenario-travel-01',
    family: 'travel',
    title: 'Flight to Delhi for Internship',
    baseDate: '2018-05-14T05:30:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Chennai International Airport T1',
    tags: ['travel', 'flight', 'airport', 'internship'],
  },
  {
    id: 'scenario-travel-02',
    family: 'travel',
    title: 'Return Flight from Mumbai Conference',
    baseDate: '2022-09-18T18:00:00Z',
    city: 'Mumbai',
    state: 'Maharashtra',
    locationName: 'Chhatrapati Shivaji Maharaj Terminal 2',
    tags: ['travel', 'flight', 'conference', 'transit'],
  },
  {
    id: 'scenario-travel-03',
    family: 'travel',
    title: 'Early Morning Bangalore Airport Commute',
    baseDate: '2023-04-10T04:45:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Kempegowda International Airport T2',
    tags: ['travel', 'transit', 'early-morning', 'flight'],
  },
  {
    id: 'scenario-travel-04',
    family: 'travel',
    title: 'Weekend Getaway Flight to Kochi',
    baseDate: '2024-01-26T07:15:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Kempegowda Airport Lounge',
    tags: ['travel', 'flight', 'weekend', 'kerala'],
  },

  // ─── Family G: Dining & Food (4 scenarios) ─────────────────────────────────
  {
    id: 'scenario-dining-01',
    family: 'dining',
    title: 'Authentic Biryani Feast at Dindigul Thalappakatti',
    baseDate: '2016-08-20T19:30:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Thalappakatti Biryani T Nagar',
    tags: ['dining', 'food', 'biryani', 'dinner'],
  },
  {
    id: 'scenario-dining-02',
    family: 'dining',
    title: 'Traditional South Indian Breakfast at Murugan Idli',
    baseDate: '2017-10-15T08:15:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Murugan Idli Shop Besant Nagar',
    tags: ['dining', 'breakfast', 'traditional', 'coffee'],
  },
  {
    id: 'scenario-dining-03',
    family: 'dining',
    title: 'Artisanal Pizza Dinner with Team',
    baseDate: '2023-03-24T20:00:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Brik Oven Church Street',
    tags: ['dining', 'dinner', 'team', 'food'],
  },
  {
    id: 'scenario-dining-04',
    family: 'dining',
    title: 'Ramen & Asian Street Food Evening',
    baseDate: '2023-09-15T19:45:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Daily Sushi & Ramen Bar',
    tags: ['dining', 'dinner', 'asian', 'food'],
  },

  // ─── Family H: Fitness & Morning Routine (3 scenarios) ─────────────────────
  {
    id: 'scenario-fitness-01',
    family: 'fitness',
    title: 'Marina Beach 5K Sunrise Run',
    baseDate: '2017-04-09T05:45:00Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locationName: 'Marina Promenade Lighthouse',
    tags: ['fitness', 'running', 'sunrise', 'beach'],
  },
  {
    id: 'scenario-fitness-02',
    family: 'fitness',
    title: 'Cubbon Park Sunday 10K Run',
    baseDate: '2022-12-04T06:15:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Cubbon Park Bandstand',
    tags: ['fitness', 'running', 'nature', 'sunday'],
  },
  {
    id: 'scenario-fitness-03',
    family: 'fitness',
    title: 'Gym Strength Training Session',
    baseDate: '2023-05-17T18:00:00Z',
    city: 'Bangalore',
    state: 'Karnataka',
    locationName: 'Cult.fit Indiranagar Center',
    tags: ['fitness', 'workout', 'gym', 'health'],
  },
];

function addMinutes(isoString: string, minutes: number): string {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

/**
 * Generate synthetic receipts for a given scenario config
 */
function buildScenarioReceipts(cfg: ScenarioConfig): LifeReceipt[] {
  const receipts: LifeReceipt[] = [];
  const base = cfg.baseDate;
  const loc = {
    city: cfg.city,
    state: cfg.state,
    locationName: cfg.locationName,
  };

  if (cfg.family === 'cafe') {
    // 1. Search
    receipts.push({
      id: `${cfg.id}-search`,
      type: 'search',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 0),
      title: `Search: best specialty coffee near ${cfg.city}`,
      category: 'search',
      location: loc,
      tags: [...cfg.tags, 'search'],
      metadata: { searchQuery: `best specialty coffee near ${cfg.city}` },
    });
    // 2. Place
    receipts.push({
      id: `${cfg.id}-place`,
      type: 'place',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 14),
      title: `Visited ${cfg.locationName}`,
      category: 'place',
      location: loc,
      tags: [...cfg.tags, 'place'],
      metadata: { placeName: cfg.locationName, city: cfg.city },
    });
    // 3. Transaction
    receipts.push({
      id: `${cfg.id}-trans`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 22),
      title: `Coffee & Pastry at ${cfg.locationName}`,
      category: 'food',
      subcategory: 'cafe',
      amount: 280,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'expense'],
      metadata: { merchant: cfg.locationName, paymentMode: 'UPI' },
    });
    // 4. Music
    receipts.push({
      id: `${cfg.id}-music`,
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 32),
      title: 'Lofi Study Beats Session',
      category: 'music',
      location: loc,
      tags: [...cfg.tags, 'playlist'],
      metadata: { artist: 'ChilledCow', album: 'Lofi Cafe Sessions', platform: 'Spotify' },
    });
    // 5. Photo
    receipts.push({
      id: `${cfg.id}-photo`,
      type: 'photo',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 65),
      title: `Photo: Coffee cup & code editor at ${cfg.locationName}`,
      category: 'photo',
      location: loc,
      tags: [...cfg.tags, 'photo'],
      metadata: { photoCaption: 'Desk setup for the afternoon' },
    });
    // 6. Message
    receipts.push({
      id: `${cfg.id}-msg`,
      type: 'message',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 80),
      title: `Message: "Found a great spot at ${cfg.locationName}, join if free"`,
      category: 'message',
      location: loc,
      tags: [...cfg.tags, 'communication'],
      metadata: { messageText: `Found a great spot at ${cfg.locationName}, join if free` },
    });
    // 7. Personal Note
    receipts.push({
      id: `${cfg.id}-note`,
      type: 'note',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 110),
      title: `Note: Notes from ${cfg.title}`,
      category: 'note',
      location: loc,
      tags: [...cfg.tags, 'productivity'],
      metadata: { note: 'Completed feature wireframes. Next step: review API schema.' },
    });
    // 8. Expense (Household domestic overlap for cross-domain richness)
    receipts.push({
      id: `${cfg.id}-exp`,
      type: 'expense',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 135),
      title: `Notebook & Stationery Refill`,
      category: 'stationery',
      subcategory: 'study',
      amount: 150,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'supplies'],
      metadata: { merchant: 'Campus Store', paymentMode: 'Cash' },
    });
  } else if (cfg.family === 'movie') {
    // 1. Search
    receipts.push({
      id: `${cfg.id}-search`,
      type: 'search',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 0),
      title: `Search: showtimes at ${cfg.locationName}`,
      category: 'search',
      location: loc,
      tags: [...cfg.tags, 'search'],
      metadata: { searchQuery: `showtimes at ${cfg.locationName}` },
    });
    // 2. Place
    receipts.push({
      id: `${cfg.id}-place`,
      type: 'place',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 25),
      title: `Arrived at ${cfg.locationName}`,
      category: 'place',
      location: loc,
      tags: [...cfg.tags, 'place'],
      metadata: { placeName: cfg.locationName, city: cfg.city },
    });
    // 3. Movie
    receipts.push({
      id: `${cfg.id}-movie`,
      type: 'movie',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 40),
      title: `Movie: ${cfg.title}`,
      category: 'entertainment',
      location: loc,
      tags: [...cfg.tags, 'movie'],
      metadata: { movie: cfg.title, platform: 'Theater' },
    });
    // 4. Transaction (Tickets)
    receipts.push({
      id: `${cfg.id}-trans-ticket`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 42),
      title: `Cinema Tickets: ${cfg.title}`,
      category: 'entertainment',
      subcategory: 'movie',
      amount: 450,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'tickets'],
      metadata: { merchant: cfg.locationName, paymentMode: 'Card' },
    });
    // 5. Expense (Popcorn & Snacks)
    receipts.push({
      id: `${cfg.id}-exp-snack`,
      type: 'expense',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 50),
      title: `Popcorn & Cold Beverage`,
      category: 'food',
      subcategory: 'cinema-snack',
      amount: 320,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'snacks'],
      metadata: { merchant: `${cfg.locationName} Concessions`, paymentMode: 'UPI' },
    });
    // 6. Music (Soundtrack listened on the drive back)
    receipts.push({
      id: `${cfg.id}-music`,
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 160),
      title: 'Original Motion Picture Soundtrack',
      category: 'music',
      location: loc,
      tags: [...cfg.tags, 'soundtrack'],
      metadata: { artist: 'Hans Zimmer', album: 'Film Score Selection', platform: 'Spotify' },
    });
    // 7. Transaction (Post-movie late dinner)
    receipts.push({
      id: `${cfg.id}-trans-dinner`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 190),
      title: 'Late Night Diner Meal',
      category: 'food',
      subcategory: 'dinner',
      amount: 380,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'dinner'],
      metadata: { merchant: 'Midnight Diner', paymentMode: 'UPI' },
    });
    // 8. Photo
    receipts.push({
      id: `${cfg.id}-photo`,
      type: 'photo',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 210),
      title: `Photo: Cinema lobby marquee at ${cfg.locationName}`,
      category: 'photo',
      location: loc,
      tags: [...cfg.tags, 'photo'],
      metadata: { photoCaption: `Movie night marquee: ${cfg.title}` },
    });
    // 9. Message
    receipts.push({
      id: `${cfg.id}-msg`,
      type: 'message',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 225),
      title: 'Message: "That movie was incredible, score was 10/10"',
      category: 'message',
      location: loc,
      tags: [...cfg.tags, 'communication'],
      metadata: { messageText: 'That movie was incredible, score was 10/10' },
    });
  } else if (cfg.family === 'trip') {
    // 1. Search
    receipts.push({
      id: `${cfg.id}-search`,
      type: 'search',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 0),
      title: `Search: scenic route to ${cfg.city}`,
      category: 'search',
      location: loc,
      tags: [...cfg.tags, 'search'],
      metadata: { searchQuery: `scenic route to ${cfg.city}` },
    });
    // 2. Music (Roadtrip playlist)
    receipts.push({
      id: `${cfg.id}-music`,
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 30),
      title: 'Highway Roadtrip Classics',
      category: 'music',
      location: loc,
      tags: [...cfg.tags, 'playlist'],
      metadata: { artist: 'Various Artists', album: 'Coastal Highway Drive', platform: 'Spotify' },
    });
    // 3. Place
    receipts.push({
      id: `${cfg.id}-place`,
      type: 'place',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 90),
      title: `Arrived at ${cfg.locationName}`,
      category: 'place',
      location: loc,
      tags: [...cfg.tags, 'place'],
      metadata: { placeName: cfg.locationName, city: cfg.city },
    });
    // 4. Photo
    receipts.push({
      id: `${cfg.id}-photo`,
      type: 'photo',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 110),
      title: `Photo: Coastline view at ${cfg.locationName}`,
      category: 'photo',
      location: loc,
      tags: [...cfg.tags, 'photo'],
      metadata: { photoCaption: `Sea breeze at ${cfg.locationName}` },
    });
    // 5. Transaction (Cafe / Meal)
    receipts.push({
      id: `${cfg.id}-trans`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 140),
      title: `Seaside Cafe Brunch`,
      category: 'food',
      subcategory: 'dining',
      amount: 520,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'food'],
      metadata: { merchant: 'Le Cafe Promenade', paymentMode: 'Card' },
    });
    // 6. Expense (Toll / Fuel)
    receipts.push({
      id: `${cfg.id}-exp-toll`,
      type: 'expense',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 180),
      title: `Highway Fastag Toll Payment`,
      category: 'transportation',
      subcategory: 'toll',
      amount: 175,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'travel'],
      metadata: { merchant: 'National Highway Authority', paymentMode: 'Fastag' },
    });
    // 7. Message
    receipts.push({
      id: `${cfg.id}-msg`,
      type: 'message',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 210),
      title: `Message: "Reached ${cfg.city}, weather is perfect"`,
      category: 'message',
      location: loc,
      tags: [...cfg.tags, 'communication'],
      metadata: { messageText: `Reached ${cfg.city}, weather is perfect` },
    });
    // 8. Note
    receipts.push({
      id: `${cfg.id}-note`,
      type: 'note',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 260),
      title: `Note: Weekend Travel Reflections`,
      category: 'note',
      location: loc,
      tags: [...cfg.tags, 'reflections'],
      metadata: { note: `Highlight of the trip: walking along ${cfg.locationName} at sunset.` },
    });
  } else if (cfg.family === 'event') {
    // 1. Event
    receipts.push({
      id: `${cfg.id}-event`,
      type: 'event',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 0),
      title: cfg.title,
      category: 'event',
      location: loc,
      tags: [...cfg.tags, 'event'],
      metadata: { eventName: cfg.title },
    });
    // 2. Place
    receipts.push({
      id: `${cfg.id}-place`,
      type: 'place',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 15),
      title: `At ${cfg.locationName}`,
      category: 'place',
      location: loc,
      tags: [...cfg.tags, 'place'],
      metadata: { placeName: cfg.locationName, city: cfg.city },
    });
    // 3. Message
    receipts.push({
      id: `${cfg.id}-msg`,
      type: 'message',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 35),
      title: 'Message: "Meet near main auditorium entrance"',
      category: 'message',
      location: loc,
      tags: [...cfg.tags, 'communication'],
      metadata: { messageText: 'Meet near main auditorium entrance' },
    });
    // 4. Photo
    receipts.push({
      id: `${cfg.id}-photo`,
      type: 'photo',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 60),
      title: `Photo: Project booth at ${cfg.locationName}`,
      category: 'photo',
      location: loc,
      tags: [...cfg.tags, 'photo'],
      metadata: { photoCaption: 'Demo day showcase setup' },
    });
    // 5. Transaction
    receipts.push({
      id: `${cfg.id}-trans`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 85),
      title: 'Campus Food Court Lunch',
      category: 'food',
      subcategory: 'lunch',
      amount: 160,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'food'],
      metadata: { merchant: 'Campus Canteen', paymentMode: 'UPI' },
    });
    // 6. Expense
    receipts.push({
      id: `${cfg.id}-exp`,
      type: 'expense',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 110),
      title: 'Printouts & Project Posters',
      category: 'supplies',
      subcategory: 'printing',
      amount: 90,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'project'],
      metadata: { merchant: 'FastPrint Campus', paymentMode: 'Cash' },
    });
    // 7. Music
    receipts.push({
      id: `${cfg.id}-music`,
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 140),
      title: 'Focus Electronic Beats',
      category: 'music',
      location: loc,
      tags: [...cfg.tags, 'focus'],
      metadata: { artist: 'Tycho', album: 'Epoch', platform: 'Spotify' },
    });
    // 8. Note
    receipts.push({
      id: `${cfg.id}-note`,
      type: 'note',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 180),
      title: `Note: Summary from ${cfg.title}`,
      category: 'note',
      location: loc,
      tags: [...cfg.tags, 'notes'],
      metadata: { note: 'Demo went very well. Received feedback on load times and UX.' },
    });
  } else if (cfg.family === 'shopping') {
    // 1. Search
    receipts.push({
      id: `${cfg.id}-search`,
      type: 'search',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 0),
      title: `Search: reviews for ${cfg.tags[1] || 'gear'}`,
      category: 'search',
      location: loc,
      tags: [...cfg.tags, 'search'],
      metadata: { searchQuery: `reviews for ${cfg.tags[1] || 'gear'}` },
    });
    // 2. Place
    receipts.push({
      id: `${cfg.id}-place`,
      type: 'place',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 25),
      title: `Shopping at ${cfg.locationName}`,
      category: 'place',
      location: loc,
      tags: [...cfg.tags, 'place'],
      metadata: { placeName: cfg.locationName, city: cfg.city },
    });
    // 3. Transaction
    receipts.push({
      id: `${cfg.id}-trans`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 50),
      title: `Purchase at ${cfg.locationName}`,
      category: 'shopping',
      subcategory: 'retail',
      amount: 2499,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'shopping'],
      metadata: { merchant: cfg.locationName, paymentMode: 'Card' },
    });
    // 4. Music
    receipts.push({
      id: `${cfg.id}-music`,
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 75),
      title: 'Upbeat Shopping Vibes',
      category: 'music',
      location: loc,
      tags: [...cfg.tags, 'music'],
      metadata: { artist: 'Dua Lipa', album: 'Future Nostalgia', platform: 'Spotify' },
    });
    // 5. Photo
    receipts.push({
      id: `${cfg.id}-photo`,
      type: 'photo',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 90),
      title: `Photo: New gear unpacked`,
      category: 'photo',
      location: loc,
      tags: [...cfg.tags, 'photo'],
      metadata: { photoCaption: 'Fresh gear unpacked and ready' },
    });
    // 6. Note
    receipts.push({
      id: `${cfg.id}-note`,
      type: 'note',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 120),
      title: `Note: Goal tracker update`,
      category: 'note',
      location: loc,
      tags: [...cfg.tags, 'goal'],
      metadata: { note: 'Set up new workspace gear. Ready for upcoming project sprint.' },
    });
    // 7. Expense
    receipts.push({
      id: `${cfg.id}-exp`,
      type: 'expense',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 140),
      title: 'Delivery & Assembly Charges',
      category: 'services',
      subcategory: 'delivery',
      amount: 200,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'expense'],
      metadata: { merchant: 'Express Logistics', paymentMode: 'UPI' },
    });
  } else if (cfg.family === 'travel') {
    // 1. Search
    receipts.push({
      id: `${cfg.id}-search`,
      type: 'search',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 0),
      title: `Search: flight status & terminal guide`,
      category: 'search',
      location: loc,
      tags: [...cfg.tags, 'search'],
      metadata: { searchQuery: 'flight status & terminal guide' },
    });
    // 2. Place
    receipts.push({
      id: `${cfg.id}-place`,
      type: 'place',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 45),
      title: `Arrived at ${cfg.locationName}`,
      category: 'place',
      location: loc,
      tags: [...cfg.tags, 'place'],
      metadata: { placeName: cfg.locationName, city: cfg.city },
    });
    // 3. Event
    receipts.push({
      id: `${cfg.id}-event`,
      type: 'event',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 70),
      title: `Boarding: Flight from ${cfg.city}`,
      category: 'event',
      location: loc,
      tags: [...cfg.tags, 'flight'],
      metadata: { eventName: `Flight departure from ${cfg.city}` },
    });
    // 4. Transaction (Airport food)
    receipts.push({
      id: `${cfg.id}-trans`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 80),
      title: 'Airport Terminal Cafe Breakfast',
      category: 'food',
      subcategory: 'cafe',
      amount: 420,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'food'],
      metadata: { merchant: 'Airport Concessions', paymentMode: 'Card' },
    });
    // 5. Music (In-flight playlist)
    receipts.push({
      id: `${cfg.id}-music`,
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 100),
      title: 'In-Flight Ambient Cloudscapes',
      category: 'music',
      location: loc,
      tags: [...cfg.tags, 'music'],
      metadata: { artist: 'Brian Eno', album: 'Music for Airports', platform: 'Spotify' },
    });
    // 6. Photo
    receipts.push({
      id: `${cfg.id}-photo`,
      type: 'photo',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 130),
      title: 'Photo: Wing view above morning clouds',
      category: 'photo',
      location: loc,
      tags: [...cfg.tags, 'photo'],
      metadata: { photoCaption: 'Cruising altitude view' },
    });
    // 7. Message
    receipts.push({
      id: `${cfg.id}-msg`,
      type: 'message',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 180),
      title: 'Message: "Landed safely, heading to cab stand"',
      category: 'message',
      location: loc,
      tags: [...cfg.tags, 'communication'],
      metadata: { messageText: 'Landed safely, heading to cab stand' },
    });
    // 8. Expense (Cab fare)
    receipts.push({
      id: `${cfg.id}-exp-cab`,
      type: 'expense',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 205),
      title: 'Airport Cab Transfer',
      category: 'transportation',
      subcategory: 'taxi',
      amount: 680,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'cab'],
      metadata: { merchant: 'City Cab Services', paymentMode: 'UPI' },
    });
  } else if (cfg.family === 'dining') {
    // 1. Search
    receipts.push({
      id: `${cfg.id}-search`,
      type: 'search',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 0),
      title: `Search: popular dishes at ${cfg.locationName}`,
      category: 'search',
      location: loc,
      tags: [...cfg.tags, 'search'],
      metadata: { searchQuery: `popular dishes at ${cfg.locationName}` },
    });
    // 2. Place
    receipts.push({
      id: `${cfg.id}-place`,
      type: 'place',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 20),
      title: `Dinner at ${cfg.locationName}`,
      category: 'place',
      location: loc,
      tags: [...cfg.tags, 'place'],
      metadata: { placeName: cfg.locationName, city: cfg.city },
    });
    // 3. Transaction
    receipts.push({
      id: `${cfg.id}-trans`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 50),
      title: `Dining Bill at ${cfg.locationName}`,
      category: 'food',
      subcategory: 'dining',
      amount: 850,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'food'],
      metadata: { merchant: cfg.locationName, paymentMode: 'Card' },
    });
    // 4. Photo
    receipts.push({
      id: `${cfg.id}-photo`,
      type: 'photo',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 55),
      title: `Photo: Feast spread at ${cfg.locationName}`,
      category: 'photo',
      location: loc,
      tags: [...cfg.tags, 'photo'],
      metadata: { photoCaption: 'Food spread with friends' },
    });
    // 5. Music
    receipts.push({
      id: `${cfg.id}-music`,
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 80),
      title: 'Acoustic Dinner Melodies',
      category: 'music',
      location: loc,
      tags: [...cfg.tags, 'music'],
      metadata: { artist: 'Leon Bridges', album: 'Coming Home', platform: 'Spotify' },
    });
    // 6. Message
    receipts.push({
      id: `${cfg.id}-msg`,
      type: 'message',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 95),
      title: 'Message: "Food was unreal, we have to come back here"',
      category: 'message',
      location: loc,
      tags: [...cfg.tags, 'communication'],
      metadata: { messageText: 'Food was unreal, we have to come back here' },
    });
    // 7. Expense (Dessert / Kulfi on the way back)
    receipts.push({
      id: `${cfg.id}-exp-dessert`,
      type: 'expense',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 115),
      title: 'Artisanal Ice Cream & Kulfi',
      category: 'food',
      subcategory: 'dessert',
      amount: 140,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'dessert'],
      metadata: { merchant: 'Corner Ice Cream Parlour', paymentMode: 'UPI' },
    });
  } else if (cfg.family === 'fitness') {
    // 1. Search
    receipts.push({
      id: `${cfg.id}-search`,
      type: 'search',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 0),
      title: 'Search: 10K running pace calculator',
      category: 'search',
      location: loc,
      tags: [...cfg.tags, 'search'],
      metadata: { searchQuery: '10K running pace calculator' },
    });
    // 2. Note
    receipts.push({
      id: `${cfg.id}-note`,
      type: 'note',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 10),
      title: 'Note: Target sub-55min 10K today',
      category: 'note',
      location: loc,
      tags: [...cfg.tags, 'goals'],
      metadata: { note: 'Target: maintain 5:25/km pace throughout the route.' },
    });
    // 3. Place
    receipts.push({
      id: `${cfg.id}-place`,
      type: 'place',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 25),
      title: `Running at ${cfg.locationName}`,
      category: 'place',
      location: loc,
      tags: [...cfg.tags, 'place'],
      metadata: { placeName: cfg.locationName, city: cfg.city },
    });
    // 4. Music (High energy workout playlist)
    receipts.push({
      id: `${cfg.id}-music`,
      type: 'music',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 30),
      title: 'High BPM Running Energy Mix',
      category: 'music',
      location: loc,
      tags: [...cfg.tags, 'workout'],
      metadata: { artist: 'Daft Punk', album: 'Alive 2007', platform: 'Spotify' },
    });
    // 5. Event
    receipts.push({
      id: `${cfg.id}-event`,
      type: 'event',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 35),
      title: `${cfg.title} Session`,
      category: 'event',
      location: loc,
      tags: [...cfg.tags, 'fitness'],
      metadata: { eventName: cfg.title },
    });
    // 6. Photo
    receipts.push({
      id: `${cfg.id}-photo`,
      type: 'photo',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 90),
      title: `Photo: Sunrise finish line at ${cfg.locationName}`,
      category: 'photo',
      location: loc,
      tags: [...cfg.tags, 'photo'],
      metadata: { photoCaption: 'Finish line morning glow' },
    });
    // 7. Transaction (Post-run hydration & coconut water)
    receipts.push({
      id: `${cfg.id}-trans`,
      type: 'transaction',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 105),
      title: 'Fresh Coconut Water & Electrolytes',
      category: 'food',
      subcategory: 'beverage',
      amount: 90,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'hydration'],
      metadata: { merchant: 'Green Coconut Stall', paymentMode: 'UPI' },
    });
    // 8. Expense (Gym membership / sportswear)
    receipts.push({
      id: `${cfg.id}-exp`,
      type: 'expense',
      source: 'synthetic',
      provenance: 'synthetic',
      scenarioId: cfg.id,
      timestamp: addMinutes(base, 130),
      title: 'Monthly Fitness Center Subscription',
      category: 'health',
      subcategory: 'gym',
      amount: 1200,
      currency: 'INR',
      location: loc,
      tags: [...cfg.tags, 'membership'],
      metadata: { merchant: 'Cult.fit Fitness', paymentMode: 'Auto-Debit' },
    });
  }

  return receipts;
}

let cachedSyntheticReceipts: LifeReceipt[] | null = null;

/**
 * Load all deterministic synthetic receipts
 * Generates ~300 rich multi-domain receipts across 36 coherent scenarios
 */
export function loadSyntheticReceipts(): LifeReceipt[] {
  if (cachedSyntheticReceipts) return cachedSyntheticReceipts;

  const all: LifeReceipt[] = [];
  for (const cfg of SCENARIOS) {
    all.push(...buildScenarioReceipts(cfg));
  }

  // Deterministically sort by timestamp
  cachedSyntheticReceipts = all.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return cachedSyntheticReceipts;
}

export function getSyntheticScenariosCount(): number {
  return SCENARIOS.length;
}
