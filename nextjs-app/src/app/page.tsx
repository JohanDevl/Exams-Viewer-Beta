import { ExamSelector } from "@/components/exam/ExamSelector";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainContent } from "@/components/layout/MainContent";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 flex">
        <MainContent />
      </main>
    </div>
  );
}
