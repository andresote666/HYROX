/* Meal plan built from Andy's 2025 "45 Days Challenge" diet (same foods),
   re-sized for the 2027 training load (research/02 §E):
   protein ~2.1–2.4 g/kg, carbs matched to the day (≈2.7 / 3.8 / 5.2 g/kg),
   weekly average ≈3,200 kcal → ~0.3–0.4 kg/week loss until week 11,
   then +300 kcal/day (maintenance) for the peak, taper and races.
   Values per standard nutrition tables (cooked weights unless stated). */

const F = (name, amount, kcal, p, c, f, note = '') => ({ name, amount, kcal, p, c, f, note });

const EGGS = F('Eggs', '2 + 4 whites', 212, 27, 1, 10, 'omelette or scrambled');
const OATS = g => F('Oats', `${g} g dry`, Math.round(g * 3.8), Math.round(g * 0.13), Math.round(g * 0.66), Math.round(g * 0.07));
const BANANA = F('Banana', '1 medium', 105, 1, 27, 0);
const TOAST_HONEY = [F('Whole-wheat toast', '2 slices', 170, 8, 30, 2), F('Honey', '1 tbsp', 64, 0, 17, 0)];
const CHICKEN = g => F('Chicken breast', `${g} g cooked`, Math.round(g * 1.65), Math.round(g * 0.31), 0, Math.round(g * 0.036), 'or turkey, lean beef (lomo, peceto) 170 g, or 1½ cans tuna');
const RICE = g => F('Rice', `${g} g cooked`, Math.round(g * 1.3), Math.round(g * 0.027), Math.round(g * 0.28), Math.round(g * 0.003), 'or the same weight of cooked pasta or quinoa');
const VEG = F('Vegetables', '150 g', 52, 4, 10, 0, 'broccoli, zucchini, green beans, carrots, spinach');
const OIL = F('Olive oil', '1 tbsp', 120, 0, 0, 14);
const SHAKE = [F('Whey protein', '30 g scoop', 120, 24, 3, 2), F('Skim milk', '250 ml', 85, 9, 12, 0), BANANA];
const YOGURT = [F('Greek yogurt, plain', '200 g', 146, 20, 8, 4), F('Apple', '1 medium', 95, 0, 25, 0), F('Almonds', '30 g', 174, 6, 6, 15)];
const FISH = F('Fish', '200 g cooked', 180, 38, 0, 2, 'hake (merluza) most days; salmon 2× a week adds ~200 kcal of good fat');
const POTATO = g => F('Potato or sweet potato', `${g} g cooked`, Math.round(g * 0.85), Math.round(g * 0.02), Math.round(g * 0.195), 0);
const SALAD = F('Salad', 'leaves, tomato, cucumber', 50, 2, 10, 0);

export const DAY_TYPES = {
  rest: {
    id: 'rest', label: 'Rest day', short: 'Rest', when: 'Sunday and light recovery days',
    meals: [
      { id: 'breakfast', name: 'Breakfast', time: 'Morning', items: [EGGS, OATS(80), BANANA] },
      { id: 'lunch', name: 'Lunch', time: 'Midday', items: [CHICKEN(180), RICE(150), VEG, OIL] },
      { id: 'snack', name: 'Afternoon', time: 'Afternoon', items: [...YOGURT] },
      { id: 'shake', name: 'Shake', time: 'Any time', items: [...SHAKE] },
      { id: 'dinner', name: 'Dinner', time: 'Evening', items: [FISH, POTATO(200), SALAD, OIL] },
    ],
  },
  training: {
    id: 'training', label: 'Training day', short: 'Training', when: 'Mon, Wed, Thu, Fri: strength, rowing, long easy bike',
    meals: [
      { id: 'breakfast', name: 'Breakfast', time: 'Morning', items: [EGGS, OATS(100), BANANA] },
      { id: 'pre', name: 'Before training', time: '60–90 min before', items: [...TOAST_HONEY] },
      { id: 'lunch', name: 'Lunch', time: 'Midday', items: [CHICKEN(200), RICE(250), VEG, OIL] },
      { id: 'post', name: 'After training', time: 'Within 1 hour', items: [...SHAKE] },
      { id: 'snack', name: 'Afternoon', time: 'Afternoon', items: [...YOGURT] },
      { id: 'dinner', name: 'Dinner', time: 'Evening', items: [FISH, POTATO(300), SALAD, OIL] },
    ],
  },
  big: {
    id: 'big', label: 'Big day', short: 'Big day', when: 'Tue (bike intervals) and Sat (HYROX session)',
    meals: [
      { id: 'breakfast', name: 'Breakfast', time: 'Morning', items: [EGGS, OATS(100), BANANA] },
      { id: 'pre', name: 'Before training', time: '60–90 min before', items: [...TOAST_HONEY, BANANA] },
      { id: 'during', name: 'During (Saturday only)', time: 'Sessions over 75 min', items: [F('Sports drink', '500 ml', 120, 0, 30, 0, 'From week 9, practise your race gels here instead')], satOnly: true },
      { id: 'lunch', name: 'Lunch', time: 'Midday', items: [CHICKEN(200), RICE(350), VEG, OIL] },
      { id: 'post', name: 'After training', time: 'Within 1 hour', items: [...SHAKE, F('Rice cakes + honey', '2 cakes, 1 tbsp', 134, 2, 32, 0)] },
      { id: 'snack', name: 'Afternoon', time: 'Afternoon', items: [...YOGURT, BANANA] },
      { id: 'dinner', name: 'Dinner', time: 'Evening', items: [FISH, POTATO(400), SALAD, OIL] },
    ],
  },
};

