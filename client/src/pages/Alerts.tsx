import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Bell, BellOff, Check, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: AlertCondition[];
  logic: 'AND' | 'OR';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notificationEnabled: boolean;
}

interface AlertCondition {
  id: string;
  category: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  type: 'threshold' | 'change' | 'rate';
}

interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: string;
  message: string;
  priority: string;
  acknowledged: boolean;
}

const CATEGORIES = [
  'Overall',
  'Liquidity',
  'Valuation',
  'Macro',
  'Credit',
  'Technical',
  'Sentiment',
  'Qualitative',
  'Global',
];

export default function Alerts() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);

  // Load rules and history from localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem('alertRules');
    const savedHistory = localStorage.getItem('alertHistory');
    
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save rules to localStorage
  useEffect(() => {
    if (rules.length > 0) {
      localStorage.setItem('alertRules', JSON.stringify(rules));
    }
  }, [rules]);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('alertHistory', JSON.stringify(history));
    }
  }, [history]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const createNewRule = () => {
    const newRule: AlertRule = {
      id: Date.now().toString(),
      name: 'New Alert Rule',
      enabled: true,
      conditions: [
        {
          id: Date.now().toString(),
          category: 'Overall',
          operator: '>',
          value: 75,
          type: 'threshold',
        },
      ],
      logic: 'AND',
      priority: 'medium',
      notificationEnabled: true,
    };
    setEditingRule(newRule);
    setShowRuleBuilder(true);
  };

  const saveRule = () => {
    if (!editingRule) return;
    
    const existingIndex = rules.findIndex(r => r.id === editingRule.id);
    if (existingIndex >= 0) {
      const updated = [...rules];
      updated[existingIndex] = editingRule;
      setRules(updated);
    } else {
      setRules([...rules, editingRule]);
    }
    
    setEditingRule(null);
    setShowRuleBuilder(false);
    toast.success('Alert rule saved successfully!');
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    toast.success('Alert rule deleted');
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const addCondition = () => {
    if (!editingRule) return;
    
    const newCondition: AlertCondition = {
      id: Date.now().toString(),
      category: 'Overall',
      operator: '>',
      value: 60,
      type: 'threshold',
    };
    
    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions, newCondition],
    });
  };

  const removeCondition = (conditionId: string) => {
    if (!editingRule) return;
    
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.filter(c => c.id !== conditionId),
    });
  };

  const updateCondition = (conditionId: string, updates: Partial<AlertCondition>) => {
    if (!editingRule) return;
    
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.map(c =>
        c.id === conditionId ? { ...c, ...updates } : c
      ),
    });
  };

  const acknowledgeAlert = (id: string) => {
    setHistory(history.map(h =>
      h.id === id ? { ...h, acknowledged: true } : h
    ));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('alertHistory');
    toast.success('Alert history cleared');
  };

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Risk29 Alert Test', {
          body: 'This is a test notification from Risk29 Dashboard',
          icon: '/favicon.ico',
        });
        toast.success('Test notification sent!');
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Risk29 Alert Test', {
              body: 'This is a test notification from Risk29 Dashboard',
              icon: '/favicon.ico',
            });
            toast.success('Test notification sent!');
          }
        });
      } else {
        toast.error('Notifications are blocked. Please enable them in your browser settings.');
      }
    } else {
      toast.error('Notifications are not supported in this browser');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-blue-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Enhanced Alert System</h1>
              <p className="text-muted-foreground">
                Create advanced alert rules with multiple conditions
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={testNotification} variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Test Notification
            </Button>
            <Button onClick={createNewRule}>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>
        </div>

        {/* Rule Builder Modal */}
        {showRuleBuilder && editingRule && (
          <Card className="p-6 mb-8 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-4">Alert Rule Builder</h2>
            
            <div className="space-y-4">
              {/* Rule Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Rule Name</label>
                <Input
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="Enter rule name"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={editingRule.priority}
                  onValueChange={(value: any) => setEditingRule({ ...editingRule, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Condition Logic */}
              <div>
                <label className="text-sm font-medium mb-2 block">Condition Logic</label>
                <Select
                  value={editingRule.logic}
                  onValueChange={(value: any) => setEditingRule({ ...editingRule, logic: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">All conditions must match (AND)</SelectItem>
                    <SelectItem value="OR">Any condition can match (OR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Conditions</label>
                  <Button onClick={addCondition} size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Condition
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {editingRule.conditions.map((condition, idx) => (
                    <div key={condition.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Select
                        value={condition.category}
                        onValueChange={(value) => updateCondition(condition.id, { category: value })}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(value: any) => updateCondition(condition.id, { operator: value })}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">{'>'}</SelectItem>
                          <SelectItem value="<">{'<'}</SelectItem>
                          <SelectItem value=">=">{'>='}</SelectItem>
                          <SelectItem value="<=">{'<='}</SelectItem>
                          <SelectItem value="==">{'=='}</SelectItem>
                          <SelectItem value="!=">{'!='}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: parseFloat(e.target.value) })}
                        className="w-[100px]"
                      />

                      <Button
                        onClick={() => removeCondition(condition.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Browser Notifications</label>
                <Switch
                  checked={editingRule.notificationEnabled}
                  onCheckedChange={(checked) => setEditingRule({ ...editingRule, notificationEnabled: checked })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={saveRule}>Save Rule</Button>
                <Button onClick={() => { setEditingRule(null); setShowRuleBuilder(false); }} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Rules */}
        <Card className="p-6 mb-8 bg-card text-card-foreground">
          <h2 className="text-xl font-bold mb-4">Active Alert Rules</h2>
          
          {rules.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No alert rules configured. Click "New Rule" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Button
                      onClick={() => toggleRule(rule.id)}
                      size="icon"
                      variant="ghost"
                    >
                      {rule.enabled ? (
                        <Bell className="h-5 w-5 text-green-500" />
                      ) : (
                        <BellOff className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="font-semibold">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {rule.conditions.length} condition(s) • {rule.logic} logic • 
                        <span className={`ml-1 ${getPriorityColor(rule.priority)}`}>
                          {rule.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => { setEditingRule(rule); setShowRuleBuilder(true); }}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteRule(rule.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Alert History */}
        <Card className="p-6 bg-card text-card-foreground">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Alert History</h2>
            {history.length > 0 && (
              <Button onClick={clearHistory} size="sm" variant="outline">
                Clear History
              </Button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No alerts triggered yet
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 20).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.acknowledged ? 'bg-muted/30' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${getPriorityColor(alert.priority)}`}>
                        {alert.ruleName}
                      </span>
                      {alert.acknowledged && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{alert.timestamp}</div>
                  </div>
                  
                  {!alert.acknowledged && (
                    <Button
                      onClick={() => acknowledgeAlert(alert.id)}
                      size="sm"
                      variant="outline"
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
