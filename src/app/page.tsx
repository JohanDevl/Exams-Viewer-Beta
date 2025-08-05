import { AppHeader } from "@/components/layout/AppHeader";
import { MainContent } from "@/components/layout/MainContent";
import { SessionPersistenceProvider } from "@/components/providers/SessionPersistenceProvider";
import { HomeSessionFinalizer } from "@/components/providers/HomeSessionFinalizer";

export default function Home() {
  return (
    <SessionPersistenceProvider>
      <HomeSessionFinalizer>
        <div className="min-h-screen flex flex-col">
          <AppHeader />
          <main className="flex-1 flex">
            <MainContent />
          </main>
        </div>
      </HomeSessionFinalizer>
    </SessionPersistenceProvider>
  );
}
