import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
import Home from "./pages/Home";
import CategoryDetail from "./pages/CategoryDetail";
import Settings from "./pages/Settings";
import Comparison from "./pages/Comparison";
import SignalDetail from "./pages/SignalDetail";
import Correlation from "./pages/Correlation";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/category/:id" component={CategoryDetail} />
      <Route path="/settings" component={Settings} />
      <Route path="/comparison" component={Comparison} />
      <Route path="/signal/:id" component={SignalDetail} />
      <Route path="/correlation" component={Correlation} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <ColorSchemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ColorSchemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
