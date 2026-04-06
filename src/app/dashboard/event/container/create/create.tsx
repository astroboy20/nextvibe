"use client";
import BasicInfo from "./steps/basic-info";
interface CreateProps {
  step: number;
}

const Create = ({ step }: CreateProps) => {
  if (step === 1) {
    // Step 1 — Basic Info (hub)
    return (
      <div className="h-screen pt-10 pb-[200px] w-full px-5">
        <BasicInfo />
      </div>
    );
  }
};

export default Create;
