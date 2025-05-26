import React, { useEffect, useState, useContext } from 'react';
import {
  Card,
  Col,
  Row,
  Typography,
  List,
  Avatar,
  Statistic,
  Button,
  Spin,
  Space,
  Progress,
  Badge,
  Tag,
  Divider,
  Tooltip,
  Select,
  Popover,
  ConfigProvider
} from 'antd';
import {
  CheckCircleOutlined,
  HourglassOutlined,
  SolutionOutlined,
  PlusCircleOutlined,
  ArrowUpOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SyncOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  SmileOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import supabase from '../services/supabaseClient';
import Chart from 'react-apexcharts';
import '../App.css';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

const professionalTheme = {
  token: {
    colorPrimary: '#ffb300',
    colorBorder: '#d9d9d9',
    colorText: '#1a1a1a',
    colorTextSecondary: '#595959',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Card: {
      headerBg: '#000000',
      headerColor: '#ffb300',
      colorBgContainer: '#ffffff',
      colorBorder: '#e8e8e8',
      borderRadius: 12,
    },
    Button: {
      colorPrimary: '#000000',
      colorPrimaryHover: '#1a1a1a',
      primaryColor: '#ffb300',
      fontWeight: 500,
    },
    Table: {
      headerBg: '#1a1a1a',
      headerColor: '#ffb300',
      borderColor: '#e8e8e8',
    }
  }
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalEvents: 0,
    upcomingEvents: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#52c41a';
      case 'pending': return '#faad14';
      case 'rejected': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const fullName = `${data.first_name} ${data.last_name}`.trim();
        setUserName(fullName);
        setUserAvatar(data.avatar_url);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (!user?.id) return;

        // Fetch events data
        const { data: userEvents, error: eventsError } = await supabase
          .from('event-form-request')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (eventsError) throw eventsError;

        // Calculate basic stats
        const approvedEvents = userEvents.filter(event => event.status === 'approved');
        const pendingEvents = userEvents.filter(event => event.status === 'pending');
        const rejectedEvents = userEvents.filter(event => event.status === 'rejected');

        // Calculate upcoming events
        const today = new Date();
        const upcomingEvents = approvedEvents.filter((event) => {
          const eventDate = event.date_time ? new Date(event.date_time) : null;
          return eventDate && eventDate > today;
        });

        // Set stats
        setStats({
          active: upcomingEvents.length,
          approved: approvedEvents.length,
          pending: pendingEvents.length,
          rejected: rejectedEvents.length,
          totalEvents: userEvents.length,
          upcomingEvents: upcomingEvents.length
        });

        // recent activities
        setRecentActivities(
          userEvents.slice(0, 5).map((event) => ({
            id: event.id,
            title: event.title,
            action: `Event ${event.status}`,
            time: dayjs(event.created_at).fromNow(),
            status: event.status,
            date: event.date_time,
            location: event.location
          }))
        );

        // performance metrics
        setPerformanceMetrics([
          {
            key: 'approvalRate',
            title: 'Approval Rate',
            value: approvedEvents.length > 0 ? 
              Math.round((approvedEvents.length / (approvedEvents.length + pendingEvents.length + rejectedEvents.length)) * 100) : 0,
            icon: <CheckCircleOutlined />,
            color: '#52c41a',
            description: 'Percentage of approved events'
          },
          {
            key: 'upcomingEvents',
            title: 'Upcoming Events',
            value: upcomingEvents.length,
            icon: <CalendarOutlined />,
            color: '#1890ff',
            description: 'Events happening soon'
          },
          {
            key: 'rejectionRate',
            title: 'Rejection Rate',
            value: rejectedEvents.length > 0 ? 
              Math.round((rejectedEvents.length / (approvedEvents.length + pendingEvents.length + rejectedEvents.length)) * 100) : 0,
            icon: <PercentageOutlined />,
            color: '#f5222d',
            description: 'Percentage of rejected events'
          }
        ]);

        // chart data (group by month)
        const monthlyData = userEvents.reduce((acc, event) => {
          const month = dayjs(event.created_at).format('MMM');
          if (!acc[month]) {
            acc[month] = { approved: 0, pending: 0, rejected: 0 };
          }
          acc[month][event.status]++;
          return acc;
        }, {});

        const months = Object.keys(monthlyData);
        const approvedData = months.map(month => monthlyData[month].approved);
        const pendingData = months.map(month => monthlyData[month].pending);

        setChartData({
          options: {
            chart: {
              type: 'bar',
              toolbar: { show: false }
            },
            colors: ['#52c41a', '#ffb300'],
            xaxis: {
              categories: months
            }
          },
          series: [
            {
              name: 'Approved',
              data: approvedData
            },
            {
              name: 'Pending',
              data: pendingData
            }
          ]
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchDashboardData();
  }, [user?.id, timeRange]);

  return (
    <ConfigProvider theme={professionalTheme}>
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#f5f7fa', 
        minHeight: '100vh'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header Section */}
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{
                backgroundColor: '#000000',
                padding: '12px 20px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <SmileOutlined style={{ color: '#ffb300', fontSize: '24px' }} />
                <Title level={3} style={{ 
                  margin: 0, 
                  color: '#ffb300',
                  fontWeight: 600
                }}>
                  Welcome, {userName || 'User'}
                </Title>
              </div>
            </Col>

            <Col>
              <Space>
                <Select
                  value={timeRange}
                  onChange={setTimeRange}
                  style={{ width: 120 }}
                >
                  <Option value="week">This Week</Option>
                  <Option value="month">This Month</Option>
                  <Option value="year">This Year</Option>
                </Select>
                <Link to="/new-event">
                  <Button 
                    type="primary" 
                    icon={<PlusCircleOutlined />}
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffb300'
                    }}
                  >
                    New Event
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                title="Total Events" 
                extra={<CalendarOutlined style={{ color: '#ffb300', fontSize: '24px' }} />}
                className="custom-card"
              >
                <Statistic
                  value={stats.totalEvents}
                  valueStyle={{ fontSize: '28px', fontWeight: 600 }}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary">All your events</Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card 
                title="Upcoming Events" 
                extra={<SolutionOutlined style={{ color: '#ffb300', fontSize: '24px' }} />}
                className="custom-card"
              >
                <Statistic
                  value={stats.upcomingEvents}
                  valueStyle={{ fontSize: '28px', fontWeight: 600, color: '#1890ff' }}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Progress
                  percent={stats.totalEvents > 0 ? Math.round((stats.upcomingEvents / stats.totalEvents) * 100) : 0}
                  showInfo={false}
                  strokeColor="#1890ff"
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card 
                title="Approved Events" 
                extra={<CheckCircleOutlined style={{ color: '#ffb300', fontSize: '24px' }} />}
                className="custom-card"
              >
                <Statistic
                  value={stats.approved}
                  valueStyle={{ fontSize: '28px', fontWeight: 600, color: '#52c41a' }}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Space>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  <Text>
                    {stats.totalEvents > 0 
                      ? Math.round((stats.approved / stats.totalEvents) * 100) 
                      : 0}%
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card 
                title="Pending Events" 
                extra={<HourglassOutlined style={{ color: '#ffb300', fontSize: '24px' }} />}
                className="custom-card"
              >
                <Statistic
                  value={stats.pending}
                  valueStyle={{ fontSize: '28px', fontWeight: 600, color: '#faad14' }}
                />
                <Divider style={{ margin: '12px 0' }} />
                <SyncOutlined spin style={{ color: '#faad14' }} />
              </Card>
            </Col>
          </Row>

          {/* Charts and Metrics */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <Space>
                    <BarChartOutlined style={{ color: '#ffb300', fontSize: '24px' }} />
                    <Text strong style={{color: 'white'}}>Events Activity</Text>
                  </Space>
                }
                loading={loading}
              >
                {chartData && (
                  <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="bar"
                    height={300}
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#ffb300', fontSize: '24px' }} />
                    <Text strong style={{color: 'white'}}>Event Metrics</Text>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {performanceMetrics.map(metric => (
                    <div key={metric.key} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>
                          {metric.icon} {metric.title}
                        </Text>
                        <Text strong style={{ color: metric.color }}>
                          {metric.value}{metric.unit || ''}
                        </Text>
                      </div>
                      <Progress
                        percent={metric.key === 'upcomingEvents' ? 
                          (stats.totalEvents > 0 ? Math.round((metric.value / stats.totalEvents) * 100) : 0) : 
                          metric.value}
                        showInfo={false}
                        strokeColor={metric.color}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {metric.description}
                      </Text>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#ffb300', fontSize: '24px' }} />
                <Text strong style={{color: 'white'}}>Recent Events</Text>
              </Space>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              loading={loading}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={userAvatar} icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{item.title}</Text>
                        <Badge
                          color={getStatusColor(item.status)}
                          text={item.status}
                        />
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{item.action}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.time} • {item.location}
                        </Text>
                        {item.date && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <CalendarOutlined /> {dayjs(item.date).format('MMM D, YYYY h:mm A')}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Space>
      </div>
    </ConfigProvider>
  );
};

export default Dashboard;