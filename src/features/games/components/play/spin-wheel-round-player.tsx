"use client";
import { useRef, useState } from "react";
import { Gift, Loader2, RotateCcw, Sparkles, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiErrorMessage } from "@/shared/lib/error-handler";
import { useRequireAuth } from "@/features/auth/hooks/use-require-auth";
import {
  useGetWheelQuery,
  useSpinWheelMutation,
  type PrizeRarity,
  type SpinResult,
  type WheelSlice,
} from "@/features/games/api/games-api";

const SPIN_MS = 4500;
const FULL_TURNS = 6;
const SIZE = 300;
const RADIUS = SIZE / 2;

// Alternating brand shades so neighbouring slices are always distinguishable.
const SLICE_COLOURS = ["#531342", "#7a2a63", "#a1457f", "#c86b9e"];
const SOLD_OUT_COLOUR = "#d4d4d8";

const RARITY_LABEL: Record<PrizeRarity, string | null> = {
  COMMON: null,
  RARE: "Rare",
  VERY_RARE: "Very rare",
};

interface SpinWheelRoundPlayerProps {
  roundId: string;
  sessionId?: string;
}

/**
 * Spin the wheel for a SPIN_WHEEL round. The server decides where it lands
 * (POST /spin); this component only animates to that slice, so nothing the
 * browser does can change the outcome.
 */
