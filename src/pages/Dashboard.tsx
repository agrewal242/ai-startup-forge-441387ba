import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Calendar, Users, DollarSign, Sparkles, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { SmartTripLogo } from "@/components/SmartTripLogo";
import TripChatbot from "@/components/TripChatbot";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Trip = {
  id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget_tier: string;
  travel_style: string;
  group_size: number;
  status: string;
  created_at: string;
  itinerary: any;
};

const Dashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchTrips();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Set up real-time subscription for trip status updates
    const channel = supabase
      .channel('trip-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips'
        },
        (payload) => {
          console.log('Trip updated:', payload);
          // Update the specific trip in state
          setTrips(prev => prev.map(trip => 
            trip.id === payload.new.id ? payload.new as Trip : trip
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getBudgetColor = (tier: string) => {
    switch (tier) {
      case "low": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "medium": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "high": return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const getStyleIcon = (style: string) => {
    const icons = {
      adventure: "🏔️",
      relaxation: "🏖️",
      cultural: "🏛️",
      nightlife: "🌃"
    };
    return icons[style as keyof typeof icons] || "✈️";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "draft": return "secondary";
      case "analyzing_intent": return "default";
      case "researching_destination": return "default";
      case "curating_activities": return "default";
      case "generating_itinerary": return "default";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Draft";
      case "analyzing_intent": return "🤖 Analyzing Intent";
      case "researching_destination": return "🔍 Researching";
      case "curating_activities": return "🎯 Curating";
      case "generating_itinerary": return "✨ Generating";
      case "completed": return "✅ Complete";
      default: return status;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case "draft": return 0;
      case "analyzing_intent": return 25;
      case "researching_destination": return 50;
      case "curating_activities": return 75;
      case "generating_itinerary": return 90;
      case "completed": return 100;
      default: return 0;
    }
  };

  const isProcessing = (status: string) => {
    return ["analyzing_intent", "researching_destination", "curating_activities", "generating_itinerary"].includes(status);
  };

  const handleDeleteTrip = async (tripId: string, destination: string) => {
    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

      if (error) throw error;

      // Update local state
      setTrips(prev => prev.filter(trip => trip.id !== tripId));

      toast({
        title: "Trip deleted",
        description: `${destination} trip has been removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <nav className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          >
            <SmartTripLogo size={28} className="text-primary" />
            <h1 className="text-xl font-bold">SmartTrip AI</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/plan-trip")}>
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Trips</h1>
          <p className="text-muted-foreground">Manage and view all your travel plans</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <SmartTripLogo size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6">
                Start planning your first trip with our AI-powered agents
              </p>
              <Button onClick={() => navigate("/plan-trip")} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{trip.destination}</CardTitle>
                    <span className="text-2xl">{getStyleIcon(trip.travel_style)}</span>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant={getStatusColor(trip.status)}>
                      {getStatusLabel(trip.status)}
                    </Badge>
                    <Badge className={getBudgetColor(trip.budget_tier)}>
                      {trip.budget_tier}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isProcessing(trip.status) && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>AI agents working...</span>
                      </div>
                      <Progress value={getProgressValue(trip.status)} className="h-2" />
                    </div>
                  )}
                  
                  {trip.start_date && trip.end_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(trip.start_date), "MMM d")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{trip.group_size} {trip.group_size === 1 ? "person" : "people"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{trip.travel_style.replace("_", " ")}</span>
                  </div>
                  
                  {trip.status === "completed" && trip.itinerary?.summary && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {trip.itinerary.summary}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1" 
                      variant={trip.status === "completed" ? "default" : "outline"}
                      disabled={isProcessing(trip.status)}
                      onClick={() => navigate(`/trip/${trip.id}`)}
                    >
                      {trip.status === "completed" ? "View Itinerary" : "View Details"}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          disabled={isProcessing(trip.status)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete your trip to <strong>{trip.destination}</strong>? 
                            This action cannot be undone and will permanently remove the itinerary.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTrip(trip.id, trip.destination)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <TripChatbot />
      </main>
    </div>
  );
};

export default Dashboard;
