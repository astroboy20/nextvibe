import { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import Contact from "./container/new-contact";

export const metadata: Metadata = {
  title: "Contact Us | " + APP_NAME,
  description: "Contact us page of " + APP_NAME,
};

const page = () => {
  return (
    <main className="h-screen ">
      <Contact />
    </main>
  );
};

export default page;
