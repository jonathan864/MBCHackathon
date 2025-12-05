"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Shield, TrendingUp, AlertTriangle, CheckCircle, PlayCircle, RefreshCw, Link2 } from "lucide-react";
import { EvaluationLog, Policy } from "@/agent/types";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [logs, setLogs] = useState<EvaluationLog[]>([]);
  const [strategies, setStrategies] = useState<Policy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [loggingOnchain, setLoggingOnchain] = useState<Record<string, boolean>>({});
  const [loggedOnchain, setLoggedOnchain] = useState<Record<string, string>>({});
  const [polymarketResults, setPolymarketResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/logs");
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategies = async () => {
    try {
      const response = await fetch("/api/policies");
      const data = await response.json();
      const fetchedStrategies = data.policies || [];
      setStrategies(fetchedStrategies);
      if (fetchedStrategies.length > 0 && !selectedStrategyId) {
        setSelectedStrategyId(fetchedStrategies[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
    }
  };

  const runAgent = async () => {
    if (!selectedStrategyId) {
      alert("Please select a strategy first");
      return;
    }

    setRunning(true);
    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId: selectedStrategyId }),
      });
      const data = await response.json();

      if (response.ok) {
        await fetchLogs();
      } else {
        const errorMsg = data.error || "Failed to run agent";
        alert(errorMsg.replace(/policy/gi, "strategy").replace(/policies/gi, "strategies"));
      }
    } catch (error) {
      console.error("Failed to run agent:", error);
      alert("Failed to run agent");
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStrategies();
  }, []);

  useEffect(() => {
    const savedStrategyId = localStorage.getItem('selectedStrategyId');
    if (savedStrategyId && strategies.length > 0) {
      const strategyExists = strategies.some(s => s.id === savedStrategyId);
      if (strategyExists) {
        setSelectedStrategyId(savedStrategyId);
      }
    }
  }, [strategies]);

  const allowedCount = logs.filter((log) => log.result.allowed).length;
  const blockedCount = logs.filter((log) => !log.result.allowed).length;
  const successRate = logs.length > 0 ? ((allowedCount / logs.length) * 100).toFixed(1) : "0";

  const logOnBase = async (log: EvaluationLog) => {
    if (loggingOnchain[log.id] || loggedOnchain[log.id]) {
      return;
    }

    setLoggingOnchain((prev) => ({ ...prev, [log.id]: true }));

    try {
      const response = await fetch("/api/onchain/log-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId: log.policyId,
          marketId: log.intent.marketId,
          allowed: log.result.allowed,
          reason: log.result.reason || "All rules passed",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoggedOnchain((prev) => ({ ...prev, [log.id]: data.txHash }));
        if (data.polymarket) {
          setPolymarketResults((prev) => ({ ...prev, [log.id]: data.polymarket }));
        }

        const polymarketMsg = data.polymarket?.dryRun
          ? `\nPolymarket: ${data.polymarket.side} ${data.polymarket.size} @ ${data.polymarket.price} (DRY RUN)`
          : data.polymarket?.executed
          ? `\nPolymarket: Order ${data.polymarket.orderId} executed`
          : "";

        toast({
          title: "Logged on Base ✓",
          description: (
            <div className="space-y-1">
              <p>Transaction: {data.txHash.slice(0, 10)}...{data.txHash.slice(-8)}</p>
              {polymarketMsg && <p className="text-xs">{polymarketMsg}</p>}
              <a
                href={`https://sepolia.basescan.org/tx/${data.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View on BaseScan →
              </a>
            </div>
          ),
        });
      } else {
        toast({
          title: "Failed to log on Base",
          description: data.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to log on Base:", error);
      toast({
        title: "Failed to log on Base",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoggingOnchain((prev) => ({ ...prev, [log.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">AgentGuard Sandbox</h1>
          </div>
          <p className="text-slate-600 text-lg">
            AI Trading Bot Strategy Evaluation Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{logs.length}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Allowed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{allowedCount}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Blocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{blockedCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Agent Control</CardTitle>
            <CardDescription>
              Simulate an AI trading agent proposing a trade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategy-select">Select Strategy</Label>
              <Select
                value={selectedStrategyId}
                onValueChange={setSelectedStrategyId}
              >
                <SelectTrigger id="strategy-select" className="w-full">
                  <SelectValue placeholder="Choose a strategy..." />
                </SelectTrigger>
                <SelectContent>
                  {strategies.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No strategies available
                    </SelectItem>
                  ) : (
                    strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={runAgent}
                disabled={running || !selectedStrategyId}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {running ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Run Agent Attempt
                  </>
                )}
              </Button>
              <Button
                onClick={fetchLogs}
                disabled={loading}
                variant="outline"
                size="lg"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluation History</CardTitle>
            <CardDescription>
              Recent trade intent evaluations and strategy decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No evaluations yet</p>
                <p className="text-sm mt-2">Run an agent attempt to see results</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Strategy
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Market
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Side
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Size
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Onchain
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">
                          {log.policyName || "Unknown"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-900">
                              {log.marketQuestion || log.intent.marketId}
                            </div>
                            {log.marketCategory && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"
                              >
                                {log.marketCategory}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge
                            variant={log.intent.side === "YES" ? "default" : "secondary"}
                            className={
                              log.intent.side === "YES"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                            }
                          >
                            {log.intent.side}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">
                          ${log.intent.size}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge
                            variant={log.result.allowed ? "default" : "destructive"}
                            className={
                              log.result.allowed
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }
                          >
                            {log.result.allowed ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Allowed
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Blocked
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {log.result.reason}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {loggedOnchain[log.id] ? (
                              <>
                                <a
                                  href={`https://sepolia.basescan.org/tx/${loggedOnchain[log.id]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-green-600 hover:underline flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Logged ✓
                                </a>
                                {polymarketResults[log.id]?.dryRun && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200"
                                    title={`DRY RUN: ${polymarketResults[log.id].side} ${polymarketResults[log.id].size} @ ${polymarketResults[log.id].price} on token ${polymarketResults[log.id].tokenId.slice(0, 8)}...`}
                                  >
                                    Simulated Trade ✓
                                  </Badge>
                                )}
                                {polymarketResults[log.id]?.executed && !polymarketResults[log.id]?.dryRun && (
                                  <Badge
                                    variant="default"
                                    className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
                                  >
                                    Traded on Polymarket ✓
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <Button
                                onClick={() => logOnBase(log)}
                                disabled={loggingOnchain[log.id]}
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                {loggingOnchain[log.id] ? (
                                  <>
                                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                    Logging...
                                  </>
                                ) : (
                                  <>
                                    <Link2 className="mr-1 h-3 w-3" />
                                    Log on Base
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
