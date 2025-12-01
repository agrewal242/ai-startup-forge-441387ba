import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Brain, Database, Sparkles, TrendingUp, MapPin, Globe2 } from "lucide-react";
import GlobeMap from "@/components/GlobeMap";
import { SmartTripLogo } from "@/components/SmartTripLogo";
const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background via-50% to-secondary/10">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          >
            <SmartTripLogo size={36} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                SmartTrip AI
              </h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center space-y-8 mb-20">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
              
              <br />
              <span className="text-foreground">Travel Planning</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the future of travel with our <strong className="text-foreground">4 specialized AI agents</strong> working together to create your perfect itinerary with <strong className="text-foreground">real flight & hotel data</strong>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all" onClick={() => navigate("/plan-trip")}>
              <Sparkles className="mr-2 h-5 w-5" />
              Start Planning
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate("/dashboard")}>
              <TrendingUp className="mr-2 h-5 w-5" />
              View My Trips
            </Button>
          </div>
        </div>

        {/* Interactive Globe Map */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Explore the World</h2>
            <p className="text-lg text-muted-foreground">Discover destinations across the globe with our interactive map</p>
          </div>
          
          <GlobeMap />
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose SmartTrip AI?</h2>
            <p className="text-lg text-muted-foreground">Intelligent travel planning with real data</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-block p-4 rounded-full bg-primary/10">
                <Globe2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Real Travel Data</h3>
              <p className="text-muted-foreground">Powered by Amadeus API with actual flight prices, hotel rates, and availability</p>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-block p-4 rounded-full bg-secondary/10">
                <Brain className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold">Smart Branching</h3>
              <p className="text-muted-foreground">AI adapts its research strategy based on your budget tier and travel style preferences</p>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-block p-4 rounded-full bg-accent/10">
                <Sparkles className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold">Personalized Itineraries</h3>
              <p className="text-muted-foreground">Every trip is uniquely tailored to your group size, dates, and travel preferences</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center">
          
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 SmartTrip AI. Powered by Multi-Agent AI Architecture & Amadeus Travel API</p>
        </div>
      </footer>
    </div>;
};
export default Index;