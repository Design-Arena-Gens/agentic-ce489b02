"use client";

import { SlotMachine } from "../components/SlotMachine";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slot-dark via-slot-light/70 to-slot-dark">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-slot-accent/20 via-transparent to-transparent blur-3xl" />
      <SlotMachine />
      <footer className="px-4 pb-8 text-center text-xs text-white/50">
        Crafted with React autoplay logic to help you prototype slot strategies.
      </footer>
    </main>
  );
}
