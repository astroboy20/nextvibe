import React from "react";
import { Metadata } from "next";

import AboutContent from "./component/about";
import { APP_NAME } from "@/utils/constants";

export const metadata: Metadata = {
  title: "About | " + APP_NAME,
  description: "About page of " + APP_NAME,
};

const AboutPage = () => {
  return (
    <div className="h-screen">
      <AboutContent />
    </div>
  );
};

export default AboutPage;
