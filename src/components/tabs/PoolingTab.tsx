import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { mockComplianceBalances } from "@/data/mockRoutes";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PoolMemberWithSelection {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
  selected: boolean;
}

const PoolingTab = () => {
  const [members, setMembers] = useState<PoolMemberWithSelection[]>(
    mockComplianceBalances.map((cb) => ({
      shipId: cb.shipId,
      cbBefore: cb.cbGCO2eq,
      cbAfter: cb.cbGCO2eq,
      selected: false,
    }))
  );

  const selectedMembers = members.filter((m) => m.selected);
  const totalCB = selectedMembers.reduce((sum, m) => sum + m.cbBefore, 0);
  const isPoolValid = totalCB >= 0;

  const toggleMember = (shipId: string) => {
    setMembers(members.map((m) => (m.shipId === shipId ? { ...m, selected: !m.selected } : m)));
  };

  const calculatePooling = () => {
    if (!isPoolValid) {
      toast.error("Invalid pool configuration", {
        description: `Total CB is ${totalCB.toLocaleString()} gCO₂eq (must be ≥ 0)`
      });
      return;
    }

    if (selectedMembers.length < 2) {
      toast.error("Insufficient members", {
        description: "Pool must have at least 2 members"
      });
      return;
    }

    // Greedy allocation algorithm (Article 21)
    const sorted = [...selectedMembers].sort((a, b) => b.cbBefore - a.cbBefore);
    const newAllocations = sorted.map((m) => ({ ...m, cbAfter: m.cbBefore }));

    // Transfer surplus to deficits
    for (let i = 0; i < newAllocations.length; i++) {
      if (newAllocations[i].cbAfter > 0) {
        for (let j = newAllocations.length - 1; j >= 0; j--) {
          if (newAllocations[j].cbAfter < 0) {
            const transfer = Math.min(
              newAllocations[i].cbAfter, 
              Math.abs(newAllocations[j].cbAfter)
            );
            newAllocations[i].cbAfter -= transfer;
            newAllocations[j].cbAfter += transfer;
          }
        }
      }
    }

    // Validate Article 21 rules
    const violations: string[] = [];
    
    newAllocations.forEach((m) => {
      // Rule 1: Deficit ship cannot exit worse
      if (m.cbBefore < 0 && m.cbAfter < m.cbBefore) {
        violations.push(`${m.shipId}: deficit cannot worsen`);
      }
      
      // Rule 2: Surplus ship cannot exit negative
      if (m.cbBefore > 0 && m.cbAfter < 0) {
        violations.push(`${m.shipId}: surplus cannot go negative`);
      }
    });

    if (violations.length > 0) {
      toast.error("Pool violates Article 21 rules", {
        description: violations.join("; ")
      });
      return;
    }

    // Calculate improvements
    const improvements = newAllocations.filter((m) => {
      if (m.cbBefore < 0) return m.cbAfter > m.cbBefore;
      return false;
    });

    // Update state
    setMembers(
      members.map((m) => {
        const allocated = newAllocations.find((a) => a.shipId === m.shipId);
        return allocated ? { ...m, cbAfter: allocated.cbAfter } : m;
      })
    );

    toast.success("Pool created successfully", {
      description: `${improvements.length} ship(s) improved compliance balance`
    });
  };

  const resetPool = () => {
    setMembers(
      members.map((m) => ({
        ...m,
        cbAfter: m.cbBefore,
        selected: false,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Selected Ships</CardDescription>
            <CardTitle className="text-3xl">{selectedMembers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Pool CB</CardDescription>
            <CardTitle className="text-3xl">
              {totalCB >= 0 ? "+" : ""}
              {totalCB.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pool Status</CardDescription>
            <div className="flex items-center gap-2">
              {isPoolValid ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <CardTitle className="text-2xl text-success">Valid</CardTitle>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-2xl text-destructive">Invalid</CardTitle>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Pool Rules */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Article 21 - Pooling Rules:</strong> Sum of adjusted CB must be ≥ 0. Deficit ships cannot exit worse. Surplus ships cannot exit negative.
        </AlertDescription>
      </Alert>

      {/* Member Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Pool Members
              </CardTitle>
              <CardDescription>Select ships to create a compliance pool</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetPool}>
                Reset
              </Button>
              <Button onClick={calculatePooling} disabled={!isPoolValid || selectedMembers.length < 2}>
                Create Pool
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Ship ID</TableHead>
                  <TableHead className="text-right">CB Before (gCO₂eq)</TableHead>
                  <TableHead className="text-right">CB After (gCO₂eq)</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const change = member.cbAfter - member.cbBefore;
                  return (
                    <TableRow key={member.shipId} className={member.selected ? "bg-accent/10" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={member.selected}
                          onCheckedChange={() => toggleMember(member.shipId)}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium">{member.shipId}</TableCell>
                      <TableCell className="text-right">
                        <span className={member.cbBefore >= 0 ? "text-success" : "text-destructive"}>
                          {member.cbBefore >= 0 ? "+" : ""}
                          {member.cbBefore.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={member.cbAfter >= 0 ? "text-success" : "text-destructive"}>
                          {member.cbAfter >= 0 ? "+" : ""}
                          {member.cbAfter.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {change !== 0 && (
                          <span className={change > 0 ? "text-success" : "text-muted-foreground"}>
                            {change > 0 ? "+" : ""}
                            {change.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.cbBefore >= 0 ? (
                          <Badge variant="outline" className="border-success text-success">
                            Surplus
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-destructive text-destructive">
                            Deficit
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PoolingTab;
