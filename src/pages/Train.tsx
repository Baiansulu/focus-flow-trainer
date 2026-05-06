import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteChrome";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Target, Palette, Brain } from "lucide-react";
import TargetReflex from "@/games/TargetReflex";
import ColorMatch from "@/games/ColorMatch";
import MemorySequence from "@/games/MemorySequence";

const Train = () => {
  const [tab, setTab] = useState("reflex");

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteNav />
      <main className="container py-10">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Training Arena</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold">Choose your training game</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Three adaptive mini-games target different facets of attention: reflex, selective focus, and working memory. Each session feeds into your dashboard.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="reflex" className="gap-2"><Target className="h-4 w-4" /> Target Reflex</TabsTrigger>
            <TabsTrigger value="stroop" className="gap-2"><Palette className="h-4 w-4" /> Color Match</TabsTrigger>
            <TabsTrigger value="memory" className="gap-2"><Brain className="h-4 w-4" /> Memory</TabsTrigger>
          </TabsList>
          <TabsContent value="reflex"><TargetReflex /></TabsContent>
          <TabsContent value="stroop"><ColorMatch /></TabsContent>
          <TabsContent value="memory"><MemorySequence /></TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Train;
