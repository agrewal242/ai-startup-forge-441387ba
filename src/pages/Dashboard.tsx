import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, LogOut, Plus, Calendar, Users, DollarSign, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <nav className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
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
              <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
                    <Badge variant={trip.status === "completed" ? "default" : "secondary"}>
                      {trip.status}
                    </Badge>
                    <Badge className={getBudgetColor(trip.budget_tier)}>
                      {trip.budget_tier}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  <Button className="w-full mt-4" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;