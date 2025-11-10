import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingDown, TrendingUp, Target } from "lucide-react";
import { mockRoutes, TARGET_INTENSITY_2025 } from "@/data/mockRoutes";
import { ComparisonData } from "@/types/route";

const CompareTab = () => {
  const baseline = mockRoutes.find((r) => r.isBaseline);

  const comparisons: ComparisonData[] = useMemo(() => {
    if (!baseline) return [];

    return mockRoutes
      .filter((r) => !r.isBaseline)
      .map((route) => {
        const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity - 1) * 100);
        const compliant = route.ghgIntensity <= TARGET_INTENSITY_2025;

        return {
          baseline,
          comparison: route,
          percentDiff,
          compliant,
        };
      });
  }, [baseline]);

  const chartData = useMemo(() => {
    if (!baseline) return [];

    return [
      { name: baseline.routeId, value: baseline.ghgIntensity, type: "Baseline" },
      ...comparisons.map((c) => ({
        name: c.comparison.routeId,
        value: c.comparison.ghgIntensity,
        type: c.compliant ? "Compliant" : "Non-Compliant",
      })),
    ];
  }, [baseline, comparisons]);

  if (!baseline) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No Baseline Set</p>
            <p className="text-sm text-muted-foreground">Please set a baseline route first</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Baseline Intensity</CardDescription>
            <CardTitle className="text-3xl">{baseline.ghgIntensity.toFixed(2)}</CardTitle>
            <p className="text-xs text-muted-foreground">gCO₂e/MJ</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Target Intensity (2025)</CardDescription>
            <CardTitle className="text-3xl text-accent">{TARGET_INTENSITY_2025.toFixed(2)}</CardTitle>
            <p className="text-xs text-muted-foreground">2% below 91.16 gCO₂e/MJ</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Compliant Routes</CardDescription>
            <CardTitle className="text-3xl text-success">
              {comparisons.filter((c) => c.compliant).length}/{comparisons.length}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {((comparisons.filter((c) => c.compliant).length / comparisons.length) * 100).toFixed(0)}% compliance rate
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>GHG Intensity Comparison</CardTitle>
          <CardDescription>Baseline vs. all routes (target: {TARGET_INTENSITY_2025.toFixed(2)} gCO₂e/MJ)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis label={{ value: "gCO₂e/MJ", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <ReferenceLine y={TARGET_INTENSITY_2025} stroke="hsl(var(--accent))" strokeDasharray="3 3" label="Target" />
              <Bar dataKey="value" fill="hsl(var(--primary))" name="GHG Intensity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
          <CardDescription>Route-by-route analysis against baseline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Vessel Type</TableHead>
                  <TableHead className="text-right">GHG Intensity</TableHead>
                  <TableHead className="text-right">vs Baseline</TableHead>
                  <TableHead className="text-right">vs Target</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((comp) => (
                  <TableRow key={comp.comparison.routeId}>
                    <TableCell className="font-mono font-medium">{comp.comparison.routeId}</TableCell>
                    <TableCell>{comp.comparison.vesselType}</TableCell>
                    <TableCell className="text-right font-mono">{comp.comparison.ghgIntensity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {comp.percentDiff > 0 ? (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-success" />
                        )}
                        <span className={comp.percentDiff > 0 ? "text-destructive" : "text-success"}>
                          {comp.percentDiff > 0 ? "+" : ""}
                          {comp.percentDiff.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={comp.comparison.ghgIntensity <= TARGET_INTENSITY_2025 ? "text-success" : "text-destructive"}>
                        {((comp.comparison.ghgIntensity / TARGET_INTENSITY_2025 - 1) * 100).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {comp.compliant ? (
                        <Badge variant="outline" className="border-success text-success">
                          ✓ Compliant
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-destructive text-destructive">
                          ✗ Non-Compliant
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompareTab;
