import { writable } from 'svelte/store';

export type Language = 'FR' | 'EN';
export const language = writable<Language>('FR');
