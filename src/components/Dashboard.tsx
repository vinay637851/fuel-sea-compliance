import { useState } from "react";
import { Ship, TrendingUp, Wallet, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutesTab from "./tabs/RoutesTab";
import CompareTab from "./tabs/CompareTab";
import BankingTab from "./tabs/BankingTab";
import PoolingTab from "./tabs/PoolingTab";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("routes");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Ship className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">FuelEU Maritime</h1>
                <p className="text-sm text-muted-foreground">Compliance Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm font-medium text-success">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted p-1">
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              <span className="hidden sm:inline">Routes</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Banking</span>
            </TabsTrigger>
            <TabsTrigger value="pooling" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pooling</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="space-y-4">
            <RoutesTab />
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <CompareTab />
          </TabsContent>

          <TabsContent value="banking" className="space-y-4">
            <BankingTab />
          </TabsContent>

          <TabsContent value="pooling" className="space-y-4">
            <PoolingTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