export function totals(type, { saturday = true } = {}) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  DAY_TYPES[type].meals.forEach(m => {
    if (m.satOnly && !saturday) return;
    m.items.forEach(i => { t.kcal += i.kcal; t.p += i.p; t.c += i.c; t.f += i.f; });
  });
  return t;
}

export const mealTotals = m => m.items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, p: a.p + i.p }), { kcal: 0, p: 0 });

/* Which menu a session needs */
export function dayTypeFor(session) {
  if (!session) return 'rest';
  if (['vo2', 'sim', 'race'].includes(session.kind)) return 'big';
  if (['rest', 'recovery'].includes(session.kind)) return 'rest';
  return 'training';
}

export const MAINTENANCE_ADD = 'From week 12 (peak, Santiago, taper): stop the deficit. Add about 300 kcal a day: 100 g more cooked rice at lunch and 1 slice of toast with ½ avocado at breakfast.';

export const LAST_YEAR = {
  said: { kcal: 2355, p: 236, c: 236, f: 52 },
  actual: { kcal: 2095, p: 150, c: 203, f: 84 },
  keep: [
    'The foods: eggs, oats, chicken, rice, fish, potato or sweet potato, Greek yogurt, fruit, nuts, olive oil and lots of vegetables. All great choices.',
    'Four simple meals and a weekly meal prep.',
    'The swap lists (turkey, lean beef, quinoa, lentils) to avoid boredom.',
  ],
  change: [
    'The numbers didn\'t add up: the document promised 2,355 kcal and 236 g protein, but its foods only give about 2,095 kcal and 150 g protein.',
    'Too little food for this training. Your hard days now burn about 3,700–4,000 kcal. Eating ~2,100 would mean losing weight too fast, weaker intervals and a higher risk of bone stress injuries in the shins.',
    'Same amount every day. Now the portions follow the training: less on rest days, more carbs on big days.',
    'No food around training. Added a snack before training and a shake after it.',
    'Coconut oil swapped for olive oil, and the shopping list fixed (last year\'s list mixed both plans and bought chicken, turkey and fish all at once).',
  ],
};

export const SWAPS = [
  ['Chicken 200 g', 'Turkey 200 g · lean beef (lomo, peceto, nalga) 170 g · 1½ cans tuna in water · hake 250 g'],
  ['Rice 250 g cooked', 'Pasta 250 g cooked · quinoa 250 g cooked · potato 350 g · lentils 200 g cooked (+ extra protein)'],
  ['Oats + banana', '2 slices whole-wheat toast + 1 tbsp peanut butter + 1 orange (keep the eggs)'],
  ['Greek yogurt + almonds', 'Shake with water + 30 g walnuts · light cottage cheese (queso untable light) 200 g'],
  ['Fish 200 g', 'Salmon 200 g (2× a week) · tuna steak · chicken'],
  ['Broccoli', 'Asparagus, carrots, zucchini, spinach, green beans: anything green'],
];

export const SHOPPING = [
  { group: 'Protein', items: [
    ['chicken', 'Chicken breast', '1.8 kg raw (pechuga de pollo)'],
    ['fish', 'Fish', '1.2 kg hake/merluza + 600 g salmon'],
    ['eggs', 'Eggs', '3 dozen (or 14 eggs + 1 L carton of egg whites)'],
    ['yogurt', 'Greek yogurt, plain', '1.4 kg'],
    ['whey', 'Whey protein', '7 scoops (210 g)'],
    ['milk', 'Skim milk', '2 L'],
  ] },
  { group: 'Carbs', items: [
    ['oats', 'Oats', '700 g'],
    ['rice', 'Rice', '650 g raw (≈2 kg cooked)'],
    ['potato', 'Potatoes / sweet potatoes (papa / batata)', '2.5 kg'],
    ['bread', 'Whole-wheat bread', '1 loaf'],
    ['ricecakes', 'Rice cakes', '1 pack'],
    ['honey', 'Honey', '1 jar'],
    ['sports', 'Sports drink', '1 bottle (Saturday)'],
  ] },
  { group: 'Fruit & veg', items: [
    ['banana', 'Bananas', '18'],
    ['apple', 'Apples', '7'],
    ['veg', 'Vegetables for lunch', '1 kg (broccoli, zucchini, green beans)'],
    ['salad', 'Salad', '1 big bag of leaves, 4 tomatoes, 2 cucumbers, 2 lemons'],
  ] },
  { group: 'Fats & extras', items: [
    ['almonds', 'Almonds', '210 g'],
    ['oil', 'Olive oil', '250 ml'],
    ['spices', 'Spices', 'garlic, oregano, cumin, paprika, salt, pepper'],
  ] },
];

export const PREP = [
  'Sunday: grill or bake all the chicken, cook the rice and roast the potatoes for Monday to Wednesday.',
  'Wednesday: second batch for Thursday to Saturday. Cooked chicken and rice keep about 3–4 days in the fridge.',
  'Fish is best cooked fresh or the day before. Salmon in the oven takes 15 minutes.',
  'Portion into containers by day type: a Big day lunch has 350 g of rice, a Training day 250 g.',
];

export const RACE_FOOD = [
  'Last 2 days before a race: 6–8 g of carbs per kg (about 600–750 g a day). Double the rice or pasta, add white bread, juice and honey.',
  'Those 2 days: less fibre, fewer vegetables and less fat, so your stomach is light.',
  'Race morning, 3 hours before: about 190 g carbs (white rice or oats, banana, honey, white bread).',
  '60 min before: coffee or caffeine (~290 mg), only if you tried it in a simulation.',
  'During the race: a gel after the burpees (Run 5) and another on Run 7.',
];
