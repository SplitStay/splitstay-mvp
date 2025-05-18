import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import SignUp from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import CreateProfile from "@/pages/create-profile";
import FindRoommate from "@/pages/find-roommate";
import BrowseProfiles from "@/pages/browse-profiles-fixed";
import RequestBooking from "@/pages/request-booking";
import RequestSent from "@/pages/request-sent";
import Chat from "@/pages/chat";
import BookingConfirmation from "@/pages/booking-confirmation";
import CheckIn from "@/pages/check-in";
import GuestInfo from "@/pages/guest-info";
import PostStay from "@/pages/post-stay";
import RateRoommate from "@/pages/rate-roommate";
import Layout from "@/components/layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-profile" component={CreateProfile} />
      <Route path="/find-roommate" component={FindRoommate} />
      <Route path="/browse-profiles" component={BrowseProfiles} />
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
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
