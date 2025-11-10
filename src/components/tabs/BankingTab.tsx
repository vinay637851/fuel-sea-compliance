import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { mockComplianceBalances } from "@/data/mockRoutes";
import { toast } from "sonner";

interface BankTransaction {
  id: string;
  shipId: string;
  type: "bank" | "apply";
  amount: number;
  date: string;
  cbBefore: number;
  cbAfter: number;
}

const BankingTab = () => {
  const [selectedShip, setSelectedShip] = useState(mockComplianceBalances[0].shipId);
  const [bankAmount, setBankAmount] = useState("");
  const [applyAmount, setApplyAmount] = useState("");
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [balances, setBalances] = useState(mockComplianceBalances);

  const currentBalance = balances.find((b) => b.shipId === selectedShip);
  const bankedAmount = transactions
    .filter((t) => t.shipId === selectedShip && t.type === "bank")
    .reduce((sum, t) => sum + t.amount, 0) -
    transactions
      .filter((t) => t.shipId === selectedShip && t.type === "apply")
      .reduce((sum, t) => sum + t.amount, 0);

  const handleBank = () => {
    if (!currentBalance || currentBalance.cbGCO2eq <= 0) {
      toast.error("Cannot bank negative or zero compliance balance", {
        description: "Only positive CB can be banked for future use"
      });
      return;
    }

    const amount = parseFloat(bankAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a positive number"
      });
      return;
    }

    if (amount > currentBalance.cbGCO2eq) {
      toast.error("Insufficient balance", {
        description: `Available: ${currentBalance.cbGCO2eq.toLocaleString()} gCO₂eq`
      });
      return;
    }

    const transaction: BankTransaction = {
      id: `TXN${Date.now()}`,
      shipId: selectedShip,
      type: "bank",
      amount,
      date: new Date().toISOString(),
      cbBefore: currentBalance.cbGCO2eq,
      cbAfter: currentBalance.cbGCO2eq - amount,
    };

    setTransactions([transaction, ...transactions]);
    setBalances(balances.map((b) =>
      b.shipId === selectedShip ? { ...b, cbGCO2eq: b.cbGCO2eq - amount } : b
    ));
    setBankAmount("");
    toast.success(`Banking successful`, {
      description: `Banked ${amount.toLocaleString()} gCO₂eq from ${selectedShip}`
    });
  };

  const handleApply = () => {
    if (!currentBalance) {
      toast.error("No ship selected");
      return;
    }

    if (currentBalance.cbGCO2eq >= 0) {
      toast.error("Cannot apply to surplus", {
        description: "Only deficit CB can receive banked amounts"
      });
      return;
    }

    if (bankedAmount <= 0) {
      toast.error("No banked surplus available", {
        description: "Bank positive CB first before applying"
      });
      return;
    }

    const amount = parseFloat(applyAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a positive number"
      });
      return;
    }

    if (amount > bankedAmount) {
      toast.error("Insufficient banked amount", {
        description: `Available: ${bankedAmount.toLocaleString()} gCO₂eq`
      });
      return;
    }

    // Calculate the maximum useful amount (don't over-apply)
    const maxUseful = Math.abs(currentBalance.cbGCO2eq);
    const actualAmount = Math.min(amount, maxUseful);

    if (actualAmount < amount) {
      toast.warning("Amount adjusted", {
        description: `Applied ${actualAmount.toLocaleString()} gCO₂eq (max needed)`
      });
    }

    const transaction: BankTransaction = {
      id: `TXN${Date.now()}`,
      shipId: selectedShip,
      type: "apply",
      amount: actualAmount,
      date: new Date().toISOString(),
      cbBefore: currentBalance.cbGCO2eq,
      cbAfter: currentBalance.cbGCO2eq + actualAmount,
    };

    setTransactions([transaction, ...transactions]);
    setBalances(balances.map((b) =>
      b.shipId === selectedShip ? { ...b, cbGCO2eq: b.cbGCO2eq + actualAmount } : b
    ));
    setApplyAmount("");
    toast.success(`Application successful`, {
      description: `Applied ${actualAmount.toLocaleString()} gCO₂eq to ${selectedShip}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Ship Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Banking Overview
          </CardTitle>
          <CardDescription>Manage compliance balance banking per Article 20</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {balances.map((balance) => (
              <button
                key={balance.shipId}
                onClick={() => setSelectedShip(balance.shipId)}
                className={`rounded-lg border p-4 text-left transition-all hover:border-primary ${
                  selectedShip === balance.shipId ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="font-mono text-sm text-muted-foreground">{balance.shipId}</div>
                <div className="mt-2 text-2xl font-bold">
                  {balance.cbGCO2eq >= 0 ? "+" : ""}
                  {balance.cbGCO2eq.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">gCO₂eq</div>
                {balance.cbGCO2eq > 0 ? (
                  <Badge variant="outline" className="mt-2 border-success text-success">
                    Surplus
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-2 border-destructive text-destructive">
                    Deficit
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Banking Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bank Positive CB */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-accent" />
              Bank Surplus
            </CardTitle>
            <CardDescription>Save positive compliance balance for future use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current CB ({selectedShip})</Label>
              <div className={`text-2xl font-bold ${currentBalance && currentBalance.cbGCO2eq >= 0 ? 'text-success' : 'text-destructive'}`}>
                {currentBalance
                  ? `${currentBalance.cbGCO2eq >= 0 ? '+' : ''}${currentBalance.cbGCO2eq.toLocaleString()}`
                  : "0"}{" "}
                gCO₂eq
              </div>
            </div>
            {currentBalance && currentBalance.cbGCO2eq > 0 && (
              <div className="rounded-lg bg-success/10 p-3">
                <p className="text-sm text-success">
                  ✓ Available to bank: {currentBalance.cbGCO2eq.toLocaleString()} gCO₂eq
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="bank-amount">Amount to Bank</Label>
              <Input
                id="bank-amount"
                type="number"
                placeholder="Enter amount"
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                disabled={!currentBalance || currentBalance.cbGCO2eq <= 0}
              />
            </div>
            <Button
              onClick={handleBank}
              disabled={!currentBalance || currentBalance.cbGCO2eq <= 0}
              className="w-full"
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Bank Surplus
            </Button>
          </CardContent>
        </Card>

        {/* Apply Banked */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-accent" />
              Apply Banked
            </CardTitle>
            <CardDescription>Use banked surplus to cover deficit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Banked Surplus ({selectedShip})</Label>
              <div className="text-2xl font-bold text-primary">
                {bankedAmount.toLocaleString()} gCO₂eq
              </div>
            </div>
            {currentBalance && currentBalance.cbGCO2eq < 0 && bankedAmount > 0 && (
              <div className="rounded-lg bg-warning/10 p-3">
                <p className="text-sm text-warning">
                  ⚠ Deficit detected: {currentBalance.cbGCO2eq.toLocaleString()} gCO₂eq
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Apply banked surplus to reduce deficit
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="apply-amount">Amount to Apply</Label>
              <Input
                id="apply-amount"
                type="number"
                placeholder="Enter amount"
                value={applyAmount}
                onChange={(e) => setApplyAmount(e.target.value)}
                disabled={!currentBalance || currentBalance.cbGCO2eq >= 0 || bankedAmount <= 0}
              />
            </div>
            <Button
              onClick={handleApply}
              disabled={!currentBalance || currentBalance.cbGCO2eq >= 0 || bankedAmount <= 0}
              className="w-full"
            >
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Apply from Bank
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Banking and application records for {selectedShip}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.filter((t) => t.shipId === selectedShip).length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-center">
              <div>
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No transactions yet</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">CB Before</TableHead>
                    <TableHead className="text-right">CB After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter((t) => t.shipId === selectedShip)
                    .map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono">{txn.id}</TableCell>
                        <TableCell>
                          <Badge variant={txn.type === "bank" ? "default" : "secondary"}>
                            {txn.type === "bank" ? "Bank" : "Apply"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(txn.date).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">
                          {txn.type === "bank" ? "-" : "+"}
                          {txn.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{txn.cbBefore.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{txn.cbAfter.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankingTab;
