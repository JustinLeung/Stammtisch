// ---------- Interests (color keys map to CSS vars) ----------
export const INTERESTS = [
  { id: 'bouldering', label: 'Bouldering', color: 'orange' },
  { id: 'isar-runs', label: 'Isar runs', color: 'orange' },
  { id: 'cycling', label: 'Cycling', color: 'orange' },
  { id: 'hiking', label: 'Alpine hiking', color: 'orange' },
  { id: 'yoga', label: 'Yoga in the park', color: 'orange' },
  { id: 'eisbach', label: 'Eisbach surfing', color: 'orange' },

  { id: 'biergarten', label: 'Biergarten', color: 'green' },
  { id: 'boardgames', label: 'Board games', color: 'green' },
  { id: 'karaoke', label: 'Karaoke', color: 'green' },
  { id: 'supperclub', label: 'Supper clubs', color: 'green' },
  { id: 'tandem', label: 'Language tandem', color: 'green' },
  { id: 'flohmarkt', label: 'Flohmarkt hunting', color: 'green' },

  { id: 'museums', label: 'Museums', color: 'blue' },
  { id: 'techno', label: 'Techno', color: 'blue' },
  { id: 'jazz', label: 'Live jazz', color: 'blue' },
  { id: 'film', label: 'Indie cinema', color: 'blue' },
  { id: 'photo', label: 'Photo walks', color: 'blue' },

  { id: 'bookclub', label: 'Book club', color: 'red' },
  { id: 'startup', label: 'Startup talk', color: 'red' },
  { id: 'chess', label: 'Chess', color: 'red' },
  { id: 'pottery', label: 'Pottery & craft', color: 'red' },
  { id: 'cooking', label: 'Cooking together', color: 'red' },
]

export const NEIGHBORHOODS = [
  'Schwabing', 'Maxvorstadt', 'Glockenbach', 'Haidhausen', 'Giesing',
  'Sendling', 'Neuhausen', 'Au', 'Westend', 'Outside München',
]

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const SLOTS = [
  { id: 'morning', label: 'Morning', time: '09:30' },
  { id: 'afternoon', label: 'Afternoon', time: '15:00' },
  { id: 'evening', label: 'Evening', time: '19:00' },
]

// Critical mass: a table opens when MORE THAN 3 people confirm.
export const THRESHOLD = 4

// Icebreaker pool — drawn one at a time during onboarding, all optional.
export const QUESTIONS = [
  'What’s your ideal Sunday in München?',
  'What can you talk about for 20 minutes straight?',
  'Weißbier, Spezi, or espresso — what’s your order?',
  'What’s something you’ve always wanted to try but haven’t?',
  'What’s the best thing you’ve eaten in this city?',
  'What song gets you on the dance floor, no excuses?',
  'Free Friday evening, zero plans. What happens?',
  'What’s a tiny thing that makes your day better?',
  'What could you teach a table of strangers in 10 minutes?',
  'Early-bird Frühstück or late-night Döner?',
  'What’s your most controversial food opinion?',
  'Which Munich spot do you take visitors to first?',
  'What hobby did you quit that you secretly miss?',
  'How would your friends describe you in three words?',
  'Mountains or museums — and why?',
]

export const PEOPLE = [
  'Lena', 'Maxi', 'Jonas', 'Amelie', 'Felix', 'Sofia', 'Mateo', 'Greta',
  'Niko', 'Paula', 'Emir', 'Hannah', 'Luis', 'Theresa', 'Yusuf', 'Clara',
  'Béla', 'Franzi', 'Oskar', 'Mia', 'Tarik', 'Vroni', 'Anouk', 'Quirin',
  'Ida', 'Levin', 'Zoe', 'Korbinian',
]

