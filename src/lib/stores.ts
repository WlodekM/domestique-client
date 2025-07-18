import { type Writable, writable } from "svelte/store"
import type { User } from "./domestique.ts/client.ts";

export const page = writable("login")
export const showNavbar = writable(false)
export const mentionUserCache: Writable<Record<string, User|null>> = writable({});
