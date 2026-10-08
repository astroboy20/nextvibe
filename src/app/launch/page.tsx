import Footer from "@/features/layout/components/footer";
import LaunchLanding from "./container/launch";
import Navbar from "@/features/layout/components/navbar/navbar";

export default function LaunchPage() {
  return (
    <div>
      <Navbar />
      <LaunchLanding />
      <Footer />
    </div>
  );
}
