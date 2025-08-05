"use client";

import { ChevronLeft } from "lucide-react";
import { useExamStore } from "@/stores/examStore";
import { ExamSelector } from "@/components/exam/ExamSelector";
import { ExamViewer } from "@/components/exam/ExamViewer";
import { Sidebar } from "@/components/navigation/Sidebar";
import { MobileNavigationBar } from "@/components/navigation/MobileNavigationBar";
import { useSettingsStore } from "@/stores/settingsStore";
import manifest from "../../../public/data/manifest.json";

export function MainContent() {
  const { currentExam } = useExamStore();
  const { sidebarVisible } = useSettingsStore();

  return (
    <div className="flex-1 flex">
      {/* Main content */}
      <div className="flex-1 transition-all duration-300">
        <div className="h-full">
          {!currentExam ? (
            /* Exam selection page */
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Choose your exam
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Select a ServiceNow certification exam to begin your
                    training
                  </p>
                </div>

                <ExamSelector />

                {/* Additional information */}
                <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-4 sm:p-6 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {manifest.totalExams}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available exams
                    </div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {manifest.totalQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total questions
                    </div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground mb-2">
                      100%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Free and open source
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-8 sm:mt-12">
                  <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                    Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground">
                          Progress tracking
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Track your answers and success rate
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground">
                          Favorites system
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Mark important questions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground">
                          Advanced search
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Filter by status, difficulty and content
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground">
                          Dark mode
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Interface adapted to your preferences
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground">
                          Detailed statistics
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Analyze your performance
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground">
                          Responsive
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Optimized for all devices
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Exam viewing interface */
            <ExamViewer />
          )}
        </div>
      </div>

      {/* Navigation sidebar (only if exam is loaded and sidebar is visible) */}
      {currentExam && sidebarVisible && <Sidebar />}

      {/* Button to show sidebar when hidden (desktop only) */}
      {currentExam && !sidebarVisible && (
        <button
          onClick={() => useSettingsStore.getState().setSidebarVisible(true)}
          className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-primary text-primary-foreground hover:bg-primary/90 rounded-l-lg p-2 shadow-lg transition-all duration-200"
          title="Show sidebar"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Mobile navigation bar */}
      {currentExam && <MobileNavigationBar />}
    </div>
  );
}
