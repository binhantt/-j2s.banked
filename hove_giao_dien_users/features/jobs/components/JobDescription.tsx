import { Card } from 'antd';

interface JobDescriptionProps {
  title: string;
  content: string;
}

export const JobDescription = ({ title, content }: JobDescriptionProps) => {
  return (
    <Card 
      title={<span style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>}
      style={{ marginBottom: 24, borderRadius: 8 }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ 
        whiteSpace: 'pre-line', 
        color: '#595959',
        lineHeight: 1.8,
        fontSize: 14
      }}>
        {content || '2'}
      </div>
    </Card>
  );
};
