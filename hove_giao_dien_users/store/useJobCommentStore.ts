import { create } from 'zustand';
import { JobComment } from '@/lib/jobCommentApi';

interface JobCommentStore {
  commentsByJob: Record<number, JobComment[]>;
  loading: boolean;
  setComments: (jobId: number, comments: JobComment[]) => void;
  addComment: (jobId: number, comment: JobComment) => void;
  removeComment: (jobId: number, commentId: number) => void;
  getComments: (jobId: number) => JobComment[];
  setLoading: (loading: boolean) => void;
}

export const useJobCommentStore = create<JobCommentStore>((set, get) => ({
  commentsByJob: {},
  loading: false,

  setComments: (jobId: number, comments: JobComment[]) => {
    set((state) => ({
      commentsByJob: {
        ...state.commentsByJob,
        [jobId]: comments,
      },
    }));
  },

  addComment: (jobId: number, comment: JobComment) => {
    set((state) => ({
      commentsByJob: {
        ...state.commentsByJob,
        [jobId]: [comment, ...(state.commentsByJob[jobId] || [])],
      },
    }));
  },

  removeComment: (jobId: number, commentId: number) => {
    set((state) => ({
      commentsByJob: {
        ...state.commentsByJob,
        [jobId]: (state.commentsByJob[jobId] || []).filter(
          (c) => c.id !== commentId
        ),
      },
    }));
  },

  getComments: (jobId: number) => {
    return get().commentsByJob[jobId] || [];
  },

  setLoading: (loading: boolean) => set({ loading }),
}));
