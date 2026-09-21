import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";

/**
 * Chrome for the public marketing pages.
 *
 * Every one of these pages used to render <Navbar /> and <Footer /> itself —
 * fourteen copies of the same three lines, which is exactly the duplication a
 * route group exists to remove. The parentheses keep the group out of the URL,
 * so /about is still /about.
 *
 * The landing page at / is deliberately NOT in here: it renders its own nav
 * from inside a dynamic `ssr: false` import, so grouping it would produce two
 * navbars. Worth unpicking separately.
 */
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
