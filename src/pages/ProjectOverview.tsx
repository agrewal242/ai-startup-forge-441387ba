import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartTripLogo } from "@/components/SmartTripLogo";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Globe2, 
  Users, 
  Zap,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Target,
  Lightbulb,
  Rocket,
  Database
} from "lucide-react";

const ProjectOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background via-50% to-secondary/10">
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
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Try Demo
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <Badge className="mb-4" variant="secondary">
            AI-Powered Travel Planning Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Intelligent Travel
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A production-grade AI platform that orchestrates multiple specialized agents 
            to create personalized travel itineraries using real-time flight and hotel data.
          </p>
        </div>

        {/* The Problem */}
        <Card className="max-w-5xl mx-auto mb-12 border-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-8 w-8 text-destructive" />
              <CardTitle className="text-3xl">The Business Problem</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-lg">
            <p className="leading-relaxed">
              Traditional travel planning is <strong>fragmented, time-consuming, and overwhelming</strong>. 
              Travelers spend hours across multiple platforms comparing flights, hotels, and activities, 
              often ending up with suboptimal itineraries that don't match their preferences or budget.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="font-semibold text-destructive">23+ hours</p>
                <p className="text-sm text-muted-foreground">Average time spent planning a trip</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="font-semibold text-destructive">12+ tabs</p>
                <p className="text-sm text-muted-foreground">Typical browser tabs open while planning</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="font-semibold text-destructive">68%</p>
                <p className="text-sm text-muted-foreground">Travelers overwhelmed by options</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Solution */}
        <Card className="max-w-5xl mx-auto mb-12 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Our AI Solution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-lg">
            <p className="leading-relaxed">
              SmartTrip AI uses a <strong>sophisticated multi-agent AI architecture</strong> with 6 specialized 
              agents working in parallel to analyze intent, research destinations, and generate optimized itineraries 
              in minutes—not hours.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Real-Time Data Integration</p>
                    <p className="text-sm text-muted-foreground">Amadeus API for actual flight prices and hotel availability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Smart Conditional Branching</p>
                    <p className="text-sm text-muted-foreground">Budget-aware and style-adaptive agent workflows</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Personalized Recommendations</p>
                    <p className="text-sm text-muted-foreground">Tailored to group size, dates, and travel preferences</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">6 Specialized AI Agents</p>
                    <p className="text-sm text-muted-foreground">Intent analysis, research, curation, and generation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Real-Time Progress Tracking</p>
                    <p className="text-sm text-muted-foreground">Live updates as agents work on your itinerary</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Production-Ready Platform</p>
                    <p className="text-sm text-muted-foreground">Full authentication, database, and cloud deployment</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Video Section */}
        <Card className="max-w-5xl mx-auto mb-12 border-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="h-8 w-8 text-secondary" />
              <CardTitle className="text-3xl">Product Demo</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Watch how SmartTrip AI transforms travel planning in under 3 minutes
            </p>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
              <div className="relative z-10 text-center space-y-4">
                <PlayCircle className="h-24 w-24 text-primary mx-auto opacity-50" />
                <p className="text-muted-foreground">
                  Demo video will be embedded here
                  <br />
                  <span className="text-sm">(YouTube/Loom link to be added)</span>
                </p>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Try Live Demo Instead
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Architecture */}
        <Card className="max-w-5xl mx-auto mb-12">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-8 w-8 text-accent" />
              <CardTitle className="text-3xl">Technical Architecture</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-xl flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Agent System
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Agent 1:</strong> Intent Analyzer - Extracts travel motivations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Agent 2a/2b:</strong> Budget-branched Researchers (Luxury vs Standard)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Agent 3a/3b:</strong> Style-branched Curators (Active vs Leisure)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Agent 4:</strong> Itinerary Generator - Final assembly</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-secondary" />
                  Technology Stack
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Badge variant="secondary" className="justify-center py-2">React + Vite</Badge>
                  <Badge variant="secondary" className="justify-center py-2">TypeScript</Badge>
                  <Badge variant="secondary" className="justify-center py-2">Supabase</Badge>
                  <Badge variant="secondary" className="justify-center py-2">Lovable AI</Badge>
                  <Badge variant="secondary" className="justify-center py-2">Amadeus API</Badge>
                  <Badge variant="secondary" className="justify-center py-2">Edge Functions</Badge>
                  <Badge variant="secondary" className="justify-center py-2">PostgreSQL</Badge>
                  <Badge variant="secondary" className="justify-center py-2">TailwindCSS</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Impact */}
        <Card className="max-w-5xl mx-auto mb-12 border-2 border-secondary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-secondary" />
              <CardTitle className="text-3xl">Business Impact & Value</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-secondary/10 rounded-lg">
                <p className="text-4xl font-bold text-secondary mb-2">95%</p>
                <p className="text-sm text-muted-foreground">Time saved vs manual planning</p>
              </div>
              <div className="text-center p-6 bg-secondary/10 rounded-lg">
                <p className="text-4xl font-bold text-secondary mb-2">100%</p>
                <p className="text-sm text-muted-foreground">Personalized recommendations</p>
              </div>
              <div className="text-center p-6 bg-secondary/10 rounded-lg">
                <p className="text-4xl font-bold text-secondary mb-2">Real-time</p>
                <p className="text-sm text-muted-foreground">Flight & hotel pricing data</p>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <h3 className="font-semibold text-xl">Commercial Viability</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-2">Freemium Model</p>
                  <p className="text-sm text-muted-foreground">
                    Free basic itineraries, premium features include hotel booking integration, 
                    flight alerts, and advanced customization.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-2">B2B Opportunities</p>
                  <p className="text-sm text-muted-foreground">
                    White-label solutions for travel agencies, corporate travel departments, 
                    and tourism boards.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="max-w-5xl mx-auto mb-12">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="h-8 w-8 text-accent" />
              <CardTitle className="text-3xl">Roadmap & Next Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-primary">Q1 2025</div>
                <div>
                  <p className="font-semibold">Beta Launch & User Testing</p>
                  <p className="text-sm text-muted-foreground">Onboard 100 beta users, collect feedback, optimize agent performance</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-secondary">Q2 2025</div>
                <div>
                  <p className="font-semibold">Direct Booking Integration</p>
                  <p className="text-sm text-muted-foreground">Partner with booking platforms for one-click reservations</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-accent">Q3 2025</div>
                <div>
                  <p className="font-semibold">Mobile App Launch</p>
                  <p className="text-sm text-muted-foreground">React Native app with offline itinerary access</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-muted-foreground">Q4 2025</div>
                <div>
                  <p className="font-semibold">B2B Enterprise Platform</p>
                  <p className="text-sm text-muted-foreground">White-label solutions for travel agencies and corporations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 py-12">
          <h2 className="text-4xl font-bold">Experience the Future of Travel Planning</h2>
          <p className="text-xl text-muted-foreground">
            Join the AI revolution transforming how people explore the world
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate("/auth")}>
              <Sparkles className="mr-2 h-5 w-5" />
              Try Live Demo
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate("/")}>
              <Globe2 className="mr-2 h-5 w-5" />
              Explore Features
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 SmartTrip AI - Harnessing Artificial Intelligence for Business Final Project</p>
          <p className="mt-2">Multi-Agent AI Architecture • Real-Time Data Integration • Production-Grade Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default ProjectOverview;