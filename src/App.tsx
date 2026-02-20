import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Suspense } from "react-router-dom";
import { lazy } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Home from "@/pages/Home";
import PageSkeleton from "@/components/PageSkeleton";

// Lazy load heavy pages for code splitting
const Analytics = lazy(() => import("@/pages/Analytics"));
const TransactionGraph = lazy(() => import("@/pages/TransactionGraph"));
const Entities = lazy(() => import("@/pages/Entities"));
const Intervention = lazy(() => import("@/pages/Intervention"));
const Benchmark = lazy(() => import("@/pages/Benchmark"));
const Report = lazy(() => import("@/pages/Report"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/analytics"
              element={
                <Suspense fallback={<PageSkeleton type="analytics" />}>
                  <Analytics />
                </Suspense>
              }
            />
            <Route
              path="/graph"
              element={
                <Suspense fallback={<PageSkeleton type="chart" />}>
                  <TransactionGraph />
                </Suspense>
              }
            />
            <Route
              path="/entities"
              element={
                <Suspense fallback={<PageSkeleton type="table" />}>
                  <Entities />
                </Suspense>
              }
            />
            <Route
              path="/intervention"
              element={
                <Suspense fallback={<PageSkeleton type="full" />}>
                  <Intervention />
                </Suspense>
              }
            />
            <Route
              path="/benchmark"
              element={
                <Suspense fallback={<PageSkeleton type="chart" count={3} />}>
                  <Benchmark />
                </Suspense>
              }
            />
            <Route
              path="/report"
              element={
                <Suspense fallback={<PageSkeleton type="analytics" />}>
                  <Report />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<PageSkeleton type="full" count={4} />}>
                  <SettingsPage />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <Suspense fallback={<PageSkeleton type="full" />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
