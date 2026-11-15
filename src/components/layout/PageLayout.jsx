import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function PageLayout({ children, activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "md:ml-[78px]" : "md:ml-[250px]"
        }`}
      >
        <Topbar
          activePage={activePage}
          onNavigate={setActivePage}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default PageLayout;