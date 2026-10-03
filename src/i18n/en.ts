export type Page = ['b' | 'h', string];
export type ShopItem = [name: string, desc: string, price: number];

const en = {
  title: 'TAIHO!!', sub: 'Konbini Vigilante', start: 'START', lang: 'Language: English', tut: 'Tutorial: ', on: 'ON', off: 'OFF',
  sound: 'Sound: ', install: 'INSTALL APP', install_ios: 'On iPhone: tap Share, then "Add to Home Screen" to play fullscreen.',
  streak: 'STREAK {n}  ×{m}', streak_lost: 'Streak lost...', boss_wanted: 'WANTED: {n} just walked in!', boss_caught: 'BOSS DOWN! Triple reward!',
  boss_names: ['Mr. Sweaty', 'The Briefcase', 'Glasses Guy', 'Salaryman Zero'],
  goal_done: 'Goal clear! +¥{y}', daily: 'DAILY', daily_done: 'Daily bounty done! +¥{y}',
  goals: { catch3: 'Catch {t} pervs', fast: 'Catch one with 12s+ left', hop3: 'Hop 3 bags in one chase', smash2: 'Smash {t} boxes', boss: 'Catch a boss', ball: 'Catch one with a Capture Ball', streak3: '3 catches in a row', arena: 'Catch one in the back halls', daily: 'Catch {t} today' }, profile_line: 'Lv{l}   {c} career catches   ¥{y}', reset: 'Reset save', reset_confirm: 'Tap again to erase everything',
  keys: 'Arrows / WASD to move.  Z, Space, Enter = A.  X or Shift = B (throw).',
  hud_caught: 'CAUGHT', hud_lv: 'Lv', hud_timer: 'ESCAPE IN', hud_time: 'TIME',
  notyet: 'Not yet. Wait for the red mark.', caught: 'TAIHO!!', escaped: 'He got away...', levelup: 'LEVEL UP!',
  elev: 'Elevator unlocked!', bail: 'He noticed you!', heavy: 'Too heavy! Needs Strength {n}.', arena_open: 'The back halls are open!', smash: 'SMASH!', suit: 'Vigilante suit unlocked!',
  pick_title: 'Level up! Choose a stat', stat: ['Speed', 'Detection', 'Strength'],
  statd: ['Move faster', 'See marks from further', 'Break boxes in a chase'], confirm: 'CHOOSE',
  end_title: '{m} cleared!', end_body: 'The elevator goes up to the {m}.\nBigger floor, more pervs, heavier obstacles.', end_body_last: 'Top floor for now. The elevator\nreshuffles the aisles.', end_btn: 'NEXT FLOOR', locked: 'locked', maps_title: 'Jump to',
  stats: 'Caught {c}   Escaped {e}   Level {l}', floor_toast: 'Floor {n}: {m}. New layout!',
  bonsai: 'BONSAI', hero: 'HERO',
  mode_time: 'TIME ATTACK  90s', rank: 'RANKING', res_title: "Time's up!", res_body: 'Caught {c} in 90 seconds', name_ph: 'Your name', submit: 'SUBMIT',
  board_local: 'Ranking on this device', board_shared: 'Shared ranking', board_empty: 'No scores yet. Be the first.', saved: 'Saved!', again: 'PLAY AGAIN', back: 'TITLE', close: 'CLOSE',
  shop_title: 'Konbini Register', buy: 'BUY', owned: 'Have', shop_hint: 'Items are used automatically on your next chase. Throw a Capture Ball with B.',
  costumes: ['Civilian', 'Masked', 'Caped', 'Vigilante', 'Gold Vigilante'], costume_toast: 'New look: {c}!',
  broke: 'Not enough yen.', bought: 'Thanks for shopping!', used_juice: 'Auto-Jump active!', used_vita: 'Vita Dash active!', no_ball: 'No Capture Balls. Buy them at the register.', ball_hit: 'BALL HIT!', reward: '+¥{y}',
  items: [
    ['Capture Ball', 'Throw it with B during a chase. A hit is an instant catch.', 1000],
    ['Auto-Jump Juice', 'Next chase: you hop bags automatically.', 500],
    ['Vita Dash 1000', 'Next chase: 50% faster for the whole chase.', 300],
  ] as ShopItem[],
  t1: [['b', "Welcome to your first shift.\nI'm Bonsai, your assistant."], ['b', 'Try not to embarrass us.\nUse the arrows to walk around.'], ['h', 'Justice never checks out.'], ['b', 'Okay.']] as Page[],
  t2: [['b', 'Good, you can walk.\nLegs are important for this job.']] as Page[],
  t3: [['b', "See that guy coming in?\nHe's not here for onigiri."], ['b', 'Watch the mark over his head.']] as Page[],
  t4: [['b', "Eye mark means he's picking a target.\nNot yet. We need proof."]] as Page[],
  t5: [['b', "Phone's out. Get close,\nbut don't touch him. Almost."]] as Page[],
  t6: [['b', "Red mark. He's recording. Close in!\nHe'll bolt when you get near."]] as Page[],
  t7: [['b', "He's running! 20 seconds. Run into him\nor press A beside him. A hops bags."]] as Page[],
  t8: [['b', 'Not bad. One down.\nCatch five and the elevator opens.'], ['b', 'Fast catches pay more yen.\nSpend it at the register. Press A there.'], ['h', 'Another shopper, safe.'], ['b', 'Okay.']] as Page[],
  t9: [['b', 'Pick a stat. Speed, Detection,\nor Strength.'], ['b', "Choose wisely. Or don't.\nI'm not your mom."]] as Page[],
  tf: [['b', 'He got away. Happens to everyone.\nMostly you, so far.'], ['b', 'Here comes another one.\nWait for the red mark this time.']] as Page[],
};
export default en;
export type Strings = typeof en;
