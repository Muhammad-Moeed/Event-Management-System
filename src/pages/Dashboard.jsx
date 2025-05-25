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
  MoneyCollectOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  SmileOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import supabase from '../services/supabaseClient';
import Chart from 'react-apexcharts';
import '../App.css'
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
  // User Data
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
    totalAmount: 0,
    processingTime: 0,
    satisfactionRate: 0,
    rejectionRate: 0,
    defaultRate: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);

  // Helper Functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#52c41a';
      case 'pending': return '#faad14';
      case 'rejected': return '#f5222d';
      case 'defaulted': return '#fa8c16';
      default: return '#d9d9d9';
    }
  };

  const getProcessingTimeColor = (days) => {
    if (days < 1) return '#52c41a';
    if (days < 3) return '#1890ff';
    return '#faad14';
  };

  // Data Fetching
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

        // Fetch loan data
        const { data: userLoans, error: loansError } = await supabase
          .from('loan-form-request')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (loansError) throw loansError;

        // Calculate basic stats
        const approvedLoans = userLoans.filter(loan => loan.status === 'approved');
        const pendingLoans = userLoans.filter(loan => loan.status === 'pending');
        const rejectedLoans = userLoans.filter(loan => loan.status === 'rejected');
        const defaultedLoans = userLoans.filter(loan => loan.status === 'defaulted');

        // Calculate active loans
        const today = new Date();
        const activeLoans = approvedLoans.filter((loan) => {
          const approvedAt = loan.approved_at ? new Date(loan.approved_at) : null;
          const repaymentMonths = parseInt(loan.repayment_period, 10) || 0;
          if (!approvedAt) return false;

          const endDate = new Date(approvedAt);
          endDate.setMonth(endDate.getMonth() + repaymentMonths);
          return endDate > today;
        });

        // Calculate total approved amount
        const totalApprovedAmount = approvedLoans.reduce((sum, loan) => {
          return sum + (parseFloat(loan.loan_amount) || 0);
        }, 0);

        // Calculate average processing time
        let totalProcessingTime = 0;
        let count = 0;

        approvedLoans.forEach(loan => {
          if (loan.created_at && loan.approved_at) {
            const created = new Date(loan.created_at);
            const approved = new Date(loan.approved_at);
            totalProcessingTime += (approved - created) / (1000 * 60 * 60 * 24);
            count++;
          }
        });

        const avgProcessingTime = count > 0 ? (totalProcessingTime / count) : 0;

        // Set stats
        setStats({
          active: activeLoans.length,
          approved: approvedLoans.length,
          pending: pendingLoans.length,
          rejected: rejectedLoans.length,
          totalAmount: totalApprovedAmount,
          processingTime: avgProcessingTime,
          satisfactionRate: 0, // You can add feedback logic here
          rejectionRate: rejectedLoans.length > 0 ? 
            Math.round((rejectedLoans.length / (approvedLoans.length + pendingLoans.length + rejectedLoans.length)) * 100) : 0,
          defaultRate: defaultedLoans.length > 0 ? 
            Math.round((defaultedLoans.length / approvedLoans.length) * 100) : 0
        });

        setRecentActivities(
          userLoans.slice(0, 5).map((loan) => ({
            id: loan.id,
            action: `Loan ${loan.status}`,
            time: dayjs(loan.created_at).fromNow(),
            amount: loan.loan_amount,
            status: loan.status,
            approvedAt: loan.approved_at
          }))
        );

        setPerformanceMetrics([
          {
            key: 'approvalRate',
            title: 'Approval Rate',
            value: approvedLoans.length > 0 ? 
              Math.round((approvedLoans.length / (approvedLoans.length + pendingLoans.length + rejectedLoans.length)) * 100) : 0,
            icon: <CheckCircleOutlined />,
            color: '#52c41a',
            description: 'Percentage of approved applications'
          },
          {
            key: 'processingTime',
            title: 'Processing Time',
            value: avgProcessingTime.toFixed(1),
            unit: 'days',
            icon: <ClockCircleOutlined />,
            color: getProcessingTimeColor(avgProcessingTime),
            description: 'Average approval time'
          },
          {
            key: 'rejectionRate',
            title: 'Rejection Rate',
            value: rejectedLoans.length > 0 ? 
              Math.round((rejectedLoans.length / (approvedLoans.length + pendingLoans.length + rejectedLoans.length)) * 100) : 0,
            icon: <PercentageOutlined />,
            color: '#f5222d',
            description: 'Percentage of rejected applications'
          }
        ]);

        setChartData({
          options: {
            chart: {
              type: 'area',
              toolbar: { show: false }
            },
            colors: ['#52c41a', '#ffb300'],
            xaxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
            }
          },
          series: [
            {
              name: 'Approved',
              data: [30, 40, 45, 50, 49, 60]
            },
            {
              name: 'Pending',
              data: [20, 30, 25, 35, 30, 40]
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
                <Link to="/new-loan">
                  <Button 
                    type="primary" 
                    icon={<PlusCircleOutlined />}
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffb300'
                    }}
                  >
                    New Loan
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                title="Total Approved" 
                extra={<MoneyCollectOutlined style={{ color: '#ffb300', fontSize: '24px' }} />}
                className="custom-card approved-card"
              >
                <Statistic
                  value={stats.totalAmount.toLocaleString()}
                  suffix="PKR"
                  valueStyle={{ fontSize: '28px', fontWeight: 600,}}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary">Updated {dayjs().format('h:mm A')}</Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card 
                title="Active Loans" 
                extra={<SolutionOutlined style={{ color: '#ffb300', fontSize: '24px' }} />}
                 className="custom-card active-card"
              >
                <Statistic
                  value={stats.active}
                  valueStyle={{ fontSize: '28px', fontWeight: 600, color: '#1890ff' }}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Progress
                  percent={stats.approved > 0 ? Math.round((stats.active / stats.approved) * 100) : 0}
                  showInfo={false}
                  strokeColor="#1890ff"
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card 
                title="Approved Loans" 
                extra={<CheckCircleOutlined style={{ color: '#ffb300', fontSize: '24px' }} />}
                 className="custom-card approved-loans-card"
              >
                <Statistic
                  value={stats.approved}
                  valueStyle={{ fontSize: '28px', fontWeight: 600, color: '#52c41a' }}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Space>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  <Text>
                    {stats.approved > 0 
                    ? Math.round((stats.approved / (stats.approved + stats.pending + stats.rejected)) * 100) 
                    : 0}%
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card 
                title="Pending Requests" 
                extra={<HourglassOutlined style={{ color: '#ffb300', fontSize: '24px' }} />}
                 className="custom-card pending-requests-card"
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
                    <BarChartOutlined style={{ color: '#ffb300', fontSize : '24px' }} />
                    <Text strong style={{color:'white'}}>Loan Activity</Text>
                    
                  </Space>
                }
                loading={loading}
              >
                {chartData && (
                  <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="area"
                    height={300}
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#ffb300',fontSize : '24px' }} />
                    <Text strong style={{color : 'white'}}>Performance Metrics</Text>
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
                        percent={metric.value}
                        showInfo={false}
                        strokeColor={metric.color}
                      />
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
                <FileTextOutlined style={{ color: '#ffb300', fontSize:'24px' }} />
                <Text strong style={{color: 'white'}}>Recent Activity</Text>
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
                        <Text strong>You</Text>
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
                          {item.time} • {item.amount ? `${item.amount.toLocaleString()} PKR` : ''}
                        </Text>
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