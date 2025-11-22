/* eslint-disable @next/next/no-img-element */
"use client";

import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SpinOutcome = {
  symbols: string[];
  winType: "jackpot" | "double" | "single" | "loss";
  payout: number;
  timestamp: number;
};

type SlotStats = {
  spins: number;
  wins: number;
  jackpots: number;
  balance: number;
  profit: number;
};

const REEL_COUNT = 3;
const SPIN_COST = 2;
const symbols = ["🍒", "🔔", "💎", "7️⃣", "🍋", "⭐", "🍀", "🍇"];

const payoutTable: Record<SpinOutcome["winType"], number> = {
  loss: 0,
  single: 4,
  double: 12,
  jackpot: 48
};

const initialSymbols = () =>
  Array.from({ length: REEL_COUNT }, () => symbols[Math.floor(Math.random() * symbols.length)]);

export function SlotMachine() {
  const [currentSymbols, setCurrentSymbols] = useState<string[]>(() => initialSymbols());
  const [history, setHistory] = useState<SpinOutcome[]>([]);
  const [stats, setStats] = useState<SlotStats>({
    spins: 0,
    wins: 0,
    jackpots: 0,
    balance: 200,
    profit: 0
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoDelay, setAutoDelay] = useState(750);
  const spinLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculatedWinRate = useMemo(() => {
    if (!stats.spins) return 0;
    return Math.round((stats.wins / stats.spins) * 100);
  }, [stats.spins, stats.wins]);

  const determineOutcome = useCallback((finalSymbols: string[]): SpinOutcome => {
    const uniqueCount = new Set(finalSymbols).size;
    let winType: SpinOutcome["winType"] = "loss";

    if (uniqueCount === 1) {
      winType = "jackpot";
    } else if (uniqueCount === 2) {
      winType = "double";
    } else if (finalSymbols.includes("7️⃣")) {
      winType = "single";
    }

    return {
      symbols: finalSymbols,
      winType,
      payout: payoutTable[winType],
      timestamp: Date.now()
    };
  }, []);

  const performSpin = useCallback(async () => {
    if (isSpinning || stats.balance < SPIN_COST) {
      if (stats.balance < SPIN_COST) {
        setAutoPlay(false);
      }
      return;
    }

    setIsSpinning(true);
    setStats((prev) => ({
      ...prev,
      spins: prev.spins + 1,
      balance: prev.balance - SPIN_COST,
      profit: prev.profit - SPIN_COST
    }));

    const frameCount = 26;
    const frameDelay = 45;

    await new Promise<void>((resolve) => {
      let currentFrame = 0;
      const spinId = setInterval(() => {
        currentFrame += 1;
        setCurrentSymbols(() =>
          Array.from({ length: REEL_COUNT }, () => symbols[Math.floor(Math.random() * symbols.length)])
        );

        if (currentFrame >= frameCount) {
          clearInterval(spinId);
          resolve();
        }
      }, frameDelay);
    });

    const finalSymbols = Array.from(
      { length: REEL_COUNT },
      () => symbols[Math.floor(Math.random() * symbols.length)]
    );
    setCurrentSymbols(finalSymbols);

    const outcome = determineOutcome(finalSymbols);
    setHistory((prev) => [outcome, ...prev].slice(0, 25));

    setStats((prev) => ({
      ...prev,
      balance: prev.balance + outcome.payout,
      profit: prev.profit + outcome.payout,
      wins: prev.wins + (outcome.winType === "loss" ? 0 : 1),
      jackpots: prev.jackpots + (outcome.winType === "jackpot" ? 1 : 0)
    }));

    setIsSpinning(false);
  }, [determineOutcome, isSpinning, stats.balance]);

  useEffect(() => {
    if (spinLoopRef.current) {
      clearTimeout(spinLoopRef.current);
      spinLoopRef.current = null;
    }

    if (!autoPlay) return;
    if (isSpinning) return;
    if (stats.balance < SPIN_COST) {
      setAutoPlay(false);
      return;
    }

    spinLoopRef.current = setTimeout(() => {
      void performSpin();
    }, autoDelay);

    return () => {
      if (spinLoopRef.current) {
        clearTimeout(spinLoopRef.current);
        spinLoopRef.current = null;
      }
    };
  }, [autoPlay, autoDelay, isSpinning, performSpin, stats.balance]);

  const handleAutoToggle = (state: boolean) => {
    if (state && stats.balance < SPIN_COST) return;
    setAutoPlay(state);
  };

  const resetGame = () => {
    setAutoPlay(false);
    setHistory([]);
    setStats({
      spins: 0,
      wins: 0,
      jackpots: 0,
      balance: 200,
      profit: 0
    });
  };

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-slot-accent drop-shadow">Auto Slot Engine</h1>
        <p className="mt-2 text-slot-accent/80">
          Smart autoplay slot simulator with bankroll tracking and live statistics.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slot-light/80 p-8 shadow-xl backdrop-blur">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slot-accent/40 bg-slot-dark/60 p-6 shadow-inner">
            {currentSymbols.map((symbol, index) => (
              <div
                key={`${symbol}-${index}`}
                className={classNames(
                  "flex h-32 items-center justify-center rounded-xl border-4 border-slot-accent/30 bg-slot-light text-6xl transition-all",
                  isSpinning && "animate-glow"
                )}
              >
                <span>{symbol}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => void performSpin()}
              disabled={isSpinning || stats.balance < SPIN_COST}
              className={classNames(
                "rounded-xl bg-slot-accent px-6 py-3 text-lg font-semibold text-slot-dark transition-colors duration-150",
                "hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slot-accent",
                (isSpinning || stats.balance < SPIN_COST) && "cursor-not-allowed opacity-60"
              )}
            >
              {isSpinning ? "Spinning..." : "Spin"}
            </button>
            <button
              type="button"
              onClick={() => handleAutoToggle(true)}
              disabled={autoPlay || stats.balance < SPIN_COST}
              className={classNames(
                "rounded-xl border border-slot-accent px-6 py-3 text-lg font-semibold text-slot-accent transition",
                "hover:bg-slot-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slot-accent",
                (autoPlay || stats.balance < SPIN_COST) && "cursor-not-allowed opacity-50"
              )}
            >
              Start Auto
            </button>
            <button
              type="button"
              onClick={() => handleAutoToggle(false)}
              disabled={!autoPlay}
              className={classNames(
                "rounded-xl border border-slot-danger px-6 py-3 text-lg font-semibold text-slot-danger transition",
                "hover:bg-slot-danger/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slot-danger",
                !autoPlay && "cursor-not-allowed opacity-50"
              )}
            >
              Stop Auto
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-slot-dark/40 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Auto spin delay</span>
              <span className="font-semibold text-slot-accent">{autoDelay} ms</span>
            </div>
            <input
              type="range"
              min={300}
              max={2000}
              step={50}
              value={autoDelay}
              onChange={(event) => setAutoDelay(Number(event.target.value))}
              className="h-2 rounded-full bg-slot-light accent-slot-accent"
            />
            <p className="text-xs text-white/50">
              Tune how aggressive the autoplay is. Lower values spin faster but can drain your bankroll more quickly.
            </p>
          </div>

          <button
            type="button"
            onClick={resetGame}
            className="w-full rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/5"
          >
            Reset session
          </button>
        </div>

        <aside className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slot-light/80 p-6 shadow-xl backdrop-blur">
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold text-slot-accent">Session Stats</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <StatBadge label="Balance" value={`${stats.balance} credits`} tone="accent" />
              <StatBadge
                label="Profit"
                value={`${stats.profit >= 0 ? "+" : "-"}${Math.abs(stats.profit)} credits`}
                tone={stats.profit >= 0 ? "success" : "danger"}
              />
              <StatBadge label="Total Spins" value={stats.spins} />
              <StatBadge label="Win Rate" value={`${calculatedWinRate}%`} />
              <StatBadge label="Wins" value={stats.wins} />
              <StatBadge label="Jackpots" value={stats.jackpots} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slot-dark/40 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Payout Table</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li className="flex items-center justify-between rounded-lg bg-slot-dark/60 px-3 py-2">
                <span>Jackpot (3 matching)</span>
                <span className="font-semibold text-slot-accent">+{payoutTable.jackpot}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-slot-dark/60 px-3 py-2">
                <span>Lucky Streak (two matching)</span>
                <span className="font-semibold text-slot-accent">+{payoutTable.double}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-slot-dark/60 px-3 py-2">
                <span>Lucky Seven combo</span>
                <span className="font-semibold text-slot-accent">+{payoutTable.single}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-slot-dark/60 px-3 py-2">
                <span>Spin cost</span>
                <span className="font-semibold text-slot-danger">-{SPIN_COST}</span>
              </li>
            </ul>
          </div>

          <div className="flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slot-dark/40">
            <h3 className="border-b border-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white/70">
              Recent Spins
            </h3>
            <div className="flex h-64 flex-col divide-y divide-white/5 overflow-y-auto">
              {history.length === 0 ? (
                <p className="px-4 py-6 text-sm text-white/50">
                  Start spinning to build your history. Autoplay mode is great for running experiments!
                </p>
              ) : (
                history.map((spin) => (
                  <div
                    key={spin.timestamp}
                    className="flex items-center justify-between px-4 py-3 text-sm text-white/90"
                  >
                    <span className="text-lg">{spin.symbols.join(" ")}</span>
                    <span
                      className={classNames(
                        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                        spin.winType === "loss" && "bg-white/5 text-white/60",
                        spin.winType === "single" && "bg-slot-accent/10 text-slot-accent",
                        spin.winType === "double" && "bg-slot-success/10 text-slot-success",
                        spin.winType === "jackpot" && "bg-slot-accent text-slot-dark"
                      )}
                    >
                      {spin.winType === "loss" ? "Loss" : `${spin.winType} +${spin.payout}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

type StatBadgeProps = {
  label: string;
  value: string | number;
  tone?: "accent" | "success" | "danger";
};

const badgeToneMap: Record<Required<StatBadgeProps>["tone"], string> = {
  accent: "border-slot-accent/50 bg-slot-accent/10 text-slot-accent",
  success: "border-slot-success/50 bg-slot-success/10 text-slot-success",
  danger: "border-slot-danger/50 bg-slot-danger/10 text-slot-danger"
};

function StatBadge({ label, value, tone = "accent" }: StatBadgeProps) {
  return (
    <div
      className={classNames(
        "flex flex-col gap-1 rounded-xl border p-3 shadow-inner shadow-black/10",
        tone ? badgeToneMap[tone] : badgeToneMap.accent
      )}
    >
      <span className="text-xs uppercase tracking-wide text-white/60">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
