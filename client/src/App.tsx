import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAnalytics } from "@/hooks/use-analytics";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import HowItWorks from "@/components/HowItWorks";
import SignUp from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import DashboardNew from "@/pages/dashboard-new";
import DashboardTrips from "@/pages/dashboard-trips";
import CreateTrip from "@/pages/create-trip";
import TripDetails from "@/pages/trip-details";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";
import CreateProfile from "@/pages/create-profile";
import CreateProfileEnhanced from "@/pages/create-profile-enhanced";
import CreateProfileClean from "@/pages/create-profile-clean";
import DebugProfile from "@/pages/debug-profile";
import TestSimple from "@/pages/test-simple";
import TestRoute from "@/pages/test-route";
import SimpleTest from "@/pages/simple-test";
import CreateProfileSimple from "@/pages/create-profile-simple";
import BrowseTrips from "@/pages/browse-trips";
import FindRoommate from "@/pages/find-roommate";
import BrowseProfiles from "@/pages/browse-profiles-fixed";
import LeaveReview from "@/pages/leave-review";
import RequestBooking from "@/pages/request-booking";
import RequestSent from "@/pages/request-sent";
import Messages from "@/pages/messages-fixed";
import BookingConfirmation from "@/pages/booking-confirmation";
import CheckIn from "@/pages/check-in";
import GuestInfo from "@/pages/guest-info";
import PostStay from "@/pages/post-stay";
import RateRoommate from "@/pages/rate-roommate";
import SharedExperience from "@/pages/shared-experience";
import SouvenirReview from "@/pages/souvenir-review";
import ResearchAdmin from "@/pages/research-admin";
import { SafetyVerificationPage } from "@/pages/safety-verification";
import Layout from "@/components/layout";
import ResearchProvider from "@/components/research-provider";

function Router() {
  // Initialize analytics tracking
  useAnalytics();
  
  // Create a scroll restoration component
  const ScrollToTop = () => {
    const [location] = useLocation();
    
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location]);
    
    return null;
  };
  
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Route path="/dashboard" component={DashboardTrips} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile/edit" component={CreateProfile} />
        <Route path="/create-profile" component={CreateProfileClean} />
        <Route path="/new-profile" component={CreateProfile} />
        <Route path="/debug-profile" component={DebugProfile} />
        <Route path="/create-trip" component={CreateTrip} />
        <Route path="/trip/:tripId" component={TripDetails} />
        <Route path="/chat/:userId" component={Chat} />
        <Route path="/profile-setup" component={CreateProfile} />
        <Route path="/test" component={TestRoute} />

        <Route path="/chat/:id" component={Chat} />
        <Route path="/booking-confirmation/:id" component={BookingConfirmation} />
        <Route path="/check-in/:id" component={CheckIn} />
        <Route path="/guest-info/:id" component={GuestInfo} />
        <Route path="/post-stay/:id" component={PostStay} />
        <Route path="/rate-roommate/:id" component={RateRoommate} />
        <Route path="/shared-experience" component={SharedExperience} />
        <Route path="/souvenir-review" component={SouvenirReview} />
        <Route path="/safety-verification" component={SafetyVerificationPage} />
        <Route path="/research-admin" component={ResearchAdmin} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ResearchProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </ResearchProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
