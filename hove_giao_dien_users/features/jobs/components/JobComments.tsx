import { Card, Avatar, Input, Button, Space, message, Popconfirm } from 'antd';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { jobCommentApi, JobComment } from '@/lib/jobCommentApi';
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface JobCommentsProps {
  jobId: number;
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
};

export const JobComments = ({ jobId }: JobCommentsProps) => {
  const [comments, setComments] = useState<JobComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadComments();
  }, [jobId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await jobCommentApi.getCommentsByJob(jobId);
      // Organize comments with replies
      const commentMap = new Map<number, JobComment>();
      const rootComments: JobComment[] = [];
      
      data.forEach(comment => {
        commentMap.set(comment.id!, { ...comment, replies: [] });
      });
      
      data.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(commentMap.get(comment.id!)!);
          }
        } else {
          rootComments.push(commentMap.get(comment.id!)!);
        }
      });
      
      setComments(rootComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      message.error('Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      message.warning('Vui lòng nhập bình luận');
      return;
    }

    if (!isAuthenticated || !user) {
      message.warning('Vui lòng đăng nhập để bình luận');
      return;
    }

    setSubmitting(true);
    try {
      await jobCommentApi.createComment({
        jobPostingId: jobId,
        userId: user.id,
        userName: user.name || user.email,
        userAvatar: user.avatarUrl,
        content: newComment,
      });
      setNewComment('');
      message.success('Đã gửi bình luận');
      loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      message.error('Không thể gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyContent.trim()) {
      message.warning('Vui lòng nhập nội dung trả lời');
      return;
    }

    if (!isAuthenticated || !user) {
      message.warning('Vui lòng đăng nhập để trả lời');
      return;
    }

    setSubmitting(true);
    try {
      await jobCommentApi.createComment({
        jobPostingId: jobId,
        userId: user.id,
        userName: user.name || user.email,
        userAvatar: user.avatarUrl,
        content: replyContent,
        parentId,
      });
      setReplyContent('');
      setReplyTo(null);
      message.success('Đã gửi trả lời');
      loadComments();
    } catch (error) {
      console.error('Error submitting reply:', error);
      message.error('Không thể gửi trả lời');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await jobCommentApi.deleteComment(commentId);
      message.success('Đã xóa bình luận');
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      message.error('Không thể xóa bình luận');
    }
  };

  const renderComment = (comment: JobComment, isReply = false) => (
    <div 
      key={comment.id} 
      style={{ 
        marginBottom: isReply ? 12 : 20,
        marginLeft: isReply ? 52 : 0,
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar 
          size={isReply ? 32 : 40}
          src={comment.userAvatar}
          style={{ 
            background: '#fde3cf', 
            color: '#f56a00', 
            flexShrink: 0 
          }}
        >
          {comment.userName?.charAt(0) || 'U'}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4 
          }}>
            <div style={{ fontWeight: 600, fontSize: isReply ? 13 : 14 }}>
              {comment.userName}
            </div>
            <Space size="small">
              {!isReply && (
                <Button
                  type="text"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => setReplyTo(comment.id!)}
                >
                  Trả lời
                </Button>
              )}
              {user?.id === comment.userId && (
                <Popconfirm
                  title="Xóa bình luận?"
                  description="Bạn có chắc muốn xóa bình luận này?"
                  onConfirm={() => handleDelete(comment.id!)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              )}
            </Space>
          </div>
          <div style={{ 
            fontSize: isReply ? 13 : 14, 
            color: '#595959',
            marginBottom: 4,
          }}>
            {comment.content}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {comment.createdAt ? getTimeAgo(comment.createdAt) : 'Vừa xong'}
          </div>
          
          {replyTo === comment.id && (
            <div style={{ marginTop: 12 }}>
              <TextArea
                rows={2}
                placeholder="Viết trả lời của bạn..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <Space>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => handleReply(comment.id!)}
                  loading={submitting}
                >
                  Gửi
                </Button>
                <Button 
                  size="small"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <Card 
      title={<span style={{ fontSize: 16, fontWeight: 600 }}>BÌNH LUẬN ({comments.length})</span>}
      style={{ borderRadius: 8 }}
      styles={{ body: { padding: '20px 24px' } }}
      loading={loading}
    >
      {comments.map((comment) => renderComment(comment))}

      {comments.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#8c8c8c' }}>
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      )}

      <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
        <TextArea
          rows={4}
          placeholder={isAuthenticated ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{ marginBottom: 12, borderRadius: 8 }}
          disabled={!isAuthenticated}
        />
        <Button 
          type="primary" 
          onClick={handleSubmit}
          loading={submitting}
          disabled={!isAuthenticated}
        >
          Gửi bình luận
        </Button>
      </div>
    </Card>
  );
};
