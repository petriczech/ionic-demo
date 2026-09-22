export type AchievementKind = 'count' | 'tempo';

export type BadgeShape = 'circle' | 'shield' | 'hex' | 'rosette';

export interface Rank {
  at: number;
  label: string;
}

export interface Achievement {
  id: string;
  label: string;
  kind: AchievementKind;
  at: number;
  shape: BadgeShape;
  color: string;
  /* Secret badges stay unnamed on the board until they are earned. */
  secret?: boolean;
}

/*
 * The taunt ladder, running from brushing you off, through grudging respect, to
 * worrying about your health - the way the genre tends to. The stamp shows the
 * last rank passed, so they land often early on and then thin out.
 */
export const RANKS: readonly Rank[] = [
  { at: 0, label: 'no tak, zmáčkni to' },
  { at: 3, label: 'to byly tři' },
  { at: 8, label: 'rozjíždíš se' },
  { at: 15, label: 'ruka ještě drží' },
  { at: 25, label: 'tohle už je koníček' },
  { at: 40, label: 'normální člověk by skončil' },
  { at: 60, label: 'sousedi slyší ťukání' },
  { at: 85, label: 'displej má otisk' },
  { at: 120, label: 'prst hlásí přetížení' },
  { at: 160, label: 'venku je hezky, jen tak mimochodem' },
  { at: 220, label: 'tohle už nikomu neříkej' },
  { at: 300, label: 'mozek se vypnul, ruka jede' },
  { at: 400, label: 'kdo tě k tomu nutí?' },
  { at: 550, label: 'prst podal výpověď' },
  { at: 700, label: 'rodina se ptá, kde jsi' },
  { at: 900, label: 'tohle je životní styl' },
  { at: 1200, label: 'už si ani nepamatuješ proč' },
  { at: 1600, label: 'tlačítko tě přežije' },
  { at: 2200, label: 'sbohem, světe' },
  { at: 3000, label: 'legenda. nebo diagnóza.' }
];

/* Every clicker eventually accuses you of cheating. Kept as a badge rather than
 * a stamp so nothing flickers as the rate crosses the threshold back and forth. */
export const autoclickerTempo = 9;

/* The plain ones: milestones on the counter, each reusing its rank label. */
export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'rozjezd', label: 'rozjíždíš se', kind: 'count', at: 8, shape: 'rosette', color: '#b9e4d0' },
  { id: 'konicek', label: 'tohle už je koníček', kind: 'count', at: 25, shape: 'circle', color: '#c9e6a8' },
  { id: 'normalni', label: 'normální člověk by skončil', kind: 'count', at: 40, shape: 'shield', color: '#a9d4f2' },
  { id: 'otisk', label: 'displej má otisk', kind: 'count', at: 85, shape: 'hex', color: '#c9bcf0' },
  { id: 'venku', label: 'venku je hezky, jen tak mimochodem', kind: 'count', at: 160, shape: 'rosette', color: '#f7e5a8' },
  { id: 'mozek', label: 'mozek se vypnul, ruka jede', kind: 'count', at: 300, shape: 'circle', color: '#f9cca4' },
  { id: 'vypoved', label: 'prst podal výpověď', kind: 'count', at: 550, shape: 'shield', color: '#f6abb6' },
  { id: 'proc', label: 'už si ani nepamatuješ proč', kind: 'count', at: 1200, shape: 'hex', color: '#e7c6f0' },
  { id: 'legenda', label: 'legenda. nebo diagnóza.', kind: 'count', at: 3000, shape: 'rosette', color: '#a9e4e0' },

  /* Secret ones. Nothing about them shows on the board until they land. */
  { id: 'autoklikr', label: 'autoklikr', kind: 'tempo', at: autoclickerTempo, shape: 'hex', color: '#c9e6a8', secret: true }
];
