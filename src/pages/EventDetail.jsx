import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  Card,
  Spin,
  Alert,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Descriptions,
  Image,
  Modal,
  message,
  ConfigProvider,
  Table,
  Avatar,
  Divider,
  Badge
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TagOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import supabase from '../services/supabaseClient';
import moment from 'moment';

const { Title, Text } = Typography;

const statusConfig = {
  approved: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    text: 'APPROVED'
  },
  pending: {
    color: 'orange',
    icon: <ClockCircleOutlined />,
    text: 'PENDING'
  },
  rejected: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    text: 'REJECTED'
  }
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [creator, setCreator] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);

        const { data: eventData, error: eventError } = await supabase
          .from('event-form-request')
          .select('*')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;
        if (!eventData) throw new Error('Event not found');

        setEvent(eventData);

        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, avatar_url')
          .eq('id', eventData.user_id)
          .single();

        if (creatorError) console.error('Error fetching creator:', creatorError);
        setCreator(creatorData || null);

        const { data: participantsData, error: participantsError } = await supabase
          .from('event_participants')
          .select('id, full_name, email, phone, created_at')
          .eq('event_id', id)
          .order('created_at', { ascending: false });

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const getStatusTag = () => {
    const status = event?.status?.toLowerCase() || 'pending';
    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Tag
        color={config.color}
        icon={config.icon}
        style={{
          fontWeight: 600,
          fontSize: 12,
          padding: '4px 12px',
          borderRadius: 20,
          textTransform: 'uppercase',
          border: 'none'
        }}
      >
        {config.text}
      </Tag>
    );
  };

  const participantColumns = [
    {
      title: 'Participant',
      dataIndex: 'full_name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar_url} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div><MailOutlined /> {record.email}</div>
          {record.phone && <div><PhoneOutlined /> {record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Registered On',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => moment(date).format('MMM D, YYYY h:mm A'),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Badge status="success" text="Confirmed" />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh'
      }}>
        <Spin size="large" tip="Loading event details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error Loading Event"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              type="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 16px'
      }}>
        <Title level={3} style={{ marginBottom: 16 }}>
          Event Not Found
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          The requested event does not exist or you don't have permission to view it.
        </Text>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Back to Events
        </Button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 24
        }}>
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              {event.title}
            </Title>
            <Space size="middle">
              <Text type="secondary">
                <CalendarOutlined /> {moment(event.date_time).format('MMMM D, YYYY')}
              </Text>
              <Text type="secondary">
                <EnvironmentOutlined /> {event.location}
              </Text>
              {getStatusTag()}
            </Space>
          </div>

          <Button
            type="primary"
            icon={<TeamOutlined />}
            disabled={event.status !== 'approved'}
            onClick={() => navigate(`/events/${id}/participants`)}
          >
            Manage Participants
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Event Details Column */}
        <Col xs={24} md={16}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <Text strong>Event Details</Text>
              </Space>
            }
          >
            <Descriptions column={1}>
              <Descriptions.Item label="Description">
                {event.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Date & Time">
                {moment(event.date_time).format('dddd, MMMM D, YYYY [at] h:mm A')}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {event.location}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag icon={<TagOutlined />} color="blue">
                  {event.category}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {event.image_url && (
              <div style={{ marginTop: 24 }}>
                <Image
                  src={event.image_url}
                  alt="Event banner"
                  style={{ borderRadius: 8 }}
                />
              </div>
            )}
          </Card>
        </Col>

        {/* Organizer & Participants Column */}
        <Col xs={24} md={8}>
          {/* Organizer Card */}
          <Card
            title={
              <Space>
                <UserOutlined />
                <Text strong>Organizer</Text>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            {creator ? (
              <div>
                <Space align="start" style={{ marginBottom: 16 }}>
                  <Avatar
                    src={creator.avatar_url}
                    size={64}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{creator.full_name}</Title>
                    <Text type="secondary">{creator.email}</Text>
                    {creator.phone && (
                      <div style={{ marginTop: 4 }}>
                        <PhoneOutlined /> {creator.phone}
                      </div>
                    )}
                  </div>
                </Space>
                <Button
                  type="dashed"
                  block
                  onClick={() => navigate(`/profile/${creator.id}`)}
                >
                  View Profile
                </Button>
              </div>
            ) : (
              <Text type="secondary">Organizer information not available</Text>
            )}
          </Card>

          {/* Participants Card */}
          <Card
            title={
              <Space>
                <TeamOutlined />
                <Text strong>Participants ({participants.length})</Text>
              </Space>
            }
            extra={
              event.status === 'approved' && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate(`/events/${id}/participants`)}
                >
                  View All
                </Button>
              )
            }
          >
            {participants.length > 0 ? (
              <>
                <Table
                  columns={participantColumns}
                  dataSource={participants.slice(0, 3)}
                  rowKey="id"
                  pagination={false}
                  showHeader={false}
                  size="small"
                />
                {participants.length > 3 && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">
                      + {participants.length - 3} more participants
                    </Text>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <TeamOutlined style={{ fontSize: 32, color: '#d9d9d9', marginBottom: 8 }} />
                <Text type="secondary" style={{ display: 'block' }}>
                  No participants yet
                </Text>
                {event.status === 'approved' && (
                  <Button
                    type="dashed"
                    style={{ marginTop: 16 }}
                    onClick={() => navigate(`/events/${id}/add-participant`)}
                  >
                    Add Participant
                  </Button>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EventDetailPage;