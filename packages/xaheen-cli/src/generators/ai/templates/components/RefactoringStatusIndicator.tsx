import React, { useState, useCallback, useEffect } from 'react';

interface RefactoringTask {
  readonly id: string;
  readonly name: string;
  readonly status: 'queued' | 'analyzing' | 'processing' | 'completed' | 'failed' | 'cancelled';
  readonly progress: number;
  readonly filesProcessed: number;
  readonly totalFiles: number;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly error?: string;
}

interface RefactoringStatusIndicatorProps {
  readonly tasks: readonly RefactoringTask[];
  readonly onTaskClick?: (taskId: string) => void;
  readonly onCancelTask?: (taskId: string) => void;
  readonly onRetryTask?: (taskId: string) => void;
  readonly onClearCompleted?: () => void;
  readonly compact?: boolean;
  readonly showNotifications?: boolean;
  readonly isDarkMode?: boolean;
}

export const RefactoringStatusIndicator = ({
  tasks,
  onTaskClick,
  onCancelTask,
  onRetryTask,
  onClearCompleted,
  compact = false,
  showNotifications = true,
  isDarkMode = false
}: RefactoringStatusIndicatorProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  const activeTasks = tasks.filter(task => 
    task.status === 'queued' || task.status === 'analyzing' || task.status === 'processing'
  );

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const failedTasks = tasks.filter(task => task.status === 'failed');

  const overallProgress = useCallback(() => {
    if (tasks.length === 0) return 0;
    
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  }, [tasks]);

  const getStatusIcon = useCallback((status: RefactoringTask['status']): string => {
    switch (status) {
      case 'queued':
        return '⏳';
      case 'analyzing':
        return '🔍';
      case 'processing':
        return '⚡';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '⛔';
      default:
        return '○';
    }
  }, []);

  const getStatusColor = useCallback((status: RefactoringTask['status']): string => {
    switch (status) {
      case 'queued':
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
      case 'analyzing':
      case 'processing':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'completed':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'failed':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'cancelled':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      default:
        return isDarkMode ? 'text-gray-500' : 'text-gray-400';
    }
  }, [isDarkMode]);

  const formatDuration = useCallback((startTime?: Date, endTime?: Date): string => {
    if (!startTime) return '-';
    
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }, []);

  const handleDismissNotification = useCallback((taskId: string) => {
    setDismissedNotifications(prev => new Set(prev).add(taskId));
  }, []);

  useEffect(() => {
    // Auto-expand when new active tasks appear
    if (activeTasks.length > 0 && compact) {
      setIsExpanded(true);
    }
  }, [activeTasks.length, compact]);

  try {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${compact && !isExpanded ? 'w-auto' : 'w-96'}`}>
        {/* Notifications */}
        {showNotifications && (
          <div className="space-y-2 mb-4">
            {failedTasks.filter(task => !dismissedNotifications.has(task.id)).map(task => (
              <div
                key={`notification-${task.id}`}
                className={`p-4 rounded-lg shadow-lg animate-slide-in-right ${
                  isDarkMode ? 'bg-red-900/90 text-white' : 'bg-red-100 text-red-800'
                }`}
                role="alert"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium">Refactoring Failed</p>
                    <p className="text-sm mt-1 opacity-90">{task.name}</p>
                    {task.error && (
                      <p className="text-xs mt-2 opacity-75">{task.error}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDismissNotification(task.id)}
                    className="text-2xl leading-none opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Status Indicator */}
        <div className={`rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
              isDarkMode ? 'bg-gray-900 hover:bg-gray-850' : 'bg-gray-50 hover:bg-gray-100'
            }`}
            aria-expanded={isExpanded}
            aria-label="Toggle refactoring status panel"
          >
            <div className="flex items-center gap-3">
              <div className={`relative ${activeTasks.length > 0 ? 'animate-pulse' : ''}`}>
                <span className="text-2xl">🔄</span>
                {activeTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-ping" />
                )}
              </div>
              <div className="text-left">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Refactoring
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activeTasks.length > 0 
                    ? `${activeTasks.length} active task${activeTasks.length !== 1 ? 's' : ''}`
                    : 'No active tasks'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-20 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${overallProgress()}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {overallProgress()}%
                  </span>
                </div>
              )}
              
              <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
          </button>

          {/* Task List */}
          {isExpanded && (
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="text-4xl opacity-50">🔍</span>
                    <p className="mt-2">No refactoring tasks</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-4 transition-colors ${
                          onTaskClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750' : ''
                        }`}
                        onClick={() => onTaskClick?.(task.id)}
                        role="button"
                        tabIndex={onTaskClick ? 0 : undefined}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg ${getStatusColor(task.status)}`}>
                                {getStatusIcon(task.status)}
                              </span>
                              <h4 className={`font-medium truncate ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {task.name}
                              </h4>
                            </div>
                            
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                  {task.filesProcessed} / {task.totalFiles} files
                                </span>
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                  {formatDuration(task.startTime, task.endTime)}
                                </span>
                              </div>
                              
                              {(task.status === 'analyzing' || task.status === 'processing') && (
                                <div className={`h-1.5 rounded-full overflow-hidden ${
                                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                  <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              )}
                              
                              {task.error && (
                                <p className={`text-xs mt-2 ${
                                  isDarkMode ? 'text-red-400' : 'text-red-600'
                                }`}>
                                  {task.error}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {task.status === 'failed' && onRetryTask && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRetryTask(task.id);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? 'text-blue-400 hover:bg-blue-900/20'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                                aria-label={`Retry ${task.name}`}
                              >
                                🔄
                              </button>
                            )}
                            
                            {(task.status === 'queued' || task.status === 'analyzing' || task.status === 'processing') && onCancelTask && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCancelTask(task.id);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? 'text-red-400 hover:bg-red-900/20'
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                                aria-label={`Cancel ${task.name}`}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {completedTasks.length > 0 && onClearCompleted && (
                <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={onClearCompleted}
                    className={`w-full h-12 font-medium rounded-lg transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Clear completed tasks"
                  >
                    Clear {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('RefactoringStatusIndicator error:', error);
    return (
      <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-xl ${
        isDarkMode ? 'bg-gray-800 text-red-400' : 'bg-white text-red-600'
      }`}>
        Error rendering status indicator
      </div>
    );
  }
};