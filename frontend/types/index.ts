export type UserRole = 'admin' | 'project_admin' | 'member';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  username?: string;
  fullname?: string;
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  members?: IUser[];
  memberCount?: number;
  taskCount: number;
  completedTasks: number;
}

export interface IMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

export interface IAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  sizeLabel: string;
}

export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: IUser;
  subTasks: ISubtask[];
  tags: string[];
  attachments: IAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface INote {
  id: string;
  title: string;
  body: string;
  author: IUser;
  createdAt: string;
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}

export interface IListResponse<T> {
  data: T[];
}

export interface IApiError {
  message: string;
}
