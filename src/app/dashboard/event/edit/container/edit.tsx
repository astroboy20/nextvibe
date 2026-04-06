"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Vibetags from "../components/steps/vibetag/vibetags";
import GamesStep from "../components/steps/games/games";
interface CreateProps {
  step: number;
}

const Edit = ({ step }: CreateProps) => {
  const router = useRouter();
  const pathname = usePathname();
  console.log(pathname);

  const [gamesData, setGamesData] = useState<any>(null);

  const goToStep = (step: number) => {
    router.push(`${pathname}/?step=${step}`);
  };

  if (step === 2) {
    return (
      <div className="h-screen pt-10 pb-20 w-full px-5">
        <GamesStep
          initialData={gamesData}
          eventStartDate={new Date().toISOString()}
          onSave={(data) => {
            setGamesData(data);
            goToStep(1);
          }}
          onBack={() => goToStep(1)}
        />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="h-screen pt-10 pb-20 w-full px-5">
        <Vibetags onBack={() => goToStep(1)} />
      </div>
    );
  }
};

export default Edit;
