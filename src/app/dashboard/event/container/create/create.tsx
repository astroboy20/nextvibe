"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Games from "./steps/games/games";
import BasicInfo from "./steps/basic-info";
import Vibetags from "./steps/vibetag/vibetags";
interface CreateProps {
  step: number;
}

const Create = ({ step }: CreateProps) => {
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
        <Games
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

  // Step 1 — Basic Info (hub)
  return (
    <div className="h-screen pt-10 pb-[200px] w-full px-5">
      <BasicInfo />
    </div>
  );
};

export default Create;