export function SpinWheelRoundPlayer({
  roundId,
  sessionId,
}: SpinWheelRoundPlayerProps) {
  const { data: wheel, isLoading, refetch } = useGetWheelQuery(roundId);
  const [spin, { isLoading: isRequesting }] = useSpinWheelMutation();
  const requireAuth = useRequireAuth();

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const pendingResult = useRef<SpinResult | null>(null);

  if (isLoading) {
    return <Skeleton className="mx-auto aspect-square w-full max-w-[300px] rounded-full" />;
  }
  if (!wheel) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        This wheel isn&apos;t available.
      </p>
    );
  }

  const slices = wheel.slices;
  const segment = 360 / slices.length;
  const isOpen = wheel.status === "ACTIVE" && wheel.sessionStatus === "ACTIVE";
  const spinsLeft = wheel.me?.spinsLeft ?? null;
  const prizesLeft = slices.some((s) => !s.isRetry && !s.isSoldOut);
  const busy = isSpinning || isRequesting;

  const handleSpin = async () => {
    if (!requireAuth({ tab: "games", ...(sessionId && { session: sessionId }), round: roundId })) {
      return;
    }
    setResult(null);
    try {
      const outcome = await spin(roundId).unwrap();
      const index = slices.findIndex((s) => s.id === outcome.slice.id);
      // Land the pointer (at the top) inside the chosen slice. The small
      // offset is cosmetic, so it doesn't always stop dead centre.
      const centre = index * segment + segment / 2;
      const jitter = (Math.random() - 0.5) * segment * 0.6;
      const target = (360 - centre - jitter + 360) % 360;
      setRotation((current) => {
        const settled = ((current % 360) + 360) % 360;
        const delta = (target - settled + 360) % 360;
        return current + FULL_TURNS * 360 + delta;
      });
      pendingResult.current = outcome;
      setIsSpinning(true);
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't spin. Please try again.");
    }
  };

  const handleSpinEnd = () => {
    if (!isSpinning) return;
    setIsSpinning(false);
    setResult(pendingResult.current);
    pendingResult.current = null;
    // Only now: refetching earlier would grey out a slice mid-spin.
    refetch();
  };

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {wheel.title && <p className="text-base font-semibold">{wheel.title}</p>}

      <div className="relative w-full max-w-[300px]">
        {/* Pointer */}
        <div className="absolute left-1/2 -top-1 z-10 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-foreground drop-shadow" />
        </div>

        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full drop-shadow-lg"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.65, 0.1, 1)`
              : "none",
          }}
          onTransitionEnd={handleSpinEnd}
          role="img"
          aria-label={`Prize wheel with ${slices.length} slices`}
        >
          {slices.map((slice, i) => (
            <WheelSliceShape
              key={slice.id}
              slice={slice}
              index={i}
              segment={segment}
              colour={
                slice.isSoldOut
                  ? SOLD_OUT_COLOUR
                  : SLICE_COLOURS[i % SLICE_COLOURS.length]
              }
            />
          ))}
          <circle cx={RADIUS} cy={RADIUS} r={18} fill="white" />
          <circle cx={RADIUS} cy={RADIUS} r={8} fill="#531342" />
        </svg>
      </div>

      {result && <SpinResultCard result={result} />}

      {!isOpen ? (
        <p className="text-sm text-muted-foreground">
          The wheel isn&apos;t open yet. The organizer will open it during the event.
        </p>
      ) : !prizesLeft ? (
        <p className="text-sm text-muted-foreground">
          All the prizes on this wheel have been won.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <Button
            size="lg"
            className="min-w-40 bg-[#531342] hover:bg-[#531342]/90 text-white"
            disabled={busy || spinsLeft === 0}
            onClick={handleSpin}
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {spinsLeft === 0 ? "No spins left" : "Spin"}
          </Button>
          {spinsLeft !== null && spinsLeft > 0 && (
            <p className="text-xs text-muted-foreground">
              {spinsLeft} {spinsLeft === 1 ? "spin" : "spins"} left
            </p>
          )}
          {wheel.me === null && (
            <p className="text-xs text-muted-foreground">
              Log in and check in at the event to spin.
            </p>
          )}
        </div>
      )}

      {wheel.me && wheel.me.wins.length > 0 && (
        <div className="w-full space-y-2">
          <p className="text-sm font-medium">Your prizes</p>
          {wheel.me.wins.map((win) => (
            <div
              key={win.rewardId}
              className="flex items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Gift className="h-4 w-4 shrink-0 text-[#531342]" />
                <span className="truncate text-sm">{win.title}</span>
              </div>
              {win.status === "FULFILLED" ? (
                <Badge variant="secondary">Collected</Badge>
              ) : (
                win.claimCode && (
                  <span className="font-mono text-sm font-semibold tracking-wider">
                    {win.claimCode}
                  </span>
                )
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Show the code to the organizer to collect your prize.
          </p>
        </div>
      )}
    </div>
  );
}

function WheelSliceShape({
  slice,
  index,
  segment,
  colour,
}: {
  slice: WheelSlice;
  index: number;
  segment: number;
  colour: string;
}) {
  // Angles measured clockwise from the top (12 o'clock).
  const start = index * segment;
  const end = start + segment;
  const point = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [RADIUS + r * Math.cos(rad), RADIUS + r * Math.sin(rad)];
  };
  const [x1, y1] = point(start, RADIUS);
  const [x2, y2] = point(end, RADIUS);
  const largeArc = segment > 180 ? 1 : 0;
  const path = `M ${RADIUS} ${RADIUS} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;

  const label = slice.isRetry ? "Retry" : (slice.title ?? "Prize");
  const short = label.length > 14 ? `${label.slice(0, 13)}…` : label;
  const tag = slice.isSoldOut ? "Gone" : RARITY_LABEL[slice.rarity];
  const textColour = slice.isSoldOut ? "#71717a" : "white";
  const mid = start + segment / 2;

  return (
    <g>
      <path d={path} fill={colour} stroke="white" strokeWidth={2} />
      {/* Text runs from near the centre out to the rim along the slice's middle. */}
      <g transform={`rotate(${mid} ${RADIUS} ${RADIUS})`}>
        <text
          x={RADIUS}
          y={RADIUS - RADIUS * 0.62}
          textAnchor="middle"
          fill={textColour}
          fontSize={sliceFontSize(segment)}
          fontWeight={600}
          style={{ textDecoration: slice.isSoldOut ? "line-through" : undefined }}
        >
          {short}
        </text>
        {tag && (
          <text
            x={RADIUS}
            y={RADIUS - RADIUS * 0.48}
            textAnchor="middle"
            fill={textColour}
            fontSize={9}
            fontWeight={700}
            letterSpacing={0.5}
          >
            {tag.toUpperCase()}
          </text>
        )}
        {slice.isRetry && !slice.isSoldOut && (
          <g transform={`translate(${RADIUS - 7} ${RADIUS - RADIUS * 0.42})`}>
            <RotateCcw width={14} height={14} color="white" />
          </g>
        )}
      </g>
    </g>
  );
}

/** Narrow slices (many prizes) get smaller text so labels don't overlap. */
function sliceFontSize(segment: number) {
  if (segment >= 60) return 13;
  if (segment >= 40) return 11;
  return 9;
}

function SpinResultCard({ result }: { result: SpinResult }) {
  if (result.slice.isRetry) {
    return (
      <div className="w-full rounded-xl border bg-muted/40 p-4 text-center">
        <RotateCcw className="mx-auto mb-2 h-6 w-6 text-[#531342]" />
        <p className="font-semibold">Retry!</p>
        <p className="text-sm text-muted-foreground">You get another spin.</p>
      </div>
    );
  }
  return (
    <div className="w-full rounded-xl border border-[#531342]/30 bg-[#531342]/5 p-4 text-center">
      <Ticket className="mx-auto mb-2 h-6 w-6 text-[#531342]" />
      <p className="text-sm text-muted-foreground">You won</p>
      <p className="text-lg font-semibold">{result.slice.title}</p>
      {result.reward?.claimCode && (
        <>
          <p className="mt-3 text-xs text-muted-foreground">Your claim code</p>
          <p className="font-mono text-2xl font-bold tracking-[0.2em] text-[#531342]">
            {result.reward.claimCode}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Show this to the organizer to collect your prize.
          </p>
        </>
      )}
    </div>
  );
}
