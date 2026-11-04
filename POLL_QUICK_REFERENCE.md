# Poll Game Type - Quick Reference

## For Developers

### Adding a Poll Round

```typescript
// In game creation wizard, select "Poll" as game type
const pollRound = {
  gameType: "POLL",
  title: "Event Preferences Survey",
  config: {
    questions: [
      {
        text: "Which day works best for you?",
        options: ["Friday", "Saturday", "Sunday"],
        timeLimitSecs: 20,
        points: 0 // Always 0 for polls
      }
    ]
  },
  rewardTiers: [] // No rewards for polls
};
```

### Voting on a Poll

```typescript
// Use existing answer endpoint
const response = await answerQuestion({
  roundId: "round-uuid",
  questionIndex: 0,
  answer: 2 // Option index (0-based)
});
```

### Fetching Poll Results

```typescript
import { useGetPollResultsQuery } from "@/features/games/api/games-api";

const { data: pollResults } = useGetPollResultsQuery(roundId);

// Response structure:
{
  revealed: true, // Results visible?
  totalVotes: 142,
  questions: [{
    text: "Which day works best?",
    options: ["Friday", "Saturday", "Sunday"],
    counts: [
      { optionIndex: 0, label: "Friday", votes: 48, percentage: 33.8 },
      { optionIndex: 1, label: "Saturday", votes: 54, percentage: 38.0 },
      { optionIndex: 2, label: "Sunday", votes: 40, percentage: 28.2 }
    ],
    userVote: 1, // User voted for "Saturday"
    revealed: true
  }]
}
```

## Key Differences from Other Game Types

| Feature | Trivia | Poll |
|---------|--------|------|
| Scoring | ✅ Yes | ❌ No (always 0) |
| Correct Answer | ✅ Required | ❌ Not allowed |
| Leaderboard | ✅ Yes | ❌ No |
| Results Display | Score/Rank | Vote counts |
| Answer Validation | Check if correct | Record vote only |
| Reward Tiers | ✅ Allowed | ❌ Empty array |

## Components Used

### Creation
- `src/features/games/components/create/game-creation-wizard.tsx`
- `src/features/games/components/create/steps/step-three.tsx`

### Playing
- `src/features/games/components/play/poll-round-player.tsx` - Voting UI
- `src/features/games/components/play/poll-results-display.tsx` - Results display
- `src/features/games/components/play/event-game-tab.tsx` - Integration

## Validation Rules

```typescript
// ✅ VALID
{
  text: "Pick your favorite",
  options: ["Option A", "Option B"], // Min 2
  timeLimitSecs: 20,
  points: 0
}

// ❌ INVALID - Only 1 option
{
  text: "Pick your favorite",
  options: ["Option A"], // Must have at least 2
}

// ❌ INVALID - Has correctAnswerIndex
{
  text: "Pick your favorite",
  options: ["Option A", "Option B"],
  correctAnswerIndex: 0, // Not allowed for polls
}
```

## Common Tasks

### Check if Round is Poll
```typescript
const isPoll = gameType === "poll";
```

### Hide Leaderboard for Polls
```typescript
{gameType !== "poll" && <Leaderboard />}
```

### Show Results Only When Revealed
```typescript
{pollResults?.revealed ? (
  <PollResultsDisplay questions={pollResults.questions} />
) : (
  <p>Vote to see results</p>
)}
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/game-rounds/:id/answer` | Submit vote |
| GET | `/v1/game-rounds/:id/poll-results` | Get results |

## TypeScript Types

```typescript
// Poll question data
export type PollQuestionData = {
  text: string;
  options: string[];
  timeLimitSecs: number;
  points: number; // Always 0
}

// Game type
export type GameType = 'trivia' | 'wordPuzzle' | 'thisOrThat' | 
                       'twoTruthsOneLie' | 'bingo' | 'spinTheWheel' | 'poll';

// API game type
export type ApiGameType = "TRIVIA" | "WORD_PUZZLE" | "TWO_TRUTHS_ONE_LIE" | 
                          "THIS_OR_THAT" | "FEEDBACK" | "SPIN_WHEEL" | "POLL";
```

## Icons & UI

```typescript
// Icon
import { BarChart3 } from "lucide-react";
<BarChart3 className="h-5 w-5" />

// Label
"Poll"

// Description
"Vote on questions, see aggregated results"
```

## Testing Checklist

- [ ] Can create poll with 2+ options
- [ ] Cannot create poll with < 2 options
- [ ] Voting works correctly
- [ ] UI locks after first vote
- [ ] Results hidden before voting
- [ ] Results shown after voting
- [ ] User vote is highlighted
- [ ] Percentages calculate correctly
- [ ] No leaderboard shown
- [ ] No score displayed

## Troubleshooting

**Problem:** Results not showing after voting
- Check `revealed` flag in API response
- Verify user has actually voted
- Check if round has ended

**Problem:** Validation error on creation
- Ensure at least 2 options per question
- Verify all options have non-empty text
- Check that `correctAnswerIndex` is NOT set

**Problem:** TypeScript errors
- Import types from `@/features/games/types`
- Use `GameType` union, not string
- Check API response types match implementation

## Related Documentation
- [POLL_IMPLEMENTATION_GUIDE.md](./POLL_IMPLEMENTATION_GUIDE.md) - Full implementation details
- [POLL_IMPLEMENTATION_SUMMARY.md](./POLL_IMPLEMENTATION_SUMMARY.md) - Implementation status
- Original spec: "Poll Game Frontend Implementation Guide" (PDF)
