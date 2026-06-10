export const UserRoleEnum = {
  ADMIN: 'admin',
  PROJECT_ADMIN: 'project_admin',
  MEMBER: 'member',
}

export const AvailableUserRole = Object.values(UserRoleEnum)

export const TaskStatusEnum = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
}
export const AvailableTaskStatus = Object.values(TaskStatusEnum)

export const TaskPriorityEnum = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}
export const AvailableTaskPriority = Object.values(TaskPriorityEnum)
