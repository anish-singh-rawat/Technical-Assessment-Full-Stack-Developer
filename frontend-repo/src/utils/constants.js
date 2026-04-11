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

export const COLUMN_CONFIG = {
  [TASK_STATUS.TODO]: {
    label: 'Todo',
    color: 'gray',
    headerClass: 'border-gray-600',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-700/60 text-gray-300',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'amber',
    headerClass: 'border-amber-500',
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300',
  },
  [TASK_STATUS.DONE]: {
    label: 'Done',
    color: 'emerald',
    headerClass: 'border-emerald-500',
    dotClass: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300',
  },
};

export const DEBOUNCE_DELAY = 300;

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'taskboard_token',
  REFRESH_TOKEN: 'taskboard_refresh_token',
  USER: 'taskboard_user',
};
