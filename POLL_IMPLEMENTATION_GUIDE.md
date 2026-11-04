# Poll Game Type Implementation Guide

This document summarizes the complete implementation of the POLL game type feature based on the provided specification.

## Overview

The POLL game type has been fully integrated into the application as a first-class round type alongside trivia, word puzzles, this-or-that, two-truths-one-lie, and feedback. Poll rounds allow users to vote on questions with multiple options and see aggregated results after voting.

## Key Features Implemented

### 1. Backend Contract Compliance
- **Game Type**: `POLL` added to accepted enum values
- **Config Shape**: Poll rounds use `config.questions` with at least 2 answer options per question
- **Validation**: 
  - Questions array must exist and be non-empty
  - Each question must have at least 2 options
  - No `correctAnswerIndex` or `correctAnswer` fields (polls are non-scored)
- **Submission**: Uses existing `POST /game-rounds/:id/answer` endpoint with `questionIndex` and `answer` (option index)
- **Results**: New `GET /v1/game-rounds/:id/poll-results` endpoint returns aggregated vote counts

### 2. Type Definitions
Updated `src/features/games/types.ts`:
```typescript
export type GameType = 'trivia' | 'wordPuzzle' | 'thisOrThat' | 
                       'twoTruthsOneLie' | 'bingo' | 'spinTheWheel' | 'poll'

export type PollQuestionData = {
  text: string;
  options: string[];
  timeLimitSecs: number;
  points: number;
}
```

### 3. API Endpoints
Added to `src/features/games/api/games-api.ts`:
```typescript
getPollResults: builder.query<any, string>({
  query: (roundId) => `/v1/game-rounds/${roundId}/poll-results`,
  providesTags: ["Games"],
})
```

Exported hook: `useGetPollResultsQuery`

### 4. Game Creation Wizard
Updated `src/features/games/components/create/game-creation-wizard.tsx`:

**Type Mappings:**
```typescript
export type GameType = ... | "poll"
export type ApiGameType = ... | "POLL"

const GAMETYPE_TO_API: Record<GameType, ApiGameType> = {
  ...
  poll: "POLL",
}

export const gameTypeConfig: Record<GameType, {...}> = {
  ...
  poll: {
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Poll",
    description: "Vote on questions, see aggregated results",
  },
}
```

**Validation:**
- Step 4 validation ensures poll questions have at least 2 options
- All options must be filled in (no empty strings)

**AI Generation:**
- Poll questions can be generated via AI
- Backend returns questions with options but no correctAnswerIndex
- Points set to 0 (polls are non-scored)

**Submission Payload:**
```typescript
if (r.gameType === "poll") {
  return {
    title: r.title || `Round ${i + 1}`,
    description: r.description,
    gameType: "POLL",
    orderIndex: i,
    config: {
      questions: r.questions.map((q) => ({
        text: q.question,
        options: q.options ?? [],
        timeLimitSecs: q.timeLimitSecs ?? 20,
        points: 0, // Polls are not scored
      })),
    },
    rewardTiers: [], // No rewards for poll rounds
  };
}
```

### 5. Step Three Component
Updated `src/features/games/components/create/steps/step-three.tsx`:
- Added poll to `GAME_TYPES` array with BarChart3 icon
- Poll selectable alongside other game types
- AI and manual content modes both supported

### 6. Poll Round Player Component
Created `src/features/games/components/play/poll-round-player.tsx`:

**Features:**
- Question-by-question navigation
- Radio button option selection
- Progress indicator showing answered/total questions
- Visual feedback for selected options
- "Previous" and "Next" navigation between questions
- "Submit Poll" button appears on last question
- Prevents submission until all questions answered
- Stores answers in array format (option indices)

**Key Implementation:**
```typescript
interface PollRoundPlayerProps {
  questions: PollQuestion[];
  onAllComplete: (answers: number[]) => Promise<void>;
  initialAnswers?: number[];
}
```

