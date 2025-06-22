"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertTriangle,
  Download,
  Loader2,
  Volume2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

import { generateAudio } from "@/ai/flows/audio-generation";
import { monitorInputLength } from "@/ai/flows/monitor-input-length";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  text: z.string().min(10, {
    message: "Please enter at least 10 characters.",
  }).max(10000, {
    message: "Notes cannot exceed 10,000 characters."
  }),
  tone: z.enum(["friendly", "professional", "casual"], {
    required_error: "You need to select a voice tone.",
  }),
});

export function VerbalizeForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [audioData, setAudioData] = React.useState<string | null>(null);
  const [warning, setWarning] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      tone: "professional",
    },
  });

  const textValue = form.watch("text");
  const debouncedText = useDebounce(textValue, 500);

  React.useEffect(() => {
    if (debouncedText) {
      monitorInputLength({ text: debouncedText }).then((result) => {
        if (result.isTooLong) {
          setWarning(result.warningMessage);
        } else {
          setWarning(null);
        }
      });
    } else {
      setWarning(null);
    }
  }, [debouncedText]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      let step = 0;
      timer = setInterval(() => {
        step +=1;
        setProgress(prev => {
            if (prev >= 95) {
                clearInterval(timer);
                return 95;
            }
            // Simulate slower progress towards the end
            const increment = Math.random() * 10 + (90 - prev) / 10;
            return Math.min(95, prev + increment);
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isLoading]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAudioData(null);
    try {
      const result = await generateAudio({ text: values.text });
      setProgress(100);
      setAudioData(result.media);
      toast({
        title: "Success!",
        description: "Your audio has been generated.",
      });
    } catch (error) {
      console.error("Audio generation failed:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating your audio. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm border-2">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Create your Audio Notes</CardTitle>
        <CardDescription>
          Enter your notes, choose a tone, and let our AI bring it to life.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your notes here..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Voice Tone</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="friendly" />
                        </FormControl>
                        <FormLabel className="font-normal">Friendly</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="professional" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Professional
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="casual" />
                        </FormControl>
                        <FormLabel className="font-normal">Casual</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {warning && (
              <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
                <AlertTitle>Length Warning</AlertTitle>
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col items-center space-y-4">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Generate Audio Notes
                  </>
                )}
              </Button>
               {isLoading && (
                 <div className="w-full px-4">
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground mt-2">Creating magic... please wait.</p>
                 </div>
              )}
            </div>
          </form>
        </Form>
        
        {audioData && !isLoading && (
            <div className="mt-8 p-4 border-t border-border">
                <h3 className="text-lg font-semibold mb-4 text-center font-headline">Your audio is ready!</h3>
                <div className="flex flex-col items-center gap-4">
                    <audio controls src={audioData} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                    <a href={audioData} download="verbalize-ai-audio.wav">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Audio
                        </Button>
                    </a>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
