// Permission system based on user types

export type UserType = 'job_seeker' | 'freelancer' | 'hr';

export interface Permission {
  canPostJob: boolean;
  canApplyJob: boolean;
  canCreateCV: boolean;
  canPostFreelanceProject: boolean;
  canApplyFreelance: boolean;
}

// Define permissions for each user type
export const PERMISSIONS: Record<UserType, Permission> = {
  hr: {
    canPostJob: true,
    canApplyJob: false,
    canCreateCV: false,
    canPostFreelanceProject: false,
    canApplyFreelance: false,
  },
  freelancer: {
    canPostJob: false,
    canApplyJob: true,
    canCreateCV: true,
    canPostFreelanceProject: false,
    canApplyFreelance: true,
  },
  job_seeker: {
    canPostJob: false,
    canApplyJob: true,
    canCreateCV: true,
    canPostFreelanceProject: false,
    canApplyFreelance: true,
  },
};

// Helper functions to check permissions
export const canPostJob = (userType: UserType): boolean => {
  return PERMISSIONS[userType].canPostJob;
};

export const canApplyJob = (userType: UserType): boolean => {
  return PERMISSIONS[userType].canApplyJob;
};

export const canCreateCV = (userType: UserType): boolean => {
  return PERMISSIONS[userType].canCreateCV;
};

export const canPostFreelanceProject = (userType: UserType): boolean => {
  return PERMISSIONS[userType].canPostFreelanceProject;
};

export const canApplyFreelance = (userType: UserType): boolean => {
  return PERMISSIONS[userType].canApplyFreelance;
};

export const getUserPermissions = (userType: UserType): Permission => {
  return PERMISSIONS[userType];
};
