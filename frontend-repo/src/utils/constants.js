export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'Todo',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.DONE]: 'Done',
};

export const TASK_STATUS_LIST = [
  TASK_STATUS.TODO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.DONE,
];

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const TASK_PRIORITY_LIST = [
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.LOW,
];

export const COLUMN_CONFIG = {
  [TASK_STATUS.TODO]: {
    label: 'Todo',
    dotColor: '#64748b',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    dotColor: '#f59e0b',
  },
  [TASK_STATUS.DONE]: {
    label: 'Done',
    dotColor: '#10b981',
  },
};

export const DEBOUNCE_DELAY = 300;
export const PAGE_SIZE = 10;

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'taskboard_token',
  REFRESH_TOKEN: 'taskboard_refresh_token',
  USER: 'taskboard_user',
};
