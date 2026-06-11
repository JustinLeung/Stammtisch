/** 20 synthetic users clustered around the four seeded neighborhoods, with
 * deliberately overlapping interests/availability so the matcher can find
 * clusters, plus a few edge cases (unverified, tight constraints, tiny radius). */
import type { AvailabilityWindow, BudgetBand, VerificationStatus } from '../models.js'

export interface SeedUser {
  display_name: string
  interests: string[]
  home_lat: number
  home_lng: number
  travel_radius_km: number
  availability_windows: AvailabilityWindow[]
  budget_band: BudgetBand
  constraints: Record<string, unknown>
  verification_status: VerificationStatus
}

function U(
  name: string, interests: string[], lat: number, lng: number, radius: number,
  windows: AvailabilityWindow[],
  opts: { budget?: BudgetBand; constraints?: Record<string, unknown>; verified?: boolean } = {},
): SeedUser {
  return {
    display_name: name,
    interests,
    home_lat: lat,
    home_lng: lng,
    travel_radius_km: radius,
    availability_windows: windows,
    budget_band: opts.budget ?? 'mid',
    constraints: opts.constraints ?? { dietary: [], accessibility: [], alcohol_ok: true, setting: 'either' },
    verification_status: (opts.verified ?? true) ? 'verified' : 'unverified',
  }
}

function W(dow: number, start: string, end: string): AvailabilityWindow {
  return { dow, start, end }
}

// dow: Mon=0 .. Sun=6
const THU_EVE = W(3, '18:00', '22:00')
const SAT_AFT = W(5, '13:00', '18:00')
const SAT_EVE = W(5, '18:00', '23:00')
const SUN_MORN = W(6, '09:00', '13:00')
const WED_EVE = W(2, '18:00', '22:00')

export const USERS: SeedUser[] = [
  // --- bouldering cluster, Haidhausen/Glockenbach, Thu evenings ---
  U('Lena', ['bouldering', 'hiking', 'coffee'], 48.13, 11.6, 5, [THU_EVE, SUN_MORN]),
  U('Jonas', ['bouldering', 'techno', 'cycling'], 48.128, 11.592, 6, [THU_EVE, SAT_EVE]),
  U('Amelie', ['bouldering', 'yoga', 'photography'], 48.126, 11.575, 4, [THU_EVE, SAT_AFT]),
  U('Felix', ['bouldering', 'board games', 'beer'], 48.133, 11.605, 8, [THU_EVE, WED_EVE]),
  U('Sofia', ['climbing', 'bouldering', 'running'], 48.124, 11.58, 5, [THU_EVE, SUN_MORN],
    { constraints: { dietary: ['vegetarian'], accessibility: [], alcohol_ok: true, setting: 'either' } }),

  // --- board games cluster, Maxvorstadt, Wed evenings ---
  U('Maxi', ['board games', 'chess', 'film'], 48.151, 11.568, 4, [WED_EVE, SAT_AFT], { budget: 'low' }),
  U('Greta', ['board games', 'books', 'museums'], 48.149, 11.572, 3, [WED_EVE, SUN_MORN],
    { budget: 'low', constraints: { dietary: [], accessibility: [], alcohol_ok: false, setting: 'indoor' } }),
  U('Niko', ['board games', 'startup', 'poker'], 48.153, 11.56, 6, [WED_EVE, THU_EVE]),
  U('Paula', ['board games', 'karaoke', 'cooking'], 48.146, 11.564, 5, [WED_EVE, SAT_EVE]),

  // --- jazz / culture cluster, Haidhausen, Sat evenings ---
  U('Emir', ['jazz', 'vinyl', 'wine'], 48.131, 11.598, 5, [SAT_EVE, THU_EVE]),
  U('Hannah', ['jazz', 'museums', 'photography'], 48.134, 11.595, 4, [SAT_EVE, SUN_MORN]),
  U('Luis', ['live music', 'jazz', 'cooking'], 48.127, 11.59, 7, [SAT_EVE, WED_EVE]),
  U('Theresa', ['jazz', 'dance', 'theatre'], 48.13, 11.588, 3, [SAT_EVE],
    { constraints: { dietary: [], accessibility: ['wheelchair'], alcohol_ok: true, setting: 'indoor' } }),

  // --- outdoors cluster, Schwabing, Sun mornings ---
  U('Yusuf', ['running', 'hiking', 'swimming'], 48.159, 11.586, 6, [SUN_MORN, SAT_AFT], { budget: 'low' }),
  U('Clara', ['hiking', 'picnic', 'photography'], 48.162, 11.58, 8, [SUN_MORN, SAT_AFT], { budget: 'low' }),
  U('Béla', ['running', 'cycling', 'sauna'], 48.156, 11.59, 5, [SUN_MORN, THU_EVE]),
  U('Franzi', ['hiking', 'yoga', 'vegan food'], 48.16, 11.575, 4, [SUN_MORN],
    { constraints: { dietary: ['vegan'], accessibility: [], alcohol_ok: false, setting: 'outdoor' } }),

  // --- edge cases ---
  U('Oskar', ['chess', 'philosophy'], 48.15, 11.57, 1, [SAT_AFT], { budget: 'low' }), // tiny radius
  U('Mia', ['techno', 'karaoke'], 48.129, 11.573, 10, [SAT_EVE], { verified: false }), // unverified → can't join public
  U('Quirin', ['bouldering', 'board games', 'jazz'], 48.14, 11.585, 9, [THU_EVE, WED_EVE, SAT_EVE], { budget: 'high' }), // bridges clusters
]
