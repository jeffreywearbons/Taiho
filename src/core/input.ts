export type Dir = 'up' | 'down' | 'left' | 'right';
export const held: Record<Dir, boolean> = { up: false, down: false, left: false, right: false };
/** Directions in the order they were pressed, newest last, so a turn pressed while walking wins at the next tile. */
const order: Dir[] = [];
export function press(d: Dir): void { held[d] = true; const i = order.indexOf(d); if (i >= 0) order.splice(i, 1); order.push(d); }
export function release(d: Dir): void { held[d] = false; const i = order.indexOf(d); if (i >= 0) order.splice(i, 1); }
/** Held directions, newest first. */
export const heldDirs = (): Dir[] => [...order].reverse().filter((d) => held[d]);
let aPressed = false, bPressed = false, selPressed = false;
export const consumeSel = (): boolean => { const v = selPressed; selPressed = false; return v; };
let tapDir: Dir | null = null;
/** A tap on the pad shorter than a frame still yields one step. */
export const consumeTap = (): Dir | null => { const v = tapDir; tapDir = null; return v; };

export const consumeA = (): boolean => { const v = aPressed; aPressed = false; return v; };
export const consumeB = (): boolean => { const v = bPressed; bPressed = false; return v; };
export const clearPresses = (): void => { aPressed = false; bPressed = false; };
export const pressA = (): void => { aPressed = true; };

/** While a menu is open the d-pad, A and B drive the menu instead of the hero. ui/nav.ts fills this in. */
export const menu: { active: () => boolean; dir: (d: Dir) => void; a: () => void; b: () => void } = { active: () => false, dir: () => undefined, a: () => undefined, b: () => undefined };

const KEY_DIR: Record<string, Dir> = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
const KEY_A = ['KeyZ', 'Space', 'Enter', 'KeyJ'];
const KEY_B = ['KeyX', 'ShiftLeft', 'ShiftRight', 'KeyK'];
const KEY_SEL = ['KeyC', 'Tab', 'KeyL'];

export function initKeyboard(onDigit?: (n: number) => void): void {
  window.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
    if (menu.active()) {
      const md = KEY_DIR[e.code];
      if (md && !e.repeat) { menu.dir(md); e.preventDefault(); return; }
      if (KEY_A.includes(e.code)) { if (!e.repeat) menu.a(); e.preventDefault(); return; }
      if (KEY_B.includes(e.code)) { if (!e.repeat) menu.b(); e.preventDefault(); return; }
    }
    const d = KEY_DIR[e.code]; if (d) { if (!e.repeat) press(d); e.preventDefault(); }
    if (KEY_A.includes(e.code)) { if (!e.repeat) aPressed = true; e.preventDefault(); }
    if (KEY_B.includes(e.code)) { if (!e.repeat) bPressed = true; e.preventDefault(); }
    if (KEY_SEL.includes(e.code)) { if (!e.repeat) selPressed = true; e.preventDefault(); }
    if (onDigit && /^Digit[1-3]$/.test(e.code)) onDigit(Number(e.code.slice(5)) - 1);
  });
  window.addEventListener('keyup', (e) => { const d = KEY_DIR[e.code]; if (d) release(d); });
  window.addEventListener('blur', () => { for (const k of Object.keys(held) as Dir[]) release(k); });
}

/** Touch pad: hold-to-move buttons. Each button tracks its own pointer so two thumbs work. */
export function bindPad(el: HTMLElement, what: Dir | 'a' | 'b' | 'sel'): void {
  const on = (e: PointerEvent) => {
    e.preventDefault(); el.setPointerCapture?.(e.pointerId); el.classList.add('on');
    if (menu.active()) { if (what === 'a') menu.a(); else if (what === 'b') menu.b(); else if (what !== 'sel') menu.dir(what); return; }
    if (what === 'a') aPressed = true; else if (what === 'b') bPressed = true; else if (what === 'sel') selPressed = true; else { press(what); tapDir = what; }
  };
  const off = (e: PointerEvent) => { e.preventDefault(); if (what !== 'a' && what !== 'b' && what !== 'sel') release(what); el.classList.remove('on'); };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

/** Slide-over d-pad: moving a held pointer across the pad changes direction without lifting. */
export function bindDpadSlide(pad: HTMLElement, buttons: Record<Dir, HTMLElement>): void {
  const dirAt = (x: number, y: number): Dir | null => {
    for (const d of Object.keys(buttons) as Dir[]) { const r = buttons[d].getBoundingClientRect(); if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) return d; }
    return null;
  };
  let active: Dir | null = null;
  const set = (d: Dir | null) => { if (d) tapDir = d; if (d === active) return; if (active) { release(active); buttons[active].classList.remove('on'); } active = d; if (d) { press(d); buttons[d].classList.add('on'); } };
  pad.addEventListener('pointerdown', (e) => { e.preventDefault(); pad.setPointerCapture?.(e.pointerId); const d = dirAt(e.clientX, e.clientY); if (menu.active()) { if (d) { menu.dir(d); buttons[d].classList.add('on'); setTimeout(() => buttons[d].classList.remove('on'), 120); } return; } set(d); });
  pad.addEventListener('pointermove', (e) => { if (active !== null || (e.buttons & 1)) set(dirAt(e.clientX, e.clientY)); });
  const end = (e: PointerEvent) => { e.preventDefault(); set(null); };
  pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
  pad.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function haptic(ms: number): void { try { navigator.vibrate?.(ms); } catch { /* unsupported */ } }
