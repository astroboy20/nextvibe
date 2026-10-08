import Footer from "@/features/layout/components/footer";
import PledgeLanding from "./container/pledge";
import Navbar from "@/features/layout/components/navbar/navbar";

export default function PledgePage() {
  return (
    <div>
      <Navbar />
      <PledgeLanding />
      <Footer />
    </div>
  );
}
