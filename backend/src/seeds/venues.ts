/** ~50 seeded Munich venues across four neighborhoods. Names are a mix of
 * real and plausible-invented places; coordinates are approximate. This is the
 * SeededPlacesProvider's dataset — swap for live places data later. */
import type { BudgetBand } from '../models.js'

export interface SeedVenue {
  name: string
  area: string
  lat: number
  lng: number
  category: string
  hours: Record<string, [string, string] | null>
  price_band: BudgetBand
  tags: string[]
  accessibility: { wheelchair: boolean; step_free: boolean }
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

/** Same hours every day, minus `closed` days. close < open = past midnight. */
function H(openT: string, closeT: string, closed: string[] = []) {
  return Object.fromEntries(
    DAYS.map((d) => [d, closed.includes(d) ? null : ([openT, closeT] as [string, string])]),
  )
}

function V(
  name: string, area: string, lat: number, lng: number, category: string,
  hours: Record<string, [string, string] | null>, price: BudgetBand,
  tags: string[], wheelchair = true,
): SeedVenue {
  return {
    name, area, lat, lng, category, hours, price_band: price, tags,
    accessibility: { wheelchair, step_free: wheelchair },
  }
}

export const VENUES: SeedVenue[] = [
  // ---------------- Maxvorstadt (48.150, 11.567) ----------------
  V('Café Puck', 'Maxvorstadt', 48.1518, 11.5705, 'boardgame_cafe', H('10:00', '01:00'), 'low',
    ['indoor', 'serves_alcohol', 'vegetarian_friendly', 'board_games']),
  V('Lost Weekend', 'Maxvorstadt', 48.1501, 11.5669, 'cafe', H('08:00', '20:00'), 'low',
    ['indoor', 'vegan_friendly', 'quiet', 'wifi']),
  V('Pinakothek der Moderne', 'Maxvorstadt', 48.1471, 11.5723, 'museum', H('10:00', '18:00', ['mon']), 'low',
    ['indoor', 'art', 'quiet']),
  V('Lenbachhaus', 'Maxvorstadt', 48.1466, 11.5636, 'museum', H('10:00', '18:00', ['mon']), 'low',
    ['indoor', 'art']),
  V('Alte Pinakothek', 'Maxvorstadt', 48.1483, 11.57, 'museum', H('10:00', '18:00', ['mon']), 'low',
    ['indoor', 'art', 'quiet']),
  V('Türkenhof', 'Maxvorstadt', 48.1502, 11.5746, 'restaurant', H('11:00', '01:00'), 'mid',
    ['indoor', 'serves_alcohol', 'bavarian', 'vegetarian_friendly']),
  V('Park Café Biergarten', 'Maxvorstadt', 48.1437, 11.5601, 'biergarten', H('11:00', '23:00'), 'mid',
    ['outdoor', 'serves_alcohol', 'bavarian']),
  V('Kraftraum Boulder Studio', 'Maxvorstadt', 48.1531, 11.5622, 'boulder_gym', H('07:00', '23:00'), 'mid',
    ['indoor', 'sports', 'beginner_friendly']),
  V('Theresa Grill', 'Maxvorstadt', 48.1448, 11.574, 'restaurant', H('18:00', '01:00', ['sun']), 'high',
    ['indoor', 'serves_alcohol', 'steak'], false),
  V('Cotidiano Schellingstraße', 'Maxvorstadt', 48.1513, 11.5689, 'cafe', H('08:00', '22:00'), 'mid',
    ['indoor', 'brunch', 'vegetarian_friendly']),
  V('Atelier F Keramikstudio', 'Maxvorstadt', 48.1525, 11.5658, 'craft_studio', H('12:00', '20:00', ['mon', 'sun']), 'mid',
    ['indoor', 'craft', 'beginner_friendly'], false),
  V('Münchner Schachsalon', 'Maxvorstadt', 48.1495, 11.5712, 'club_room', H('14:00', '22:00'), 'low',
    ['indoor', 'games', 'quiet']),
  V('Augustiner-Keller', 'Maxvorstadt', 48.1437, 11.551, 'biergarten', H('10:00', '00:00'), 'mid',
    ['outdoor', 'serves_alcohol', 'bavarian', 'big_groups']),

  // ---------------- Glockenbach (48.129, 11.572) ----------------
  V('Werkstattkino', 'Glockenbach', 48.1276, 11.574, 'cinema', H('18:00', '00:00'), 'low',
    ['indoor', 'film', 'indie'], false),
  V('Café Glück', 'Glockenbach', 48.1296, 11.5701, 'cafe', H('09:00', '19:00'), 'low',
    ['indoor', 'vegan_friendly', 'quiet']),
  V('Holy Home', 'Glockenbach', 48.1289, 11.5728, 'bar', H('19:00', '03:00'), 'mid',
    ['indoor', 'serves_alcohol', 'late_night'], false),
  V('Bapas', 'Glockenbach', 48.1301, 11.5745, 'restaurant', H('17:00', '01:00', ['mon']), 'mid',
    ['indoor', 'serves_alcohol', 'tapas', 'vegetarian_friendly']),
  V('Gärtnerplatz Stufen', 'Glockenbach', 48.1318, 11.5755, 'park', H('00:00', '23:59'), 'low',
    ['outdoor', 'free', 'people_watching']),
  V('Vits der Kaffee', 'Glockenbach', 48.133, 11.5779, 'cafe', H('08:30', '18:30', ['sun']), 'mid',
    ['indoor', 'specialty_coffee', 'quiet']),
  V('Pixel Spielbar', 'Glockenbach', 48.1283, 11.5692, 'boardgame_cafe', H('16:00', '01:00'), 'low',
    ['indoor', 'board_games', 'serves_alcohol', 'retro_games']),
  V('Isar Flaucher Einstieg', 'Glockenbach', 48.1205, 11.5611, 'park', H('00:00', '23:59'), 'low',
    ['outdoor', 'free', 'river', 'running']),
  V('Studio Ton', 'Glockenbach', 48.1265, 11.5683, 'craft_studio', H('11:00', '19:00', ['mon']), 'mid',
    ['indoor', 'craft', 'pottery', 'beginner_friendly']),
  V('Deutsches Museum Innenhof', 'Glockenbach', 48.1299, 11.5834, 'museum', H('09:00', '17:00'), 'mid',
    ['indoor', 'science']),
  V('Baader Café', 'Glockenbach', 48.129, 11.5786, 'cafe', H('09:00', '01:00'), 'mid',
    ['indoor', 'serves_alcohol', 'brunch', 'literary']),
  V('Kletterinsel Süd', 'Glockenbach', 48.124, 11.566, 'boulder_gym', H('08:00', '23:00'), 'mid',
    ['indoor', 'sports', 'beginner_friendly']),

  // ---------------- Haidhausen (48.131, 11.598) ----------------
  V('Jazzclub Unterfahrt', 'Haidhausen', 48.1308, 11.601, 'music_venue', H('19:00', '01:00', ['mon']), 'mid',
    ['indoor', 'jazz', 'serves_alcohol', 'live_music']),
  V('Hofbräukeller am Wiener Platz', 'Haidhausen', 48.1322, 11.5959, 'biergarten', H('10:00', '00:00'), 'mid',
    ['outdoor', 'serves_alcohol', 'bavarian', 'big_groups']),
  V('Einstein Boulderhalle', 'Haidhausen', 48.1289, 11.6043, 'boulder_gym', H('07:00', '00:00'), 'mid',
    ['indoor', 'sports', 'beginner_friendly']),
  V('Café Maria', 'Haidhausen', 48.1295, 11.5972, 'cafe', H('09:00', '19:00', ['mon']), 'low',
    ['indoor', 'vegetarian_friendly', 'quiet']),
  V('Wirtshaus in der Au', 'Haidhausen', 48.1252, 11.5878, 'restaurant', H('17:00', '00:00'), 'mid',
    ['indoor', 'serves_alcohol', 'bavarian', 'knödel']),
  V('Muffatwerk Biergarten', 'Haidhausen', 48.1311, 11.5896, 'biergarten', H('17:00', '01:00'), 'low',
    ['outdoor', 'serves_alcohol', 'alternative']),
  V('Lothringer 13 Halle', 'Haidhausen', 48.1287, 11.599, 'gallery', H('11:00', '19:00', ['mon', 'tue']), 'low',
    ['indoor', 'art', 'free']),
  V('Buchhandlung & Lesecafé Anna', 'Haidhausen', 48.1316, 11.6022, 'cafe', H('10:00', '20:00', ['sun']), 'low',
    ['indoor', 'books', 'quiet']),
  V('Ostbahnhof Tischtennis Platz', 'Haidhausen', 48.1271, 11.6051, 'park', H('00:00', '23:59'), 'low',
    ['outdoor', 'free', 'sports']),
  V('Kulturzentrum Gasteig HP8', 'Haidhausen', 48.1213, 11.5916, 'music_venue', H('10:00', '22:00'), 'mid',
    ['indoor', 'classical', 'concerts']),
  V('Weinbar Rotwild', 'Haidhausen', 48.133, 11.5985, 'bar', H('18:00', '01:00', ['sun', 'mon']), 'high',
    ['indoor', 'serves_alcohol', 'wine', 'quiet'], false),
  V('Préludio Tanzstudio', 'Haidhausen', 48.1302, 11.5938, 'dance_studio', H('17:00', '22:30'), 'mid',
    ['indoor', 'dance', 'beginner_friendly']),

  // ---------------- Schwabing (48.159, 11.586) ----------------
  V('Seehaus im Englischen Garten', 'Schwabing', 48.1606, 11.5937, 'biergarten', H('10:00', '23:00'), 'mid',
    ['outdoor', 'serves_alcohol', 'lake', 'bavarian']),
  V('Eisbachwelle Treffpunkt', 'Schwabing', 48.1435, 11.5877, 'park', H('00:00', '23:59'), 'low',
    ['outdoor', 'free', 'surfing', 'people_watching']),
  V('Café Münchner Freiheit', 'Schwabing', 48.1622, 11.5867, 'cafe', H('08:00', '23:00'), 'mid',
    ['indoor', 'kuchen', 'outdoor_seating']),
  V('Alter Simpl', 'Schwabing', 48.153, 11.58, 'bar', H('17:00', '03:00'), 'mid',
    ['indoor', 'serves_alcohol', 'literary', 'late_night']),
  V('Nordbad Sauna & Pool', 'Schwabing', 48.1623, 11.5701, 'sports_center', H('07:30', '23:00'), 'mid',
    ['indoor', 'swimming', 'sauna']),
  V('Leopold Vinothek', 'Schwabing', 48.158, 11.5822, 'bar', H('16:00', '00:00', ['sun']), 'high',
    ['indoor', 'serves_alcohol', 'wine']),
  V('Kleinhesseloher See Runde', 'Schwabing', 48.1565, 11.595, 'park', H('00:00', '23:59'), 'low',
    ['outdoor', 'free', 'running', 'lake']),
  V('Atelier Lichtspiel Fotostudio', 'Schwabing', 48.1598, 11.5781, 'craft_studio', H('13:00', '21:00', ['mon']), 'mid',
    ['indoor', 'photography', 'workshops'], false),
  V('Occam Deli', 'Schwabing', 48.1614, 11.5889, 'restaurant', H('09:00', '23:00'), 'mid',
    ['indoor', 'brunch', 'vegetarian_friendly', 'serves_alcohol']),
  V('Milchhäusl Biergarten', 'Schwabing', 48.1542, 11.5882, 'biergarten', H('09:00', '22:00'), 'low',
    ['outdoor', 'serves_alcohol', 'organic', 'vegetarian_friendly']),
  V('Schwabinger Brettlspiele', 'Schwabing', 48.1633, 11.584, 'boardgame_cafe', H('15:00', '00:00', ['tue']), 'low',
    ['indoor', 'board_games', 'family_friendly']),
  V('Ukulele & Co Musikraum', 'Schwabing', 48.1607, 11.5755, 'club_room', H('16:00', '22:00', ['sun']), 'low',
    ['indoor', 'music', 'beginner_friendly']),
  V('English Garden Monopteros Wiese', 'Schwabing', 48.1525, 11.5917, 'park', H('00:00', '23:59'), 'low',
    ['outdoor', 'free', 'picnic', 'slackline']),
]
