import { Progress, Steps, Card, Timeline, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';

interface Milestone {
  id: number;
  title: string;
  percentage: number;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
}

interface ProjectProgressTrackerProps {
  progress: number;
  milestones?: Milestone[];
}

export const ProjectProgressTracker = ({ progress, milestones = [] }: ProjectProgressTrackerProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '18px' }}>📊</span>
          <span>Tiến độ dự án</span>
        </div>
      }
      style={{ marginBottom: 24 }}
    >
      {/* Overall Progress */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: 12 
        }}>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Tổng quan</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
            {progress}%
          </span>
        </div>
        <Progress 
          percent={progress} 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          strokeWidth={12}
          status={progress === 100 ? 'success' : 'active'}
        />
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: '2px solid #f0f0f0'
          }}>
            🎯 Các mốc quan trọng
          </div>
          
          <Timeline>
            {milestones.map((milestone) => (
              <Timeline.Item
                key={milestone.id}
                dot={getStatusIcon(milestone.status)}
                color={milestone.status === 'completed' ? 'green' : milestone.status === 'in_progress' ? 'blue' : 'gray'}
              >
                <div style={{ paddingBottom: 16 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    marginBottom: 8
                  }}>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: 600,
                      color: milestone.status === 'completed' ? '#52c41a' : '#262626'
                    }}>
                      {milestone.title}
                    </span>
                    <Tag color={getStatusColor(milestone.status)}>
                      {milestone.status === 'completed' ? 'Hoàn thành' : 
                       milestone.status === 'in_progress' ? 'Đang thực hiện' : 'Chưa bắt đầu'}
                    </Tag>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16,
                    fontSize: '13px',
                    color: '#8c8c8c'
                  }}>
                    <span>📈 {milestone.percentage}% dự án</span>
                    {milestone.dueDate && (
                      <span>📅 {new Date(milestone.dueDate).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </>
      )}

      {/* Progress Stats */}
      <div style={{ 
        marginTop: 24,
        padding: '16px',
        background: progress === 100 ? '#f6ffed' : '#e6f7ff',
        borderRadius: '8px',
        border: `1px solid ${progress === 100 ? '#b7eb8f' : '#91d5ff'}`
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {milestones.filter(m => m.status === 'completed').length}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Hoàn thành</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {milestones.filter(m => m.status === 'in_progress').length}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Đang làm</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d9d9d9' }}>
              {milestones.filter(m => m.status === 'pending').length}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Chưa bắt đầu</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
