import { Card, Tag, Button, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { skillsApi } from '@/lib/profileApi';

interface SkillsSectionProps {
  isEditing: boolean;
}

export const SkillsSection = ({ isEditing }: SkillsSectionProps) => {
  const { user } = useAuthStore();
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSkills();
    }
  }, [user?.id]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await skillsApi.getSkills(user!.id);
      setSkills(data);
    } catch (error) {
      console.error('Load skills error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      message.warning('Vui lòng nhập tên kỹ năng!');
      return;
    }

    try {
      await skillsApi.createSkill({
        userId: user!.id,
        skillName: newSkill.trim(),
        level: 'intermediate',
      });
      setNewSkill('');
      await loadSkills();
      message.success('Đã thêm kỹ năng!');
    } catch (error) {
      message.error('Thêm kỹ năng thất bại!');
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await skillsApi.deleteSkill(id);
      await loadSkills();
      message.success('Đã xóa kỹ năng!');
    } catch (error) {
      message.error('Xóa kỹ năng thất bại!');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {isEditing && (
        <Card>
          <div className="flex gap-2">
            <Input
              size="large"
              placeholder="Nhập tên kỹ năng (VD: React, Node.js, Python...)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onPressEnter={handleAddSkill}
            />
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddSkill}>
              Thêm
            </Button>
          </div>
        </Card>
      )}

      {skills.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-gray-500">Chưa có kỹ năng nào</div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Tag
                key={skill.id}
                color="blue"
                className="text-base py-1 px-3"
                closable={isEditing}
                onClose={() => handleDeleteSkill(skill.id)}
              >
                {skill.skillName}
              </Tag>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
