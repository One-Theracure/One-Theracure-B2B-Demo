import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Patient } from '@/types/patient';
import { CarePath, CarePathCondition, CareTask } from '@/types/carePath';
import {
  getPatientCarePaths,
  createCarePath,
  completeTask,
  getConditionLabel,
  detectApplicableConditions,
} from '@/services/carePathEngine';
import { generateCheckInMessage } from '@/services/followUpAgent';
import { useToast } from '@/hooks/use-toast';
import {
  Activity, CheckCircle2, Clock, AlertTriangle,
  Plus, MessageSquare, ChevronDown, ChevronRight,
} from 'lucide-react';

interface CarePathPanelProps {
  patient: Patient | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  skipped: 'bg-muted text-muted-foreground border-border',
};

const categoryIcons: Record<string, string> = {
  lab: '🧪',
  imaging: '📷',
  referral: '🔗',
  'medication-review': '💊',
  'vitals-check': '❤️',
  'patient-education': '📚',
  'follow-up': '📅',
};

const CarePathPanel = ({ patient }: CarePathPanelProps) => {
  const [paths, setPaths] = useState<CarePath[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (patient) {
      setPaths(getPatientCarePaths(patient.id));
    } else {
      setPaths([]);
    }
  }, [patient]);

  const refresh = () => {
    if (patient) setPaths(getPatientCarePaths(patient.id));
  };

  const handleActivate = (condition: CarePathCondition) => {
    if (!patient) return;
    createCarePath(patient.id, condition);
    refresh();
    toast({ title: `Care Path Activated`, description: getConditionLabel(condition) });
  };

  const handleCompleteTask = (cpId: string, taskId: string) => {
    completeTask(cpId, taskId);
    refresh();
    toast({ title: 'Task Completed' });
  };

  const handleCheckIn = () => {
    if (!patient) return;
    const msg = generateCheckInMessage(patient.id, patient.name);
    toast({
      title: msg.type === 'escalation' ? 'Escalation Alert' : 'Check-in Generated',
      description: msg.redFlags.length > 0
        ? `${msg.redFlags.length} red flag(s) detected`
        : 'Routine check-in message generated',
      variant: msg.type === 'escalation' ? 'destructive' : 'default',
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
        <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Select a patient to view care paths</p>
      </div>
    );
  }

  const applicableConditions = detectApplicableConditions(patient.chronicConditions);
  const activeConditions = new Set(paths.filter((p) => p.status === 'active').map((p) => p.condition));
  const unactivated = applicableConditions.filter((c) => !activeConditions.has(c));

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Care Paths
        </h3>
        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={handleCheckIn}>
          <MessageSquare className="h-3 w-3" />
          Check-in
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {unactivated.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-primary">
                Suggested care paths based on patient conditions:
              </p>
              {unactivated.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-1.5 text-xs h-8 border-primary/20 text-primary hover:bg-primary/10"
                  onClick={() => handleActivate(c)}
                >
                  <Plus className="h-3 w-3" />
                  Activate: {getConditionLabel(c)}
                </Button>
              ))}
            </div>
          )}

          {paths.filter((p) => p.status === 'active').map((cp) => {
            const isExpanded = expandedPaths.has(cp.id);
            const pendingCount = cp.tasks.filter((t) => t.status === 'pending').length;
            const completedCount = cp.tasks.filter((t) => t.status === 'completed').length;
            const now = new Date().toISOString();
            const overdueCount = cp.tasks.filter((t) => t.status === 'pending' && t.dueDate < now).length;

            return (
              <div key={cp.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleExpand(cp.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getConditionLabel(cp.condition)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {completedCount}/{cp.tasks.length} tasks
                      </span>
                      {overdueCount > 0 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-destructive/10 text-destructive border-destructive/20">
                          {overdueCount} overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 py-2 space-y-1.5 border-t border-border">
                    {cp.tasks.map((task) => {
                      const isOverdue = task.status === 'pending' && task.dueDate < now;
                      return (
                        <div key={task.id} className="flex items-start gap-2 py-1">
                          <button
                            onClick={() => task.status === 'pending' && handleCompleteTask(cp.id, task.id)}
                            disabled={task.status === 'completed'}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            ) : isOverdue ? (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {categoryIcons[task.category] || '📋'} {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Next follow-up: {new Date(cp.followUpSchedule.nextDue).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {paths.length === 0 && unactivated.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active care paths</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Care paths will be suggested based on patient conditions.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CarePathPanel;
