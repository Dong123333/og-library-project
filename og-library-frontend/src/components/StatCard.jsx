import {Card, Skeleton, Statistic} from "antd";

const StatCard = ({ title, value, icon, color, loading }) => (
    <Card bordered={false} bodyStyle={{ padding: '12px 24px' }} className="shadow-sm hover:shadow-md transition-all h-full cursor-default">
        <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
            <Statistic
                title={<span className="text-gray-500 font-medium">{title}</span>}
                value={value}
                prefix={<span style={{ color: color, marginRight: 8, fontSize: 20 }}>{icon}</span>}
                valueStyle={{ color: '#1f2937', fontWeight: 'bold' }}
            />
        </Skeleton>
    </Card>
);

export default StatCard;