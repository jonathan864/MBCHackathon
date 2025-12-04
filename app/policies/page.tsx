"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Plus, Trash2, Save, FileText, PlayCircle, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { Policy, Rule, BacktestResponse } from "@/agent/types";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newPolicyDescription, setNewPolicyDescription] = useState("");
  const [newRules, setNewRules] = useState<Rule[]>([]);
  const [ruleType, setRuleType] = useState<string>("");
  const [ruleValue, setRuleValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [backtestLoading, setBacktestLoading] = useState<string | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResponse | null>(null);
  const [showBacktestDialog, setShowBacktestDialog] = useState(false);
  const [backtestError, setBacktestError] = useState<string | null>(null);

  const AVAILABLE_CATEGORIES = ["Politics", "Crypto", "Sports", "Culture", "Economy", "Technology"];

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/policies");
      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const addRule = () => {
    let newRule: Rule;

    switch (ruleType) {
      case "maxSize":
        if (!ruleValue) {
          alert("Please enter a value");
          return;
        }
        newRule = { type: "maxSize", max: parseFloat(ruleValue) };
        break;
      case "perMarketCap":
        if (!ruleValue) {
          alert("Please enter a value");
          return;
        }
        newRule = { type: "perMarketCap", max: parseFloat(ruleValue) };
        break;
      case "whitelistMarkets":
        if (!ruleValue) {
          alert("Please enter market IDs");
          return;
        }
        newRule = {
          type: "whitelistMarkets",
          allowedIds: ruleValue.split(",").map((id) => id.trim()),
        };
        break;
      case "minLiquidity":
        if (!ruleValue) {
          alert("Please enter a value");
          return;
        }
        newRule = { type: "minLiquidity", min: parseFloat(ruleValue) };
        break;
      case "allowCategories":
        if (selectedCategories.length === 0) {
          alert("Please select at least one category");
          return;
        }
        newRule = { type: "allowCategories", categories: selectedCategories };
        break;
      case "maxPrice":
        if (!ruleValue) {
          alert("Please enter a value");
          return;
        }
        const priceValue = parseFloat(ruleValue);
        if (priceValue < 0 || priceValue > 1) {
          alert("Price must be between 0 and 1");
          return;
        }
        newRule = { type: "maxPrice", max: priceValue };
        break;
      default:
        alert("Please select a rule type");
        return;
    }

    setNewRules([...newRules, newRule]);
    setRuleValue("");
    setRuleType("");
    setSelectedCategories([]);
  };

  const removeRule = (index: number) => {
    setNewRules(newRules.filter((_, i) => i !== index));
  };

  const savePolicy = async () => {
    if (!newPolicyName.trim()) {
      alert("Please enter a strategy name");
      return;
    }

    if (newRules.length === 0) {
      alert("Please add at least one rule");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPolicyName,
          description: newPolicyDescription,
          rules: newRules,
        }),
      });

      if (response.ok) {
        await fetchPolicies();
        setNewPolicyName("");
        setNewPolicyDescription("");
        setNewRules([]);
        alert("Strategy created successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create strategy");
      }
    } catch (error) {
      console.error("Failed to create policy:", error);
      alert("Failed to create strategy");
    } finally {
      setLoading(false);
    }
  };

  const formatRule = (rule: Rule): string => {
    switch (rule.type) {
      case "maxSize":
        return `Max Size: $${rule.max}`;
      case "perMarketCap":
        return `Per Market Cap: $${rule.max}`;
      case "whitelistMarkets":
        return `Whitelist: ${rule.allowedIds.join(", ")}`;
      case "minLiquidity":
        return `Min liquidity: $${rule.min.toLocaleString()}`;
      case "allowCategories":
        return `Allowed categories: ${rule.categories.join(", ")}`;
      case "maxPrice":
        return `Max price: ${rule.max}`;
      default:
        return "Unknown rule";
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const runBacktest = async (strategyId: string) => {
    setBacktestLoading(strategyId);
    setBacktestError(null);
    try {
      const response = await fetch("/api/polymarket/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });

      const data = await response.json();

      if (response.ok) {
        setBacktestResults(data);
        setShowBacktestDialog(true);
      } else {
        setBacktestError(data.error || "Failed to run backtest");
        alert(data.error || "Failed to run backtest");
      }
    } catch (error) {
      console.error("Failed to run backtest:", error);
      setBacktestError("Network error occurred");
      alert("Failed to run backtest");
    } finally {
      setBacktestLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Strategy Management</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Define guardrail strategies for AI trading agents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Strategy</CardTitle>
              <CardDescription>
                Add rules to control agent behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="policyName">Strategy Name</Label>
                <Input
                  id="policyName"
                  placeholder="e.g., Conservative Trading Strategy"
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyDescription">Description</Label>
                <Input
                  id="policyDescription"
                  placeholder="e.g., Low-risk trading with strict position limits"
                  value={newPolicyDescription}
                  onChange={(e) => setNewPolicyDescription(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label>Add Rules</Label>
                <div className="space-y-3">
                  <Select value={ruleType} onValueChange={(value) => {
                    console.log('Rule type changed to:', value);
                    setRuleType(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maxSize">Max Size</SelectItem>
                      <SelectItem value="perMarketCap">Per Market Cap</SelectItem>
                      <SelectItem value="whitelistMarkets">Whitelist Markets</SelectItem>
                      <SelectItem value="minLiquidity">Minimum Liquidity</SelectItem>
                      <SelectItem value="allowCategories">Allowed Categories</SelectItem>
                      <SelectItem value="maxPrice">Max Price Threshold</SelectItem>
                    </SelectContent>
                  </Select>

                  {ruleType && (
                    <div className="text-xs text-slate-500 italic">
                      Current rule type: {ruleType}
                    </div>
                  )}

                  {ruleType === "maxSize" && (
                    <Input
                      type="number"
                      placeholder="Maximum position size (e.g., 50)"
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                    />
                  )}

                  {ruleType === "perMarketCap" && (
                    <Input
                      type="number"
                      placeholder="Maximum per market (e.g., 30)"
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                    />
                  )}

                  {ruleType === "whitelistMarkets" && (
                    <Input
                      placeholder="Comma-separated market IDs (e.g., election-2024, btc-price)"
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                    />
                  )}

                  {ruleType === "minLiquidity" && (
                    <div className="space-y-2">
                      <Label>Minimum Liquidity (USD)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 50000"
                        value={ruleValue}
                        onChange={(e) => setRuleValue(e.target.value)}
                      />
                    </div>
                  )}

                  {ruleType === "allowCategories" && (
                    <div className="space-y-3 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
                      <Label className="text-base font-semibold text-blue-900">Allowed Categories</Label>
                      <p className="text-sm text-blue-700">Select which categories the agent can trade in</p>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {AVAILABLE_CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center space-x-3">
                            <Checkbox
                              id={category}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <label
                              htmlFor={category}
                              className="text-sm font-medium leading-none cursor-pointer select-none"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                      {selectedCategories.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-sm text-slate-600">
                            Selected: <span className="font-medium text-slate-900">{selectedCategories.join(", ")}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {ruleType === "maxPrice" && (
                    <div className="space-y-2">
                      <Label>Max Price (0–1)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        placeholder="e.g., 0.6"
                        value={ruleValue}
                        onChange={(e) => setRuleValue(e.target.value)}
                      />
                    </div>
                  )}

                  <Button
                    onClick={addRule}
                    variant="outline"
                    className="w-full"
                    disabled={!ruleType}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rule to Strategy
                  </Button>
                </div>
              </div>

              {newRules.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Rules</Label>
                  <div className="space-y-2">
                    {newRules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                      >
                        <span className="text-sm text-slate-700">
                          {formatRule(rule)}
                        </span>
                        <Button
                          onClick={() => removeRule(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={savePolicy}
                disabled={loading || !newPolicyName || newRules.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Strategy
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Strategies</CardTitle>
              <CardDescription>
                {policies.length} {policies.length === 1 ? "strategy" : "strategies"} configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No strategies yet</p>
                  <p className="text-sm mt-2">Create your first strategy to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <Card key={policy.id} className="border-slate-200 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2 mb-2">
                              <Shield className="h-5 w-5 text-blue-600" />
                              {policy.name}
                            </CardTitle>
                            {(policy as any).description && (
                              <CardDescription className="text-sm">
                                {(policy as any).description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => runBacktest(policy.id)}
                              size="sm"
                              variant="outline"
                              disabled={backtestLoading === policy.id}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              {backtestLoading === policy.id ? (
                                <>
                                  <BarChart3 className="mr-2 h-4 w-4 animate-pulse" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  Run Backtest
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                localStorage.setItem('selectedStrategyId', policy.id);
                                alert('Default strategy set! The Dashboard will now use this strategy.');
                              }}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Use in Dashboard
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">
                            {policy.rules.length} {policy.rules.length === 1 ? 'Rule' : 'Rules'}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {policy.rules.map((rule, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {formatRule(rule)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showBacktestDialog} onOpenChange={setShowBacktestDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Backtest Results: {backtestResults?.strategyName}
            </DialogTitle>
            <DialogDescription>
              Strategy evaluation across all available markets
            </DialogDescription>
          </DialogHeader>

          {backtestResults && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Total Markets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-slate-900">
                      {backtestResults.summary.totalMarkets}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Allowed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {backtestResults.summary.allowedCount}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {backtestResults.summary.totalMarkets > 0
                        ? ((backtestResults.summary.allowedCount / backtestResults.summary.totalMarkets) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Blocked
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">
                      {backtestResults.summary.blockedCount}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {backtestResults.summary.totalMarkets > 0
                        ? ((backtestResults.summary.blockedCount / backtestResults.summary.totalMarkets) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {Object.keys(backtestResults.summary.breakdownByReason).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rejection Reasons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(backtestResults.summary.breakdownByReason).map(([reason, count]) => (
                        <div key={reason} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">{reason}</span>
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            {count} {count === 1 ? 'market' : 'markets'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Market Details</CardTitle>
                  <CardDescription>
                    All {backtestResults.results.length} markets evaluated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Market
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Category
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Liquidity
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            YES Price
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {backtestResults.results.map((result, index) => (
                          <tr
                            key={index}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-900 max-w-md">
                                  {result.marketQuestion}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-100 text-slate-600"
                              >
                                {result.marketCategory}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700">
                              ${result.liquidity.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-900">
                              {(result.yesPrice * 100).toFixed(1)}%
                            </td>
                            <td className="py-3 px-4">
                              {result.allowed ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Allowed
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Blocked
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {result.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
