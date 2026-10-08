const AnalyticsPanelContent = () => {
  const metrics = [
    { label: "Total Views", value: "1,245", change: "+12%" },
    { label: "Postcards Created", value: "32", change: "+8" },
    { label: "Game Plays", value: "156", change: "+24" },
    { label: "Engagement Rate", value: "68%", change: "+5%" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-xl bg-muted/50 p-3">
          <span className="text-[11px] text-muted-foreground">
            {metric.label}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-xl font-bold">
              {metric.value}
            </span>
            <span className="text-[10px] font-medium text-green-600">
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsPanelContent;
