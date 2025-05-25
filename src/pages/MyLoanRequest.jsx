import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  Table,
  Button,
  Typography,
  Tag,
  Tooltip,
  Input,
  Space,
  Dropdown,
  Menu,
  Skeleton,
  Grid,
  ConfigProvider,
  Card
} from 'antd';
import { Link } from 'react-router-dom';
import {
  PlusOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import supabase from '../services/supabaseClient';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const themeConfig = {
  token: {
    colorPrimary: '#ffb300',
    colorBorder: '#d9d9d9',
    colorText: '#1a1a1a',
    colorTextSecondary: '#595959',
    borderRadius: 6,
    fontSize: 14,
    wireframe: false
  },
  components: {
    Table: {
      headerBg: '#1a1a1a',
      headerColor: '#ffb300',
      headerSplitColor: '#333333',
      borderColor: '#d9d9d9',
      headerBorderRadius: 0,
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
      rowHoverBg: '#fafafa',
      cellFontSize: 13,
    },
    Button: {
      colorPrimary: '#1a1a1a',
      colorPrimaryHover: '#000000',
      colorPrimaryActive: '#000000',
      primaryColor: '#ffb300',
      fontWeight: 500,
      controlHeight: 36,
    },
    Input: {
      colorBorder: '#d9d9d9',
      hoverBorderColor: '#ffb300',
      activeBorderColor: '#ffb300',
    },
    Card: {
      colorBorder: '#d9d9d9',
      borderRadius: 8,
      boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
    }
  }
};

const statusConfig = {
  approved: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    text: 'Approved'
  },
  pending: {
    color: 'orange',
    icon: <ClockCircleOutlined />,
    text: 'Pending'
  },
  rejected: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    text: 'Rejected'
  },
  default: {
    color: 'blue',
    icon: <ClockCircleOutlined />,
    text: 'Processing'
  }
};

const MyLoanRequest = () => {
  const { user } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const screens = useBreakpoint();

  const fetchLoans = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan-form-request')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLoans(data || []);
      setFilteredLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredLoans(loans);
      return;
    }
    const filtered = loans.filter((loan) => {
      return (
        loan.loan_amount?.toString().includes(term) ||
        loan.status?.toLowerCase().includes(term) ||
        loan.loan_purpose?.toLowerCase().includes(term) ||
        loan.id?.toString().includes(term)
      );
    });
    setFilteredLoans(filtered);
  }, [searchTerm, loans]);

  const handleRefresh = () => {
    fetchLoans();
  };

  const getActionMenu = (record) => (
    <Menu
      items={[
        {
          key: 'view',
          icon: <FileTextOutlined />,
          label: <Link to={`/loan-detail/${record.id}`}>View Details</Link>,
        },
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: 'Refresh Status',
          onClick: handleRefresh,
        },
      ]}
    />
  );

  const columns = [
    {
      title: 'LOAN ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>#{id}</Text>,
      responsive: ['md'],
    },
    {
      title: 'AMOUNT',
      dataIndex: 'loan_amount',
      key: 'amount',
      sorter: (a, b) => (a.loan_amount || 0) - (b.loan_amount || 0),
      render: (amount) => (
        <Text strong style={{ color: '#1a1a1a' }}>
          {amount ? `PKR ${amount.toLocaleString()}` : '-'}
        </Text>
      ),
    },
    {
      title: 'PURPOSE',
      dataIndex: 'loan_purpose',
      key: 'purpose',
      render: (purpose) => (
        <Tooltip title={purpose}>
          <Text ellipsis style={{ maxWidth: '150px' }}>
            {purpose || '-'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'DURATION',
      dataIndex: 'repayment_period',
      key: 'duration',
      sorter: (a, b) => (a.repayment_period || 0) - (b.repayment_period || 0),
      render: (duration) => `${duration ? `${duration} months` : '-'}`,
      responsive: ['lg'],
    },
    {
      title: 'APPLIED ON',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => (
        <Text>
          {date ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(screens.md ? { hour: '2-digit', minute: '2-digit' } : {})
          }) : '-'}
        </Text>
      ),
      responsive: ['md'],
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value, record) => record.status?.toLowerCase() === value,
      render: (status) => {
        if (!status) status = 'pending';
        const statusLower = status.toLowerCase();
        const config = statusConfig[statusLower] || statusConfig.default;

        return (
          <Tag
            color={config.color}
            icon={config.icon}
            style={{
              borderRadius: '4px',
              padding: '0 8px',
              fontWeight: 500,
              margin: 0,
              fontSize: '12px'
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Dropdown
          overlay={getActionMenu(record)}
          placement="bottomRight"
          trigger={['click']}
          arrow={{ pointAtCenter: true }}
        >
          <Button
            shape="circle"
            size="small"
            icon={<MoreOutlined style={{ fontSize: '16px' }} />}
            type="text"
            style={{ color: '#595959' }}
            onClick={e => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <ConfigProvider theme={themeConfig}>
      <div style={{
        padding: screens.xs ? '16px' : '24px',
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: screens.xs ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: screens.xs ? 'flex-start' : 'center',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <Title level={3} style={{ fontWeight: 600, backgroundColor: 'black', color: '#ffb300', padding: '8px', borderRadius: '8px', display: 'inline-block' }}>
            My Event Request</Title>

          <Space wrap style={{ width: screens.xs ? '100%' : 'auto' }}>
            <Link to="/new-loan" style={{ width: screens.xs ? '100%' : 'auto' }}>
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                block={screens.xs}
                style={{
                  backgroundColor: '#000000',
                  color: '#ffb300',
                  borderRadius: '8px',
                  padding: '0 20px',
                  height: '40px',
                  fontWeight: 500,
                  border: '1px solid #333333'
                }}
              >
                New Application
              </Button>
            </Link>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              style={{
                border: '1px solid #333333'
              }}
            >
              Refresh
            </Button>
          </Space>
        </div>

        <Input
          placeholder="Search by ID, amount, purpose or status..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          suffix={
            searchTerm && (
              <Button
                type="text"
                size="small"
                onClick={() => setSearchTerm('')}
                style={{ color: '#8c8c8c' }}
              >
                Clear
              </Button>
            )
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '8px',
            border: '1px solid #333333',
            marginBottom: '24px'
          }}
        />

        <Card
          bordered={false}
          style={{
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            padding: 0
          }}
          bodyStyle={{ padding: 0 }}
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredLoans}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} applications`,
                pageSizeOptions: ['10', '25', '50'],
                size: 'small'
              }}
              scroll={{ x: true }}
              size="middle"
              bordered
              locale={{
                emptyText: (
                  <div style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    color: '#595959'
                  }}>
                    <FileTextOutlined style={{
                      fontSize: '48px',
                      color: '#d9d9d9',
                      marginBottom: '16px'
                    }} />
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                        No loan applications found
                      </Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        You haven't applied for any loans yet
                      </Text>
                    </div>
                    <Link to="/new-loan">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{
                          minWidth: '180px',
                          backgroundColor: '#000000',
                          color: '#ffb300',
                          border: '1px solid #333333'
                        }}
                      >
                        Apply for a loan
                      </Button>
                    </Link>
                  </div>
                )
              }}
            />
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default MyLoanRequest;