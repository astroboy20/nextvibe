import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { Metadata } from "next";
import { APP_NAME } from "@/utils/constants";
import Contact from "./container/new-contact";

export const metadata: Metadata = {
  title: "Contact Us | " + APP_NAME,
  description: "Contact us page of " + APP_NAME,
};

const page = () => {
  return (
    <main className="h-screen ">
      <Navbar />
      <Contact />
      <Footer />
    </main>
  );
};

export default page;
