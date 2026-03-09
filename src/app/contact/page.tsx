import Navbar from "@/components/navbar/navbar";
import ReachOut from "./contact";
import Footer from "@/components/footer";
import { Metadata } from "next";
import { APP_NAME } from "@/utils/constants";

export const metadata: Metadata = {
  title: "Contact Us | " + APP_NAME,
  description: "Contact us page of " + APP_NAME,
};

const page = () => {
  return (
    <main className="h-screen ">
      <Navbar />
      <ReachOut />
      <Footer />
    </main>
  );
};

export default page;
