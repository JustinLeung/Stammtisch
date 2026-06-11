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

// Public Tischkarte per Münchner: neighborhood + their 3 icebreakers.
// (No emails here — profiles only ever show what a tablemate may see.)
export const PROFILES = {
  Lena: {
    neighborhood: 'Haidhausen',
    answers: [
      { q: 'What’s your ideal Sunday in München?', a: 'Early train to the Alps, back in time for coffee in Haidhausen.' },
      { q: 'What could you teach a table of strangers in 10 minutes?', a: 'How to fall off a boulder wall without hurting yourself.' },
      { q: 'Mountains or museums — and why?', a: 'Mountains. The view is better and nobody shushes you.' },
    ],
  },
  Maxi: {
    neighborhood: 'Giesing',
    answers: [
      { q: 'Weißbier, Spezi, or espresso — what’s your order?', a: 'Weißbier, obviously. I live in Giesing.' },
      { q: 'What can you talk about for 20 minutes straight?', a: 'Why Sechzig will come back. Don’t get me started.' },
      { q: 'Free Friday evening, zero plans. What happens?', a: 'Kiosk at the Isar, a Helles, and whoever shows up.' },
    ],
  },
  Jonas: {
    neighborhood: 'Sendling',
    answers: [
      { q: 'What’s your ideal Sunday in München?', a: 'Long slow run to the Flaucher, then pancakes.' },
      { q: 'What’s a tiny thing that makes your day better?', a: 'Running past the Flaucher sheep. Yes, there are sheep.' },
      { q: 'How would your friends describe you in three words?', a: 'Early. Always early.' },
    ],
  },
  Amelie: {
    neighborhood: 'Maxvorstadt',
    answers: [
      { q: 'Which Munich spot do you take visitors to first?', a: 'Lenbachhaus, then ice cream at Ballabeni.' },
      { q: 'What can you talk about for 20 minutes straight?', a: 'Why the Blue Rider room beats any gallery in Paris.' },
      { q: 'What hobby did you quit that you secretly miss?', a: 'Analog photography. The film fridge is still full.' },
    ],
  },
  Felix: {
    neighborhood: 'Neuhausen',
    answers: [
      { q: 'What could you teach a table of strangers in 10 minutes?', a: 'The rules of any board game — picking one is the hard part.' },
      { q: 'What’s your most controversial food opinion?', a: 'Leberkässemmel is overrated. I said what I said.' },
      { q: 'Free Friday evening, zero plans. What happens?', a: 'Game night assembles itself within the hour.' },
    ],
  },
  Sofia: {
    neighborhood: 'Schwabing',
    answers: [
      { q: 'What’s your ideal Sunday in München?', a: 'Yoga in the Englischer Garten, then a long, slow Frühstück.' },
      { q: 'What song gets you on the dance floor, no excuses?', a: 'Anything with a saxophone solo.' },
      { q: 'What’s a tiny thing that makes your day better?', a: 'First coffee on the balcony before the city wakes up.' },
    ],
  },
  Mateo: {
    neighborhood: 'Westend',
    answers: [
      { q: 'What’s the best thing you’ve eaten in this city?', a: 'My own paella. But the Viktualienmarkt cheese stand comes close.' },
      { q: 'What could you teach a table of strangers in 10 minutes?', a: 'Spanish swear words and a proper sofrito.' },
      { q: 'Early-bird Frühstück or late-night Döner?', a: 'Late-night Döner. There is no debate.' },
    ],
  },
  Greta: {
    neighborhood: 'Au',
    answers: [
      { q: 'Weißbier, Spezi, or espresso — what’s your order?', a: 'Spezi by day, Weißbier after six. I have a system.' },
      { q: 'Which Munich spot do you take visitors to first?', a: 'Auer Dult if it’s on — Mariahilfplatz either way.' },
      { q: 'How would your friends describe you in three words?', a: 'Loud, loyal, hungry.' },
    ],
  },
  Niko: {
    neighborhood: 'Maxvorstadt',
    answers: [
      { q: 'What can you talk about for 20 minutes straight?', a: 'Chess openings. I’ll notice your eyes glaze over and keep going.' },
      { q: 'Free Friday evening, zero plans. What happens?', a: 'Blitz games at Münchner Freiheit until someone takes my queen.' },
      { q: 'Mountains or museums — and why?', a: 'Museums. Free Sundays are the best deal in town.' },
    ],
  },
  Paula: {
    neighborhood: 'Glockenbach',
    answers: [
      { q: 'What’s your ideal Sunday in München?', a: 'Flohmarkt at dawn, haggling by eight, home with treasures by noon.' },
      { q: 'What hobby did you quit that you secretly miss?', a: 'Pottery. My shelf of wonky bowls misses me too.' },
      { q: 'What’s a tiny thing that makes your day better?', a: 'Finding the perfect ugly lamp for three euros.' },
    ],
  },
  Emir: {
    neighborhood: 'Westend',
    answers: [
      { q: 'What song gets you on the dance floor, no excuses?', a: 'Anything over 130 BPM. The Blitz door staff know me.' },
      { q: 'Early-bird Frühstück or late-night Döner?', a: 'Both, in that order, same night.' },
      { q: 'What’s something you’ve always wanted to try but haven’t?', a: 'DJing an actual set instead of just my kitchen.' },
    ],
  },
  Hannah: {
    neighborhood: 'Schwabing',
    answers: [
      { q: 'What can you talk about for 20 minutes straight?', a: 'The book I just finished. Currently: anything by Jenny Erpenbeck.' },
      { q: 'What’s your ideal Sunday in München?', a: 'A bench in the Englischer Garten, a novel, and zero plans.' },
      { q: 'How would your friends describe you in three words?', a: 'Quiet until books.' },
    ],
  },
  Luis: {
    neighborhood: 'Giesing',
    answers: [
      { q: 'What’s your ideal Sunday in München?', a: 'Sixty kilometers along the Isar, then Kaiserschmarrn as a reward.' },
      { q: 'What’s a tiny thing that makes your day better?', a: 'A green wave on the Isarradweg.' },
      { q: 'What’s your most controversial food opinion?', a: 'Radler is a great drink and the gatekeepers can stay mad.' },
    ],
  },
  Theresa: {
    neighborhood: 'Neuhausen',
    answers: [
      { q: 'Mountains or museums — and why?', a: 'Mountains. I check the webcams before I check my messages.' },
      { q: 'What could you teach a table of strangers in 10 minutes?', a: 'How to actually read an Alpine hiking map.' },
      { q: 'Free Friday evening, zero plans. What happens?', a: 'Packing my rucksack for a 6 a.m. train to the Alps.' },
    ],
  },
  Yusuf: {
    neighborhood: 'Maxvorstadt',
    answers: [
      { q: 'Which Munich spot do you take visitors to first?', a: 'Olympiaberg at golden hour. Works every time.' },
      { q: 'What’s something you’ve always wanted to try but haven’t?', a: 'Developing my own film instead of paying the lab.' },
      { q: 'What’s a tiny thing that makes your day better?', a: 'Spotting the Alps from town on a Föhn day.' },
    ],
  },
  Clara: {
    neighborhood: 'Haidhausen',
    answers: [
      { q: 'What’s your ideal Sunday in München?', a: 'One museum room, slowly. Then jazz at Unterfahrt.' },
      { q: 'Weißbier, Spezi, or espresso — what’s your order?', a: 'Espresso. Double. Before noon, don’t talk to me.' },
      { q: 'What can you talk about for 20 minutes straight?', a: 'Why Unterfahrt is one of Europe’s best jazz clubs.' },
    ],
  },
  Béla: {
    neighborhood: 'Au',
    answers: [
      { q: 'What song gets you on the dance floor, no excuses?', a: '99 Luftballons. I know every word.' },
      { q: 'What’s the best thing you’ve eaten in this city?', a: 'Schmalznudel at the Viktualienmarkt, still warm.' },
      { q: 'How would your friends describe you in three words?', a: 'First to sing.' },
    ],
  },
  Franzi: {
    neighborhood: 'Sendling',
    answers: [
      { q: 'What’s your ideal Sunday in München?', a: 'Market leftovers turned into brunch for eight friends.' },
      { q: 'What’s a tiny thing that makes your day better?', a: 'Morning light in the Westpark rose garden.' },
      { q: 'What’s your most controversial food opinion?', a: 'White asparagus season is wildly overhyped.' },
    ],
  },
  Oskar: {
    neighborhood: 'Maxvorstadt',
    answers: [
      { q: 'What can you talk about for 20 minutes straight?', a: 'Why 35mm projection still matters.' },
      { q: 'Free Friday evening, zero plans. What happens?', a: 'Whatever the Werkstattkino is showing. No trailers, all in.' },
      { q: 'Mountains or museums — and why?', a: 'Museums. The Pinakothek on a rainy Tuesday is my church.' },
    ],
  },
  Mia: {
    neighborhood: 'Glockenbach',
    answers: [
      { q: 'What’s your ideal Sunday in München?', a: 'Run at sunrise, Eisbach watching with coffee after.' },
      { q: 'How would your friends describe you in three words?', a: 'Faster than expected.' },
      { q: 'Early-bird Frühstück or late-night Döner?', a: 'Early-bird Frühstück — I’ve already run 10k by then.' },
    ],
  },
  Tarik: {
    neighborhood: 'Au',
    answers: [
      { q: 'What’s a tiny thing that makes your day better?', a: 'High-fiving strangers at parkrun.' },
      { q: 'What’s something you’ve always wanted to try but haven’t?', a: 'The full Munich marathon. This year, I keep saying.' },
      { q: 'What’s the best thing you’ve eaten in this city?', a: 'Post-long-run Käsespätzle. Earned calories taste better.' },
    ],
  },
  Vroni: {
    neighborhood: 'Giesing',
    answers: [
      { q: 'Weißbier, Spezi, or espresso — what’s your order?', a: 'A Russ’n if it’s warm, Weißbier if it’s evening.' },
      { q: 'Which Munich spot do you take visitors to first?', a: 'Up the Alter Peter, then straight to the Viktualienmarkt.' },
      { q: 'What could you teach a table of strangers in 10 minutes?', a: 'Enough Bairisch to survive a Biergarten order.' },
    ],
  },
  Anouk: {
    neighborhood: 'Schwabing',
    answers: [
      { q: 'What’s something you’ve always wanted to try but haven’t?', a: 'Sketching strangers in the Alte Pinakothek without blushing.' },
      { q: 'What’s your ideal Sunday in München?', a: 'Museum in the morning, Flohmarkt finds in the afternoon.' },
      { q: 'How would your friends describe you in three words?', a: 'Curious, French, caffeinated.' },
    ],
  },
  Quirin: {
    neighborhood: 'Outside München',
    answers: [
      { q: 'Mountains or museums — and why?', a: 'Mountains — I grew up with them in the kitchen window.' },
      { q: 'Free Friday evening, zero plans. What happens?', a: 'Driving out to the lakes with the camera before sunset.' },
      { q: 'What’s your most controversial food opinion?', a: 'Obazda needs more caraway. Most places are cowards.' },
    ],
  },
  Ida: {
    neighborhood: 'Westend',
    answers: [
      { q: 'Free Friday evening, zero plans. What happens?', a: 'Hirschgarten with whoever answers the group chat first.' },
      { q: 'What can you talk about for 20 minutes straight?', a: 'Board game strategy — ask about my Carcassonne win rate.' },
      { q: 'What’s a tiny thing that makes your day better?', a: 'The first chestnut shade in the Biergarten.' },
    ],
  },
  Levin: {
    neighborhood: 'Maxvorstadt',
    answers: [
      { q: 'What can you talk about for 20 minutes straight?', a: 'My side project. I’m sorry in advance.' },
      { q: 'Early-bird Frühstück or late-night Döner?', a: 'Late-night Döner at the Hauptbahnhof, like a true founder.' },
      { q: 'What’s something you’ve always wanted to try but haven’t?', a: 'A whole weekend without checking my metrics.' },
    ],
  },
  Zoe: {
    neighborhood: 'Glockenbach',
    answers: [
      { q: 'What song gets you on the dance floor, no excuses?', a: 'Don’t make me choose — just get me past the Blitz door.' },
      { q: 'What’s your ideal Sunday in München?', a: 'Sleep till noon, Gärtnerplatz steps, ice cream, repeat.' },
      { q: 'How would your friends describe you in three words?', a: 'Last to leave.' },
    ],
  },
  Korbinian: {
    neighborhood: 'Outside München',
    answers: [
      { q: 'Which Munich spot do you take visitors to first?', a: 'Andechs. Technically not Munich, spiritually essential.' },
      { q: 'Weißbier, Spezi, or espresso — what’s your order?', a: 'Andechser Doppelbock, but only after a proper hike.' },
      { q: 'What could you teach a table of strangers in 10 minutes?', a: 'The difference between a real Brezn and a tourist Brezn.' },
    ],
  },
}

export const PEOPLE = Object.keys(PROFILES)

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