// ---------- Event templates per interest (title, venue, area) ----------
export const TEMPLATES = {
  bouldering: [
    { title: 'After-work boulder session', venue: 'Boulderwelt München Ost', area: 'Berg am Laim' },
    { title: 'Beginner-friendly boulder morning', venue: 'Einstein Boulderhalle', area: 'Haidhausen' },
  ],
  'isar-runs': [
    { title: 'Easy 7k along the Isar', venue: 'Reichenbachbrücke, north side', area: 'Glockenbach' },
    { title: 'Sunrise run + Flaucher dip', venue: 'Flaucher entrance', area: 'Sendling' },
  ],
  cycling: [
    { title: 'Isar trail ride to Kloster Schäftlarn', venue: 'Thalkirchen bridge', area: 'Thalkirchen' },
  ],
  hiking: [
    { title: 'Day hike: Herzogstand ridge', venue: 'Hauptbahnhof, track 27', area: 'meet & ride' },
    { title: 'Tegernsee lake loop', venue: 'Hauptbahnhof, BRB platform', area: 'meet & ride' },
  ],
  yoga: [
    { title: 'Slow flow under the trees', venue: 'Westpark Rosengarten', area: 'Westend' },
  ],
  eisbach: [
    { title: 'Eisbach watch + espresso', venue: 'Eisbachwelle', area: 'Lehel' },
  ],
  biergarten: [
    { title: 'Long table at the Keller', venue: 'Augustiner-Keller', area: 'Maxvorstadt' },
    { title: 'Sunset Maß by the lake', venue: 'Seehaus im Englischen Garten', area: 'Schwabing' },
  ],
  boardgames: [
    { title: 'Strategy night (bring a friend-killer)', venue: 'Café Puck', area: 'Maxvorstadt' },
  ],
  karaoke: [
    { title: 'Bad songs, good people', venue: 'Monaco Bar', area: 'Altstadt' },
  ],
  supperclub: [
    { title: 'Altbau supper: 8 strangers, 1 table', venue: 'Shared kitchen, Haidhausen', area: 'Haidhausen' },
  ],
  tandem: [
    { title: 'Deutsch–English tandem hour', venue: 'Café Kosmos', area: 'Hauptbahnhof' },
  ],
  flohmarkt: [
    { title: 'Hofflohmärkte crawl', venue: 'Start: Gärtnerplatz fountain', area: 'Glockenbach' },
  ],
  museums: [
    { title: 'One room, slowly: Pinakothek', venue: 'Pinakothek der Moderne', area: 'Maxvorstadt' },
    { title: 'Blue Rider hour', venue: 'Lenbachhaus', area: 'Maxvorstadt' },
  ],
  techno: [
    { title: 'Warm-up + Blitz later', venue: 'Blitz Club, Museumsinsel', area: 'Isarvorstadt' },
  ],
  jazz: [
    { title: 'Late set at Unterfahrt', venue: 'Jazzclub Unterfahrt', area: 'Haidhausen' },
  ],
  film: [
    { title: '35mm night', venue: 'Werkstattkino', area: 'Glockenbach' },
  ],
  photo: [
    { title: 'Golden hour walk, Olympiapark', venue: 'Olympiaberg summit', area: 'Olympiapark' },
  ],
  bookclub: [
    { title: 'Short stories + long coffee', venue: 'Lost Weekend', area: 'Maxvorstadt' },
  ],
  startup: [
    { title: 'Builders Stammtisch', venue: 'WERK1', area: 'Werksviertel' },
  ],
  chess: [
    { title: 'Casual boards, no clocks', venue: 'Münchner Freiheit pavilion', area: 'Schwabing' },
  ],
  pottery: [
    { title: 'Hand-building taster', venue: 'Studio Ton, Sendling', area: 'Sendling' },
  ],
  cooking: [
    { title: 'Market haul → group cook', venue: 'Viktualienmarkt, then shared kitchen', area: 'Altstadt' },
  ],
}

// Pre-seeded events already open across town (other people's tables)
export const OPEN_SEED = [
  { interest: 'biergarten', title: 'Thursday Stammtisch, big table', venue: 'Hirschgarten', area: 'Neuhausen', day: 'Thu', slot: 'evening', confirmed: ['Greta', 'Luis', 'Emir', 'Paula', 'Ida'], capacity: 10 },
  { interest: 'isar-runs', title: 'Saturday social run, all paces', venue: 'Wittelsbacherbrücke', area: 'Isarvorstadt', day: 'Sat', slot: 'morning', confirmed: ['Jonas', 'Mia', 'Tarik', 'Vroni'], capacity: 12 },
  { interest: 'museums', title: 'Free-Sunday museum crawl', venue: 'Kunstareal', area: 'Maxvorstadt', day: 'Sun', slot: 'afternoon', confirmed: ['Clara', 'Oskar', 'Anouk', 'Levin', 'Zoe', 'Béla'], capacity: 8 },
  { interest: 'boardgames', title: 'Casual games, newcomers welcome', venue: 'Café Puck', area: 'Maxvorstadt', day: 'Wed', slot: 'evening', confirmed: ['Felix', 'Hannah', 'Niko', 'Theresa'], capacity: 8 },
  { interest: 'photo', title: 'Nordfriedhof to Olympiapark walk', venue: 'U6 Nordfriedhof exit', area: 'Schwabing', day: 'Sun', slot: 'morning', confirmed: ['Yusuf', 'Franzi', 'Quirin', 'Amelie', 'Korbinian'], capacity: 9 },
]
