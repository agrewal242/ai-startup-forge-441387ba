import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SmartTripLogo } from "@/components/SmartTripLogo";
import TripChatbot from "@/components/TripChatbot";

const formSchema = z.object({
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budgetTier: z.enum(["low", "medium", "high"]),
  travelStyle: z.enum(["adventure", "relaxation", "cultural", "nightlife"]),
  groupSize: z.number().min(1).max(50),
});

type FormData = z.infer<typeof formSchema>;

const PlanTrip = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      groupSize: 1,
      budgetTier: "medium",
      travelStyle: "cultural",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: tripData, error } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,
          destination: data.destination,
          start_date: data.startDate ? format(data.startDate, "yyyy-MM-dd") : null,
          end_date: data.endDate ? format(data.endDate, "yyyy-MM-dd") : null,
          budget_tier: data.budgetTier,
          travel_style: data.travelStyle,
          group_size: data.groupSize,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate immediately so the user can see AI agents working
      toast({
        title: "Trip created!",
        description: "AI agents are now planning your perfect itinerary. Check the dashboard for real-time updates.",
      });
      navigate("/dashboard");

      // Fire-and-forget AI workflow so navigation isn't blocked
      supabase.functions
        .invoke("generate-itinerary", {
          body: { tripId: tripData.id },
        })
        .then(({ error: functionError }) => {
          if (functionError) {
            console.error("Error triggering AI workflow:", functionError);
            toast({
              title: "Trip created with warning",
              description:
                "Trip saved but AI generation encountered an issue. You can retry from the dashboard.",
              variant: "destructive",
            });
          }
        })
        .catch((functionError: any) => {
          console.error("Error triggering AI workflow:", functionError);
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <nav className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
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

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Plan Your Trip</CardTitle>
            <CardDescription>
              Tell us about your travel preferences and our AI agents will create a personalized itinerary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tokyo, Paris, New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="budgetTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Tier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - Budget-friendly options</SelectItem>
                          <SelectItem value="medium">Medium - Good value</SelectItem>
                          <SelectItem value="high">High - Premium experiences</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="travelStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select travel style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="adventure">Adventure - Outdoor activities & excitement</SelectItem>
                          <SelectItem value="relaxation">Relaxation - Spas, beaches, low-activity</SelectItem>
                          <SelectItem value="cultural">Cultural - Museums, heritage sites</SelectItem>
                          <SelectItem value="nightlife">Nightlife - Clubs, bars, late-night areas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Creating Trip..." : "Create Trip"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <TripChatbot />
      </main>
    </div>
  );
};

export default PlanTrip;