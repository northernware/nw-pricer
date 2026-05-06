import Header from "@/components/Header";
import Calculator from "@/components/Calculator";
import Footer from "@/components/Footer";
import { logoutAction } from "../login/actions";

export default function AdminDashboard() {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 pt-4 flex justify-end relative z-50">
        <form action={logoutAction}>
          <button type="submit" className="text-[10px] font-mono text-nw-graphite hover:text-red-500 uppercase tracking-widest transition-colors">
            Logout
          </button>
        </form>
      </div>
      <Calculator />
      <Footer />
    </>
  );
}
