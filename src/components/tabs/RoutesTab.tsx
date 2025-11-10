import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Anchor } from "lucide-react";
import { mockRoutes } from "@/data/mockRoutes";
import { Route } from "@/types/route";
import { toast } from "sonner";

const RoutesTab = () => {
  const [routes, setRoutes] = useState<Route[]>(mockRoutes);
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string>("all");
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const filteredRoutes = routes.filter((route) => {
    if (vesselTypeFilter !== "all" && route.vesselType !== vesselTypeFilter) return false;
    if (fuelTypeFilter !== "all" && route.fuelType !== fuelTypeFilter) return false;
    if (yearFilter !== "all" && route.year.toString() !== yearFilter) return false;
    return true;
  });

  const handleSetBaseline = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((route) => ({
        ...route,
        isBaseline: route.routeId === routeId,
      }))
    );
    toast.success(`Route ${routeId} set as baseline`);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Routes</CardDescription>
            <CardTitle className="text-3xl">{filteredRoutes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg GHG Intensity</CardDescription>
            <CardTitle className="text-3xl">
              {(filteredRoutes.reduce((sum, r) => sum + r.ghgIntensity, 0) / filteredRoutes.length).toFixed(1)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Distance</CardDescription>
            <CardTitle className="text-3xl">
              {(filteredRoutes.reduce((sum, r) => sum + r.distance, 0) / 1000).toFixed(0)}k km
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Emissions</CardDescription>
            <CardTitle className="text-3xl">
              {(filteredRoutes.reduce((sum, r) => sum + r.totalEmissions, 0) / 1000).toFixed(1)}kt
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-primary" />
                Route Registry
              </CardTitle>
              <CardDescription>View and manage all maritime routes</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={vesselTypeFilter} onValueChange={setVesselTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Vessel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="BulkCarrier">Bulk Carrier</SelectItem>
                  <SelectItem value="Tanker">Tanker</SelectItem>
                  <SelectItem value="RoRo">RoRo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fuels</SelectItem>
                  <SelectItem value="HFO">HFO</SelectItem>
                  <SelectItem value="LNG">LNG</SelectItem>
                  <SelectItem value="MGO">MGO</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Vessel Type</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">GHG Intensity</TableHead>
                  <TableHead className="text-right">Fuel (t)</TableHead>
                  <TableHead className="text-right">Distance (km)</TableHead>
                  <TableHead className="text-right">Emissions (t)</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.routeId}>
                    <TableCell className="font-mono font-medium">{route.routeId}</TableCell>
                    <TableCell>{route.vesselType}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{route.fuelType}</Badge>
                    </TableCell>
                    <TableCell>{route.year}</TableCell>
                    <TableCell className="text-right font-mono">{route.ghgIntensity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{route.fuelConsumption.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{route.distance.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{route.totalEmissions.toLocaleString()}</TableCell>
                    <TableCell>
                      {route.isBaseline ? (
                        <Badge>Baseline</Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleSetBaseline(route.routeId)}>
                          Set Baseline
                        </Button>
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

export default RoutesTab;
