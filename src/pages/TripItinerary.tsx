import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, DollarSign, MapPin, Clock, Users, Plane, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AgentProgressTracker } from "@/components/AgentProgressTracker";
import { SmartTripLogo } from "@/components/SmartTripLogo";
import TripChatbot, { TripChatbotRef } from "@/components/TripChatbot";

type Trip = {
  id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget_tier: string;
  travel_style: string;
  group_size: number;
  status: string;
  itinerary: any;
};

const TripItinerary = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const chatbotRef = useRef<TripChatbotRef>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchTrip();
    };

    checkAuth();
  }, [tripId]);

  useEffect(() => {
    // Set up real-time subscription for this specific trip
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${tripId}`
        },
        (payload) => {
          console.log('Trip updated in real-time:', payload);
          setTrip(payload.new as Trip);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Trip not found",
          description: "This trip doesn't exist or you don't have access to it.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setTrip(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <p className="text-muted-foreground">Loading itinerary...</p>
      </div>
    );
  }

  // Check if trip is still being processed
  const isProcessing = trip && ["analyzing_intent", "researching_destination", "curating_activities", "generating_itinerary"].includes(trip.status);

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <p className="text-muted-foreground">Trip not found</p>
      </div>
    );
  }

  if (isProcessing || !trip.itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <nav className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            >
              <SmartTripLogo size={28} className="text-primary" />
              <h1 className="text-xl font-bold">SmartTrip AI</h1>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{trip.destination}</h1>
            <p className="text-muted-foreground text-lg">Your itinerary is being created</p>
          </div>

          <AgentProgressTracker currentStatus={trip.status} />

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="font-medium">
                    {trip.start_date && trip.end_date
                      ? `${format(new Date(trip.start_date), "MMM d")} - ${format(new Date(trip.end_date), "MMM d, yyyy")}`
                      : "Flexible"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Group Size</p>
                  <p className="font-medium">{trip.group_size} {trip.group_size === 1 ? "person" : "people"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium capitalize">{trip.budget_tier}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Travel Style</p>
                  <p className="font-medium capitalize">{trip.travel_style}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const itinerary = trip.itinerary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <nav className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          >
            <SmartTripLogo size={28} className="text-primary" />
            <h1 className="text-xl font-bold">SmartTrip AI</h1>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Trip Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{trip.destination}</h1>
              <p className="text-muted-foreground text-lg">Your personalized travel itinerary</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Button 
                onClick={() => chatbotRef.current?.open()}
                className="mb-2"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with AI
              </Button>
              <Badge variant="default" className="text-lg px-4 py-2">
                {trip.travel_style}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {trip.budget_tier} budget
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="font-medium">
                    {trip.start_date && trip.end_date
                      ? `${format(new Date(trip.start_date), "MMM d")} - ${format(new Date(trip.end_date), "MMM d, yyyy")}`
                      : "Flexible"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Group Size</p>
                  <p className="font-medium">{trip.group_size} {trip.group_size === 1 ? "person" : "people"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="font-medium">{itinerary.total_estimated_cost || "Calculating..."}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary */}
        {itinerary.summary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Trip Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{itinerary.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Daily Itinerary */}
        {itinerary.days && itinerary.days.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold">Daily Itinerary</h2>
            {itinerary.days.map((day: any, index: number) => (
              <Card key={index}>
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary">Day {day.day}</span>
                    {day.title && <span className="text-muted-foreground">• {day.title}</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {day.activities?.map((activity: any, actIndex: number) => (
                      <div key={actIndex}>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                              <Clock className="h-4 w-4" />
                            </div>
                            {actIndex < day.activities.length - 1 && (
                              <div className="w-0.5 h-full bg-border mt-2" />
                            )}
                          </div>

                          <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">{activity.time}</p>
                                <h3 className="font-semibold text-lg">{activity.activity}</h3>
                              </div>
                              {activity.cost && (
                                <Badge variant="outline">{activity.cost}</Badge>
                              )}
                            </div>

                            {activity.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4" />
                                <span>{activity.location}</span>
                              </div>
                            )}

                            {activity.duration && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Clock className="h-4 w-4" />
                                <span>{activity.duration}</span>
                              </div>
                            )}

                            {activity.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                💡 {activity.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        {actIndex < day.activities.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Travel Tips */}
        {itinerary.tips && itinerary.tips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Travel Tips</CardTitle>
              <CardDescription>Helpful advice for your trip</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {itinerary.tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Fallback for unstructured itinerary */}
        {itinerary.raw_itinerary && !itinerary.days && (
          <Card>
            <CardHeader>
              <CardTitle>Your Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                {itinerary.raw_itinerary}
              </pre>
            </CardContent>
          </Card>
        )}

        <TripChatbot 
          ref={chatbotRef}
          tripContext={{
            destination: trip.destination,
            startDate: trip.start_date || undefined,
            endDate: trip.end_date || undefined,
            travelStyle: trip.travel_style,
            budgetTier: trip.budget_tier,
            groupSize: trip.group_size
          }}
        />
      </main>
    </div>
  );
};

export default TripItinerary;
