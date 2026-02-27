import { useState, useEffect } from 'react';
import { Card, Rate, Button, Input, List, Avatar, message, Modal, Empty, Spin } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { companyReviewApi, CompanyReview, CompanyStats } from '@/lib/companyReviewApi';
import { useAuthStore } from '@/store/useAuthStore';

const { TextArea } = Input;

interface CompanyReviewSectionProps {
  companyId: number;
}

export const CompanyReviewSection = ({ companyId }: CompanyReviewSectionProps) => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [stats, setStats] = useState<CompanyStats>({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<CompanyReview | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadReviews();
    loadStats();
    if (user) {
      loadUserReview();
    }
  }, [companyId, user]);

  const loadReviews = async () => {
    try {
      const data = await companyReviewApi.getReviewsByCompany(companyId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await companyReviewApi.getCompanyStats(companyId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUserReview = async () => {
    if (!user?.id) return;
    try {
      const data = await companyReviewApi.getUserReview(companyId, user.id);
      setUserReview(data);
      if (data) {
        setRating(data.rating);
        setComment(data.comment || '');
      }
    } catch (error) {
      console.error('Error loading user review:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để đánh giá');
      return;
    }

    if (rating === 0) {
      message.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData: CompanyReview = {
        id: userReview?.id,
        companyId,
        userId: user.id,
        rating,
        comment: comment.trim(),
        userName: user.fullName || user.email,
      };

      await companyReviewApi.createOrUpdateReview(reviewData);
      message.success(userReview ? 'Cập nhật đánh giá thành công' : 'Gửi đánh giá thành công');
      setShowReviewForm(false);
      loadReviews();
      loadStats();
      loadUserReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview?.id) return;

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await companyReviewApi.deleteReview(userReview.id!);
          message.success('Xóa đánh giá thành công');
          setUserReview(null);
          setRating(5);
          setComment('');
          loadReviews();
          loadStats();
        } catch (error) {
          console.error('Error deleting review:', error);
          message.error('Không thể xóa đánh giá');
        }
      },
    });
  };

  const handleEditReview = () => {
    setShowReviewForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <Card className="border border-gray-200 rounded-xl">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <Rate disabled value={stats.averageRating} allowHalf className="text-2xl mb-2" />
          <div className="text-gray-600">
            {stats.reviewCount} đánh giá
          </div>
        </div>
      </Card>

      {/* User Review Section */}
      {user && (
        <Card className="border border-gray-200 rounded-xl">
          {userReview && !showReviewForm ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Đánh giá của bạn</h3>
                  <Rate disabled value={userReview.rating} className="mb-2" />
                  <p className="text-gray-700">{userReview.comment}</p>
                </div>
                <div className="flex gap-2">
                  <Button icon={<EditOutlined />} onClick={handleEditReview}>
                    Sửa
                  </Button>
                  <Button danger icon={<DeleteOutlined />} onClick={handleDeleteReview}>
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          ) : showReviewForm ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {userReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
              </h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Đánh giá của bạn</label>
                <Rate value={rating} onChange={setRating} className="text-2xl" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nhận xét (tùy chọn)</label>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về công ty..."
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </div>
              <div className="flex gap-2">
                <Button type="primary" onClick={handleSubmitReview} loading={submitting}>
                  {userReview ? 'Cập nhật' : 'Gửi đánh giá'}
                </Button>
                <Button onClick={() => setShowReviewForm(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <Button type="primary" onClick={() => setShowReviewForm(true)} block>
              Viết đánh giá
            </Button>
          )}
        </Card>
      )}

      {/* Reviews List */}
      <Card className="border border-gray-200 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Tất cả đánh giá</h3>
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : reviews.length === 0 ? (
          <Empty description="Chưa có đánh giá nào" />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={reviews}
            renderItem={(review) => (
              <List.Item key={review.id}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{review.userName || 'Người dùng'}</span>
                      <Rate disabled value={review.rating} className="text-sm" />
                    </div>
                  }
                  description={
                    <span className="text-gray-500 text-sm">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                  }
                />
                {review.comment && (
                  <div className="mt-2 text-gray-700">{review.comment}</div>
                )}
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};
