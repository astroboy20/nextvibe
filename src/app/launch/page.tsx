import Footer from "@/components/footer";
import { Header } from "@/components/navbar/admin-navbar";
import LaunchLanding from "./container/launch";

export default function LaunchPage() {
  return (
    <div>
      <Header />
      <LaunchLanding />
      <Footer />
    </div>
  );
}
