import { Toaster } from "@/components/ui/sonner";
import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { useDataPolling } from './hooks/useDataPolling';
import InstallPrompt from "./components/InstallPrompt";
import MobileBottomNav from "./components/MobileBottomNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
import { DashboardProfileProvider } from "./contexts/DashboardProfileContext";
import Home from "./pages/Home";
import CategoryDetail from "./pages/CategoryDetail";
import Settings from "./pages/Settings";
import CustomIndicator from "./pages/CustomIndicator";
import Predictions from "./pages/Predictions";
import Comparison from "./pages/Comparison";
import SignalDetail from "./pages/SignalDetail";
import Correlation from "./pages/Correlation";
import Scenarios from "./pages/Scenarios";
import Portfolio from "./pages/Portfolio";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import GlobalMarkets from "./pages/GlobalMarkets";

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AppRouter() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/category/:id" component={CategoryDetail} />      <Route path={"/settings"} component={Settings} />
      <Route path={"/custom-indicator"} component={CustomIndicator} />
      <Route path={"/predictions"} component={Predictions} />      <Route path="/comparison" component={Comparison} />
      <Route path="/signal/:id" component={SignalDetail} />
      <Route path="/correlation" component={Correlation} />
      <Route path="/scenarios" component={Scenarios} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/performance" component={Performance} />
      <Route path="/global-markets" component={GlobalMarkets} />
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
  // Real-time data polling - Disabled until real_data.json is available
  // const { isNewData } = useDataPolling('/real_data.json', {
  //   interval: 5 * 60 * 1000, // 5 minutes
  //   enabled: true,
  //   onUpdate: (data) => {
  //     console.log('[App] New data received:', data.timestamp);
  //     toast.success('Dashboard data updated!', {
  //       duration: 4000,
  //       position: 'top-right',
  //       icon: '🔄',
  //     });
  //   },
  // });
  

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <ColorSchemeProvider>
          <DashboardProfileProvider>
            <TooltipProvider>
              <Toaster />
              <HotToaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  },
                }}
              />
              <InstallPrompt />
              <AppRouter />
              <MobileBottomNav />
            </TooltipProvider>
          </DashboardProfileProvider>
        </ColorSchemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
