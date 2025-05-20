import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAnalytics } from "@/hooks/use-analytics";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import SignUp from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import CreateProfile from "@/pages/create-profile";
import FindRoommate from "@/pages/find-roommate";
import BrowseProfiles from "@/pages/browse-profiles-fixed";
import LeaveReview from "@/pages/leave-review";
import RequestBooking from "@/pages/request-booking";
import RequestSent from "@/pages/request-sent";
import Chat from "@/pages/chat";
import Messages from "@/pages/messages-fixed";
import BookingConfirmation from "@/pages/booking-confirmation";
import CheckIn from "@/pages/check-in";
import GuestInfo from "@/pages/guest-info";
import PostStay from "@/pages/post-stay";
import RateRoommate from "@/pages/rate-roommate";
import Layout from "@/components/layout";
import ResearchProvider from "@/components/research-provider";

function Router() {
  // Initialize analytics tracking
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/edit" component={CreateProfile} />
      <Route path="/create-profile" component={CreateProfile} />
      <Route path="/find-roommate" component={FindRoommate} />
      <Route path="/browse-profiles" component={BrowseProfiles} />
      <Route path="/messages" component={Messages} />
      <Route path="/leave-review/:id" component={LeaveReview} />
      <Route path="/request-booking/:id" component={RequestBooking} />
      <Route path="/request-sent/:id" component={RequestSent} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/booking-confirmation/:id" component={BookingConfirmation} />
      <Route path="/check-in/:id" component={CheckIn} />
      <Route path="/guest-info/:id" component={GuestInfo} />
      <Route path="/post-stay/:id" component={PostStay} />
      <Route path="/rate-roommate/:id" component={RateRoommate} />
      <Route component={NotFound} />
    </Switch>
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