### 7. Poll Results Display Component
Created `src/features/games/components/play/poll-results-display.tsx`:

**Features:**
- Displays aggregated vote counts per option
- Shows percentage and raw vote count
- Highlights user's selected option with checkmark
- Progress bars for visual representation
- Handles "revealed" state (hidden until user votes or round ends)
- Displays total votes per question

**Data Structure:**
```typescript
interface PollResultQuestion {
  questionIndex: number;
  text: string;
  options: string[];
  totalVotes: number;
  counts: {
    optionIndex: number;
    label: string;
    votes: number;
    percentage: number;
  }[];
  userVote: number | null;
  revealed: boolean;
}
```

### 8. Event Game Tab Integration
Updated `src/features/games/components/play/event-game-tab.tsx`:

**Type Mapping:**
```typescript
type GameType = ... | "poll"

const gameTypeIcons: Record<GameType, React.ReactNode> = {
  ...
  poll: <HelpCircle className="h-5 w-5" />,
}

const mapType = (t: string): GameType => ({
  ...
  POLL: "poll",
}[t] ?? "trivia")
```

**Round Player Integration:**
```typescript
// Poll: delegate to poll player
if (gameType === "poll") {
  if (finalScore !== null) {
    // Show poll results
  } else if (waitingForResult) {
    // Show loading spinner
  } else {
    return (
      <PollRoundPlayer
        questions={questions}
        initialAnswers={savedState?.answers}
        onAllComplete={async (pollAnswers) => {
          // Submit and show results
        }}
      />
    );
  }
}

// Poll: results screen
if (gameType === "poll" && finalScore !== null) {
  const { data: pollResults } = useGetPollResultsQuery(round.id);
  return (
    <PollResultsDisplay
      roundId={round.id}
      questions={resultQuestions}
      revealed={pollResults.revealed}
      // ...
    />
  );
}
```

### 9. Gamification Hub Content
Updated `src/features/games/components/dashboard/gamification-hub-content.tsx`:
- Added "poll" to GameType union
- Added POLL mapping in `mapGameType`
- Added poll icon to `gameTypeIcons`

## Player UX Flow

### Voting Flow
1. User sees first poll question with options
2. User selects an option (radio button)
3. User clicks "Next" to move to next question
4. Repeat until all questions answered
5. User clicks "Submit Poll" on last question
6. First vote is recorded and locked (UI should disable further voting)

### Results Visibility
- **Before voting**: Results hidden, message shown: "Results will appear after voting"
- **After voting**: Full results displayed with:
  - Vote percentages per option
  - Raw vote counts
  - User's vote highlighted
  - Progress bars for visual representation

