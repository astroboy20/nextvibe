const PostcardLeaderboardContent =() => {
    const leaders = [
      { id: "1", username: "@chioma_vibes", likes: 156, engagement: 89 },
      { id: "2", username: "@tunde_life", likes: 134, engagement: 76 },
      { id: "3", username: "@ngozi_party", likes: 98, engagement: 62 },
    ];
  
    return (
      <div className="space-y-2">
        {leaders.map((leader, index) => (
          <div
            key={leader.id}
            className={`flex items-center justify-between rounded-lg p-2 ${
              index === 0 ? "bg-amber-500/10" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground w-4">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{leader.username}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold">{leader.likes} ❤️</span>
              <p className="text-[10px] text-muted-foreground">
                {leader.engagement}% engage
              </p>
            </div>
          </div>
        ))}
        <button className="mt-2 w-full text-center text-xs font-medium text-primary hover:underline">
          View Full Leaderboard
        </button>
      </div>
    );
  }
  
  
  export default PostcardLeaderboardContent