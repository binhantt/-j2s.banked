import { useState, useEffect } from 'react';
import { Card, Input, Button, Avatar, Spin, message, Popconfirm, Tooltip } from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { jobCommentApi, JobComment } from '@/lib/jobCommentApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';

const { TextArea } = Input;

interface JobCommentsProps {
  jobId: number;
}

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
};

// Organize comments into tree structure
const organizeComments = (comments: JobComment[]): JobComment[] => {
  const commentMap = new Map<number, JobComment>();
  const rootComments: JobComment[] = [];

  // First pass: create map and initialize replies array
  comments.forEach((comment) => {
    commentMap.set(comment.id!, { ...comment, replies: [] });
  });

  // Second pass: organize into tree
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id!);
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies!.push(commentWithReplies!);
      }
    } else {
      rootComments.push(commentWithReplies!);
    }
  });

  return rootComments;
};

interface CommentItemProps {
  comment: JobComment;
  onReply: (commentId: number, userName: string) => void;
  onDelete: (commentId: number) => void;
  currentUserId?: number;
  level?: number;
}

const CommentItem = ({ comment, onReply, onDelete, currentUserId, level = 0 }: CommentItemProps) => {
  const isOwner = currentUserId === comment.userId;
  const commentDate = comment.createdAt ? new Date(comment.createdAt) : null;
  const timeAgo = commentDate ? getTimeAgo(commentDate) : 'Vừa xong';

  return (
    <div style={{ marginLeft: level > 0 ? 40 : 0 }}>
      <div
        style={{
          padding: '16px 0',
          borderBottom: level === 0 ? '1px solid #f0f0f0' : 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar src={comment.userAvatar} icon={<UserOutlined />} size={40} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                marginBottom: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 600, marginRight: 8 }}>
                  {comment.userName}
                </span>
                <span style={{ color: '#999', fontSize: 13 }}>{timeAgo}</span>
              </div>
              {isOwner && (
                <Popconfirm
                  title="Xóa bình luận"
                  description="Bạn có chắc muốn xóa bình luận này?"
                  onConfirm={() => onDelete(comment.id!)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Tooltip title="Xóa bình luận">
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
            <p style={{ margin: '0 0 8px 0', color: '#666' }}>{comment.content}</p>
            <Button
              type="link"
              size="small"
              style={{ padding: 0, height: 'auto' }}
              onClick={() => onReply(comment.id!, comment.userName)}
            >
              Trả lời
            </Button>
          </div>
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const JobComments = ({ jobId }: JobCommentsProps) => {
  const [comments, setComments] = useState<JobComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; userName: string } | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadComments();
  }, [jobId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await jobCommentApi.getCommentsByJob(jobId);
      setComments(data);
    } catch (error) {
      console.error('Load comments error:', error);
      message.error('Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để bình luận');
      router.push('/login');
      return;
    }

    if (!commentText.trim()) {
      message.warning('Vui lòng nhập nội dung bình luận');
      return;
    }

    setPosting(true);
    try {
      const newComment = await jobCommentApi.createComment({
        jobPostingId: jobId,
        userId: user?.id || 0,
        userName: user?.name || 'Anonymous',
        userAvatar: user?.avatar,
        content: commentText.trim(),
        parentId: replyTo?.id,
      });

      // Reload comments to get updated tree
      await loadComments();
      setCommentText('');
      setReplyTo(null);
      message.success(replyTo ? 'Đã trả lời bình luận' : 'Đã đăng bình luận');
    } catch (error) {
      console.error('Post comment error:', error);
      message.error('Không thể đăng bình luận');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = (commentId: number, userName: string) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để trả lời');
      router.push('/login');
      return;
    }
    setReplyTo({ id: commentId, userName });
    setCommentText(`@${userName} `);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setCommentText('');
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await jobCommentApi.deleteComment(commentId);
      await loadComments();
      message.success('Đã xóa bình luận');
    } catch (error) {
      console.error('Delete comment error:', error);
      message.error('Không thể xóa bình luận');
    }
  };

  const organizedComments = organizeComments(comments);
  const totalComments = comments.length;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageOutlined />
          <span>Bình luận ({totalComments})</span>
        </div>
      }
      style={{ borderRadius: 12 }}
    >
      {/* Comment Input */}
      <div style={{ marginBottom: 24 }}>
        {replyTo && (
          <div
            style={{
              marginBottom: 8,
              padding: '8px 12px',
              background: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: '#666' }}>
              Đang trả lời <strong>{replyTo.userName}</strong>
            </span>
            <Button type="text" size="small" onClick={handleCancelReply}>
              Hủy
            </Button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar icon={<UserOutlined />} size={40} src={user?.avatar} />
          <div style={{ flex: 1 }}>
            <TextArea
              rows={3}
              placeholder={
                replyTo
                  ? `Trả lời ${replyTo.userName}...`
                  : 'Chia sẻ suy nghĩ của bạn về công việc này...'
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ marginBottom: 8 }}
              disabled={!isAuthenticated}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handlePostComment}
              loading={posting}
              disabled={!commentText.trim() || !isAuthenticated}
            >
              {replyTo ? 'Trả lời' : 'Đăng bình luận'}
            </Button>
            {!isAuthenticated && (
              <span style={{ marginLeft: 12, color: '#999', fontSize: 13 }}>
                Vui lòng đăng nhập để bình luận
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <Spin spinning={loading}>
        {organizedComments.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <MessageOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <div>
            {organizedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onDelete={handleDeleteComment}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </Spin>
    </Card>
  );
};
