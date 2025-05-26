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
  Card,
  Modal,
  Form,
  message
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
  MoreOutlined,
  UserAddOutlined
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

const MyEventRequest = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event-form-request')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredEvents(events);
      return;
    }
    const filtered = events.filter((event) => {
      return (
        event.title?.toLowerCase().includes(term) ||
        event.status?.toLowerCase().includes(term) ||
        event.category?.toLowerCase().includes(term) ||
        event.id?.toString().includes(term)
      );
    });
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleRefresh = () => {
    fetchEvents();
  };

  const showAddUserModal = (event) => {
    setSelectedEvent(event);
    setIsAddUserModalVisible(true);
  };

  const handleAddUser = async () => {
    try {
      const values = await form.validateFields();
    
      const { error } = await supabase
        .from('event_participants')
        .insert([{
          event_id: selectedEvent.id,
          full_name: values.fullName,
          email: values.email,
          phone: values.phone,
          invited_by: user.id
        }]);

      if (error) throw error;

      message.success('User added to event successfully!');
      setIsAddUserModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Failed to add user to event');
    }
  };

  const columns = [
    {
      title: 'EVENT ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>#{id}</Text>,
      responsive: ['md'],
    },
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
      render: (title) => (
        <Text strong style={{ color: '#1a1a1a' }}>
          {title || '-'}
        </Text>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue" style={{ textTransform: 'capitalize' }}>
          {category || '-'}
        </Tag>
      ),
    },
    {
      title: 'DATE & TIME',
      dataIndex: 'date_time',
      key: 'date_time',
      render: (date) => (
        <Text>
          {date ? new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
      title: 'ACTIONS',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => showAddUserModal(record)}
            disabled={record.status !== 'approved'}
            style={{
              backgroundColor: record.status === 'approved' ? '#1a1a1a' : '#f5f5f5',
              color: record.status === 'approved' ? '#ffb300' : '#d9d9d9',
              borderColor: record.status === 'approved' ? '#1a1a1a' : '#d9d9d9'
            }}
          >
            Add User
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="view" icon={<FileTextOutlined />}>
                  <Link to={`/event-detail/${record.id}`}>View Details</Link>
                </Menu.Item>
                <Menu.Item key="refresh" icon={<ReloadOutlined />} onClick={handleRefresh}>
                  Refresh Status
                </Menu.Item>
              </Menu>
            }
            placement="bottomRight"
            trigger={['click']}
          >
            <Button shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
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
            My Event Requests</Title>

          <Space wrap style={{ width: screens.xs ? '100%' : 'auto' }}>
            <Link to="/new-event" style={{ width: screens.xs ? '100%' : 'auto' }}>
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
                Create New Event
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
          placeholder="Search by ID, title, category or status..."
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
              dataSource={filteredEvents}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} events`,
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
                        No events found
                      </Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        You haven't created any events yet
                      </Text>
                    </div>
                    <Link to="/new-event">
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
                        Create New Event
                      </Button>
                    </Link>
                  </div>
                )
              }}
            />
          )}
        </Card>

        {/* User Modal */}
        <Modal
          title={`Add User to ${selectedEvent?.title}`}
          visible={isAddUserModalVisible}
          onOk={handleAddUser}
          onCancel={() => {
            setIsAddUserModalVisible(false);
            form.resetFields();
          }}
          okText="Add User"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input placeholder="Enter user's full name" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Enter user's email" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input placeholder="Enter user's phone number" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default MyEventRequest;