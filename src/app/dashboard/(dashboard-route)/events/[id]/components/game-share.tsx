import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Copy,
  Twitter,
  MessageCircle,
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { errorHandler } from "@/utils/errorHandler";

interface GameScoreShareProps {
  gameName: string;
  score: number;
  rank: number;
  totalPlayers: number;
  eventName?: string;
  gameType?: string;
  onClose?: () => void;
}

export function GameScoreShare({
  gameName,
  score,
  rank,
  totalPlayers,
  eventName,
}: GameScoreShareProps) {
  const [copied, setCopied] = useState(false);

  const getRankIcon = () => {
    if (rank === 1) return <Crown className="h-8 w-8 text-amber-500" />;
    if (rank === 2) return <Medal className="h-8 w-8 text-gray-400" />;
    if (rank === 3) return <Medal className="h-8 w-8 text-amber-700" />;
    return <Trophy className="h-8 w-8 text-primary" />;
  };

  const getRankEmoji = () => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏆";
  };

  const getShareText = () => {
    const emoji = getRankEmoji();
    return `${emoji} I just scored ${score.toLocaleString()} points and ranked #${rank} of ${totalPlayers} in "${gameName}"${
      eventName ? ` at ${eventName}` : ""
    }! Can you beat my score? 🎮\n\n#NextVibe #Gaming`;
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${getShareText()}\n\n${shareUrl}`);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      toast.error("Failed to copy", err);
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      getShareText()
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `${getShareText()}\n\n${shareUrl}`
    )}`;
    window.open(url, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I scored ${score} in ${gameName}!`,
          text: getShareText(),
          url: shareUrl,
        });
      } catch (err: any) {
        console.log("Share failed:", err);
        errorHandler(err)
        // User cancelled or error
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-2 border-primary/20 bg-linear-to-br from-primary/10 via-accent/5 to-primary/10">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent">
              {getRankIcon()}
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold text-foreground mb-1">
            {score.toLocaleString()}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">points scored</p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge
              variant="secondary"
              className={cn(
                "text-sm px-3 py-1",
                rank === 1 && "bg-amber-500/20 text-amber-600",
                rank === 2 && "bg-gray-400/20 text-gray-600",
                rank === 3 && "bg-amber-700/20 text-amber-700"
              )}
            >
              {getRankEmoji()} Rank #{rank} of {totalPlayers}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{gameName}</p>
            {eventName && <p>{eventName}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-center">
          Share Your Score
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 rounded-xl"
            onClick={handleShareTwitter}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DA1F2]/10">
              <Twitter className="h-5 w-5 text-[#1DA1F2]" />
            </div>
            <span className="text-sm">Twitter</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 rounded-xl"
            onClick={handleShareWhatsApp}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
            </div>
            <span className="text-sm">WhatsApp</span>
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 rounded-xl"
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>

        {typeof navigator !== "undefined" &&
          typeof navigator.share === "function" && (
            <Button
              className="w-full gap-2 rounded-xl"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
      </div>

      <Card className="bg-linear-to-r from-accent/10 to-primary/10 border-accent/20">
        <CardContent className="p-4 text-center">
          <Sparkles className="h-6 w-6 mx-auto mb-2 text-accent" />
          <p className="font-medium text-foreground text-sm">
            Challenge your friends!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Share this link and see if they can beat your score
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
