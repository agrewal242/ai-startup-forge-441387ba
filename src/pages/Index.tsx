import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plane, LogOut, Brain, Database, Sparkles, TrendingUp, MapPin, Globe2 } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background via-50% to-secondary/10">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Plane className="h-7 w-7 text-primary animate-pulse" />
              <div className="absolute inset-0 h-7 w-7 text-primary opacity-20 animate-ping" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                SmartTrip AI
              </h1>
              <p className="text-[10px] text-muted-foreground">Powered by Multi-Agent AI</p>
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
              <span className="bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent">
                AI-Powered
              </span>
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

        {/* How It Works - AI Agents */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How Our AI Agents Work</h2>
            <p className="text-lg text-muted-foreground">Four specialized agents collaborate to create your perfect itinerary</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all border-2 hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Agent 1: Intent Analyzer</h3>
                  <p className="text-muted-foreground">Analyzes your preferences, budget, and travel style to understand your travel motivations and priorities</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all border-2 hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Database className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Agent 2: Destination Researcher</h3>
                  <p className="text-muted-foreground">
                    <strong>Smart branching:</strong> Uses Amadeus API to fetch <em>real</em> flight & hotel prices. Switches between <strong>Luxury</strong> or <strong>Value</strong> researcher based on your budget
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all border-2 hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <MapPin className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Agent 3: Activity Curator</h3>
                  <p className="text-muted-foreground">
                    <strong>Smart branching:</strong> Routes to <strong>Active</strong> curator (adventure/cultural) or <strong>Leisure</strong> curator (relaxation/nightlife) based on your travel style
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all border-2 hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Agent 4: Itinerary Generator</h3>
                  <p className="text-muted-foreground">Synthesizes all research into a detailed day-by-day itinerary with timings, costs, and pro tips</p>
                </div>
              </div>
            </Card>
          </div>
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
          <Card className="p-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
            <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Next Adventure?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let our AI agents create a personalized itinerary in minutes
            </p>
            <Button size="lg" className="text-lg px-12 py-6" onClick={() => navigate("/plan-trip")}>
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 SmartTrip AI. Powered by Multi-Agent AI Architecture & Amadeus Travel API</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