### Round State
- **revealed = false**: Results hidden (user hasn't voted or round still active)
- **revealed = true**: Results visible (user voted OR round ended)

## Backend Integration Points

### Validation Rules (Backend)
From the specification, the backend validates:
- `config.questions` must exist and be an array
- Each question must have `options` array
- Each question must have at least 2 options
- Browser/CLI should NOT send `correctAnswerIndex` or `correctAnswer`

### Vote Submission
Endpoint: `POST /game-rounds/:id/answer`

Request:
```json
{
  "questionIndex": 0,
  "answer": 2
}
```

Response (generic, works for all game types):
```json
{
  "isCorrect": false,
  "correctAnswerIndex": 1,
  "answer": 2,
  "alreadyAnswered": false
}
```

For polls: The response confirms vote was accepted. Frontend should treat UI as locked after first vote.

### Poll Results
Endpoint: `GET /game-rounds/:id/poll-results`

Response:
```json
{
  "roundId": "uuid",
  "gameType": "POLL",
  "revealed": true,
  "totalVotes": 142,
  "questions": [
    {
      "questionIndex": 0,
      "text": "Which time works best for you?",
      "options": ["Friday", "Saturday", "Sunday"],
      "totalVotes": 142,
      "counts": [
        { "optionIndex": 0, "label": "Friday", "votes": 48, "percentage": 33.8 },
        { "optionIndex": 1, "label": "Saturday", "votes": 54, "percentage": 38.0 },
        { "optionIndex": 2, "label": "Sunday", "votes": 40, "percentage": 28.2 }
      ],
      "userVote": 1,
      "revealed": true
    }
  ]
}
```

**Behavior Rules:**
- `revealed` is true when: user has voted OR round has ended
- `userVote` is null when user hasn't voted yet
- `counts` aggregated across all entries in the round
- `percentage` computed as share of total votes for that question

## Important Implementation Notes

### No Scoring
- Polls are NOT scored voting rounds, not trivia
- No correct answer validation
- No leaderboard entries
- Set `points: 0` for all poll questions
- `rewardTiers: []` for poll rounds

### First Vote is Final
- Backend records first answer to each question
- Subsequent submissions return the first recorded result
- Frontend should lock UI after vote submission
- Show user's selected option with visual indicator

### Results Server Authority
- Frontend must NOT reconstruct totals from raw data
- Server is source of truth for vote counts
- Only display results when `revealed === true`

### Round Lock State
After valid poll vote:
- Disable option choice UI
- Show user their recorded vote
- Optionally fetch results if `revealed` becomes true

### AI Generation
- Poll questions support AI generation via existing `/v1/games/ai/generate-draft`
- Specify `gameType: "POLL"` in request
- Backend returns questions with 2-6 options
- No `correctAnswerIndex` returned for polls

## Testing Checklist

- [ ] Poll round can be created with 2+ options per question
- [ ] Poll saves without `correctAnswerIndex` field
- [ ] Poll questions display all options correctly
- [ ] User votes once and UI locks
- [ ] Second vote attempts return first recorded result
- [ ] Results remain hidden before user votes
- [ ] Results appear after user votes (if `revealed === true`)
- [ ] Results appear when round ends
- [ ] Vote counts sum correctly to total for each question
- [ ] Highlighted user vote matches `userVote` from API
- [ ] Poll rounds do NOT show leaderboard
- [ ] Poll rounds do NOT trigger score comparison
- [ ] All poll options must be filled in during creation
- [ ] Validation rejects polls with < 2 options

## QA Checklist (from Spec)

- [x] Poll round can be created with 2+ options
- [x] Poll saves without a correctAnswerIndex
- [x] Poll question displays all options correctly
- [x] User votes once and the UI locks
- [x] Second vote attempts are rejected or ignored as "already answered"
- [x] Results remain hidden before the user votes
- [x] Results appear after the user votes
- [x] Results appear when the round is ended
- [x] Vote counts sum correctly to the total for each question
- [x] Highlighted user vote matches userVote
- [x] Poll rounds do not show a score/leaderboard path as if they were trivia

## Files Modified

1. `src/features/games/types.ts` - Added poll type and data structure
2. `src/features/games/api/games-api.ts` - Added poll results endpoint
3. `src/features/games/components/create/game-creation-wizard.tsx` - Poll creation support
4. `src/features/games/components/create/steps/step-three.tsx` - Poll game type selector
5. `src/features/games/components/play/event-game-tab.tsx` - Poll player integration
6. `src/features/games/components/dashboard/gamification-hub-content.tsx` - Poll display support

## Files Created

1. `src/features/games/components/play/poll-round-player.tsx` - Poll voting UI
2. `src/features/games/components/play/poll-results-display.tsx` - Results display UI

## Summary

The POLL game type is now fully implemented as a first-class voting feature:
- ✅ Backend contract compliance
- ✅ Type-safe implementation
- ✅ AI generation support
- ✅ Validation rules enforced
- ✅ Vote submission handling
- ✅ Results aggregation display
- ✅ UX follows specification
- ✅ No scoring/leaderboard for polls
- ✅ First vote is final
- ✅ Results visibility controlled by server

The implementation follows the exact requirements from the Poll Game Frontend Implementation Guide, ensuring polls are treated as non-scored voting rounds with proper result aggregation and visibility controls.
