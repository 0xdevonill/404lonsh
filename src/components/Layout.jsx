import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-void text-zinc-200 font-mono antialiased">
      <div className="scanlines" />
      <Header />
      <main className="max-w-7xl mx-auto w-full p-4 md:p-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
