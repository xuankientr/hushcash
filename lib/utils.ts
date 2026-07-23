import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsdc(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isHandle(input: string): boolean {
  return /^@[a-zA-Z0-9_]{3,20}$/.test(input);
}

export function normalizeHandle(handle: string): string {
  return handle.startsWith("@") ? handle.slice(1) : handle;
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username) && !/^_|_$/.test(username);
}

const WORDS_A = ["swift","quiet","bold","bright","cool","dark","fast","calm","wild","sharp","clean","pure","free","raw","keen"];
const WORDS_B = ["fox","wave","star","bear","hawk","wolf","lynx","oak","pine","reef","jade","echo","nova","flux","sage"];

export function generateUsername(): string {
  const a = WORDS_A[Math.floor(Math.random() * WORDS_A.length)];
  const b = WORDS_B[Math.floor(Math.random() * WORDS_B.length)];
  const n = String(Math.floor(Math.random() * 9000) + 1000);
  return `${a}_${b}_${n}`;
}
