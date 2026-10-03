import atlasUrl from '../assets/atlas.png';
import frames from '../assets/atlas.json';

export type Frame = [number, number, number, number];
export const FRAMES = frames as unknown as Record<string, Frame>;
export let atlas: HTMLImageElement;

export async function loadAssets(): Promise<void> {
  atlas = new Image(); atlas.src = atlasUrl;
  await Promise.all([
    new Promise<void>((res, rej) => { atlas.onload = () => res(); atlas.onerror = () => rej(new Error('atlas failed to load')); }),
    document.fonts.load('10px PM10').catch(() => undefined),
  ]);
}
