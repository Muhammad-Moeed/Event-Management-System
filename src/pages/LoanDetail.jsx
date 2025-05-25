import { useParams } from 'react-router-dom';
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
  Dropdown,
  Menu,
} from 'antd';
import { 
  DownloadOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  UserOutlined,
  PhoneOutlined,
  BankOutlined,
  IdcardOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import supabase from '../services/supabaseClient';
import moment from 'moment';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

const themeConfig = {
  token: {
    colorPrimary: '#ffb300', 
    colorBorder: '#333333',
    colorText: '#000000', 
    colorTextSecondary: '#666666',
    colorLink: '#ffb300',
    colorLinkHover: '#FFC000',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Card: {
      headerBg: '#000000',
      paddingLG: 24,
      colorBgContainer: '#FFFFFF',
      colorBorderSecondary: '#EEEEEE',
    },
    Descriptions: {
      colorText: '#000000',
      colorTextSecondary: '#666666',
      colorFillAlter: '#FFFFFF', 
      colorBorder: '#EEEEEE', 
    },
    Button: {
      defaultHoverBg: '#1A1A1A',
      defaultHoverColor: '#ffb300',
      defaultHoverBorderColor: '#ffb300',
    },
    Table: {
      headerBg: '#000000',
      headerColor: '#FFFFFF',
      colorBgContainer: '#FFFFFF', 
      colorText: '#000000',
      colorBorderSecondary: '#EEEEEE',
    }
  }
};

const statusConfig = {
  approved: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    text: 'APPROVED'
  },
  pending: {
    color: 'warning',
    icon: <ClockCircleOutlined />,
    text: 'PENDING'
  },
  rejected: {
    color: 'error',
    icon: <CloseCircleOutlined />,
    text: 'REJECTED'
  }
};

const DocumentLink = ({ url, label }) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  if (!url) return <Text type="secondary">Not provided</Text>;

  const isImage = url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
  const icon = isImage ? 
    <FileImageOutlined style={{ color: '#ffb300' }} /> : 
    <FilePdfOutlined style={{ color: '#FF5252' }} />;

  return (
    <>
      <Space>
        {icon}
        <a 
          onClick={() => isImage ? setPreviewVisible(true) : window.open(url, '_blank')}
          style={{ color: '#ffb300', cursor: 'pointer' }}
        >
          {label || 'View Document'}
        </a>
        <Button 
          type="text" 
          icon={<DownloadOutlined style={{ color: '#ffb300' }} />} 
          size="small" 
          onClick={() => window.open(url, '_blank')}
        />
      </Space>
      {isImage && (
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width="80%"
          bodyStyle={{ padding: 0, backgroundColor: '#000000' }}
        >
          <Image 
            src={url} 
            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
            preview={false}
          />
        </Modal>
      )}
    </>
  );
};

const LoanDetail = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const componentRef = useRef();

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const { data, error } = await supabase
          .from('loan-form-request')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLoan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [id]);

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = componentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      pdf.save(`loan-application-${id}.pdf`);
      message.success('PDF exported successfully');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      message.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const getStatusTag = () => {
    const status = loan?.status?.toLowerCase() || 'pending';
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

  const exportMenu = (
    <Menu
      items={[
        {
          key: 'pdf',
          label: 'Export as PDF',
          icon: <FilePdfOutlined style={{ color: '#FF5252' }} />,
          onClick: exportToPDF
        },
        {
          key: 'excel',
          label: 'Export as Excel',
          icon: <FileExcelOutlined style={{ color: '#4CAF50' }} />,
          disabled: true
        },
        {
          key: 'word',
          label: 'Export as Word',
          icon: <FileWordOutlined style={{ color: '#2196F3' }} />,
          disabled: true
        }
      ]}
      theme="dark"
    />
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
      }}>
        <Spin 
          tip="Loading Application Details..." 
          size="large" 
          style={{ color: '#ffb300' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: 24, 
        backgroundColor: '#000000',
        minHeight: '100vh'
      }}>
        <Alert 
          message="Error Loading Application" 
          description={error} 
          type="error" 
          showIcon 
          closable
          style={{ 
            borderRadius: 8,
            border: '1px solid #333333'
          }}
          action={
            <Button 
              type="primary" 
              danger 
              onClick={() => window.location.reload()}
              style={{ marginTop: 16 }}
            >
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  if (!loan) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 60,
        backgroundColor: '#000000',
        minHeight: '100vh'
      }}>
        <Title level={3} style={{ color: '#ffb300', marginBottom: 16 }}>
          Application Not Found
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          The requested loan application does not exist or may have been removed.
        </Text>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
          style={{ 
            backgroundColor: '#ffb300',
            color: '#000000',
            fontWeight: 600
          }}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <div 
        style={{ 
          minHeight: '100vh',
          padding: '24px 16px',
          backgroundColor: '#FFFFFF' 
        }}
      >
        <div 
          style={{ 
            maxWidth: 1200, 
            margin: '0 auto',
          }}
          ref={componentRef}
        >
          {/* Header Section */}
          <div className="no-print" style={{ marginBottom: 24 }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => window.history.back()}
              style={{ 
                color: '#000000',
                fontWeight: 500,
                paddingLeft: 0
              }}
            >
              Back to Applications
            </Button>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: '#000000',
              padding: '16px 24px',
              borderRadius: 8,
              border: '1px solid #333333',
              marginTop: 8
            }}>
              <div>
                <Title 
                  level={3} 
                  style={{ 
                    margin: 0, 
                    color: '#ffb300',
                    fontWeight: 600
                  }}
                >
                  Loan Application #{loan.id}
                </Title>
                <Text style={{ fontSize: 14, color:'#FFFFFF' }}>
                  Submitted on {moment(loan.created_at).format('MMMM D, YYYY')}
                </Text>
              </div>
              <Space>
                <Dropdown overlay={exportMenu} placement="bottomRight">
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    loading={exporting}
                    style={{ 
                      backgroundColor: '#ffb300',
                      color: '#000000',
                      fontWeight: 600
                    }}
                  >
                    Export
                  </Button>
                </Dropdown>
              </Space>
            </div>
          </div>

          {/* Application Overview */}
          <Card
            bordered={false}
            style={{
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid #EEEEEE'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Descriptions 
              title={
                <div style={{ 
                  padding: '16px 24px',
                  borderBottom: '1px solid #EEEEEE',
                  backgroundColor: '#000000' 
                }}>
                  <Title 
                    level={5} 
                    style={{ 
                      margin: 0, 
                      color: '#ffb300',
                      fontWeight: 600
                    }}
                  >
                    APPLICATION OVERVIEW
                  </Title>
                </div>
              } 
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
              size="middle"
              labelStyle={{ 
                fontWeight: 500,
                color: '#666666',
                backgroundColor: '#FFFFFF',
                padding: '12px 24px',
                borderBottom: '1px solid #EEEEEE',
                borderRight: '1px solid #EEEEEE'
              }}
              contentStyle={{ 
                fontWeight: 500,
                color: '#000000',
                backgroundColor: '#FFFFFF',
                padding: '12px 24px',
                borderBottom: '1px solid #EEEEEE'
              }}
            >
              <Descriptions.Item label="Applicant Name">
                {loan.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Loan Amount">
                <Text strong style={{ color: '#ffb300' }}>
                  Rs. {loan.loan_amount?.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag()}
              </Descriptions.Item>
              <Descriptions.Item label="Purpose">
                {loan.loan_purpose}
              </Descriptions.Item>
              <Descriptions.Item label="Repayment Period">
                {loan.repayment_period} months
              </Descriptions.Item>
              <Descriptions.Item label="Monthly Income">
                <Text strong style={{ color: '#ffb300' }}>
                  Rs. {loan.income?.toLocaleString()}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Main Content Sections */}
          <Row gutter={[24, 24]}>
            {/* Personal Information */}
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <UserOutlined style={{ color: '#ffb300' }} />
                    <Text strong style={{ color: '#ffb300' }}>
                      PERSONAL INFORMATION
                    </Text>
                  </Space>
                }
                headStyle={{ 
                  borderBottom: '1px solid #EEEEEE',
                  padding: '16px 24px',
                  backgroundColor: '#000000'
                }}
                bodyStyle={{ padding: 0 }}
                style={{ 
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EEEEEE'
                }}
              >
                <Descriptions 
                  column={1}
                  labelStyle={{ 
                    fontWeight: 500,
                    color: '#666666',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE',
                    width: '40%'
                  }}
                  contentStyle={{ 
                    fontWeight: 500,
                    color: '#000000',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE'
                  }}
                >
                  <Descriptions.Item label="Full Name">
                    {loan.full_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Father's Name">
                    {loan.father_name || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="CNIC">
                    {loan.cnic || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">
                    {loan.dob ? moment(loan.dob).format('MMMM D, YYYY') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {loan.gender || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Marital Status">
                    {loan.marital_status || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dependents">
                    {loan.dependents || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Contact Information */}
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <PhoneOutlined style={{ color: '#ffb300' }} />
                    <Text strong style={{ color: '#ffb300' }}>
                      CONTACT INFORMATION
                    </Text>
                  </Space>
                }
                headStyle={{ 
                  borderBottom: '1px solid #EEEEEE',
                  padding: '16px 24px',
                  backgroundColor: '#000000'
                }}
                bodyStyle={{ padding: 0 }}
                style={{ 
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EEEEEE'
                }}
              >
                <Descriptions 
                  column={1}
                  labelStyle={{ 
                    fontWeight: 500,
                    color: '#666666',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE',
                    width: '40%'
                  }}
                  contentStyle={{ 
                    fontWeight: 500,
                    color: '#000000',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE'
                  }}
                >
                  <Descriptions.Item label="Phone">
                    {loan.phone || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {loan.email || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {loan.address || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="City">
                    {loan.city || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Province">
                    {loan.province || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Employment Details */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <BankOutlined style={{ color: '#ffb300' }} />
                    <Text strong style={{ color: '#ffb300' }}>
                      EMPLOYMENT DETAILS
                    </Text>
                  </Space>
                }
                headStyle={{ 
                  borderBottom: '1px solid #EEEEEE',
                  padding: '16px 24px',
                  backgroundColor: '#000000'
                }}
                bodyStyle={{ padding: 0 }}
                style={{ 
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EEEEEE'
                }}
              >
                <Descriptions 
                  column={{ xs: 1, sm: 2 }}
                  labelStyle={{ 
                    fontWeight: 500,
                    color: '#666666',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE',
                    borderRight: '1px solid #EEEEEE',
                    width: '40%'
                  }}
                  contentStyle={{ 
                    fontWeight: 500,
                    color: '#000000',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE'
                  }}
                >
                  <Descriptions.Item label="Employment Status">
                    {loan.employment_status || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Job Title">
                    {loan.job_title || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Employer">
                    {loan.employer || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Monthly Income">
                    <Text strong style={{ color: '#ffb300' }}>
                      Rs. {loan.income?.toLocaleString() || '-'}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Loan Details */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <DollarOutlined style={{ color: '#ffb300' }} />
                    <Text strong style={{ color: '#ffb300' }}>
                      LOAN DETAILS
                    </Text>
                  </Space>
                }
                headStyle={{ 
                  borderBottom: '1px solid #EEEEEE',
                  padding: '16px 24px',
                  backgroundColor: '#000000'
                }}
                bodyStyle={{ padding: 0 }}
                style={{ 
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EEEEEE'
                }}
              >
                <Descriptions 
                  column={{ xs: 1, sm: 2 }}
                  labelStyle={{ 
                    fontWeight: 500,
                    color: '#666666',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE',
                    borderRight: '1px solid #EEEEEE',
                    width: '40%'
                  }}
                  contentStyle={{ 
                    fontWeight: 500,
                    color: '#000000',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE'
                  }}
                >
                  <Descriptions.Item label="Loan Amount">
                    <Text strong style={{ color: '#ffb300' }}>
                      Rs. {loan.loan_amount?.toLocaleString()}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Purpose">
                    {loan.loan_purpose}
                  </Descriptions.Item>
                  <Descriptions.Item label="Repayment Period">
                    {loan.repayment_period} months
                  </Descriptions.Item>
                  <Descriptions.Item label="Application Date">
                    {moment(loan.created_at).format('MMMM D, YYYY [at] h:mm A')}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <IdcardOutlined style={{ color: '#ffb300' }} />
                    <Text strong style={{ color: '#ffb300' }}>
                      SUPPORTING DOCUMENTS
                    </Text>
                  </Space>
                }
                headStyle={{ 
                  borderBottom: '1px solid #EEEEEE',
                  padding: '16px 24px',
                  backgroundColor: '#000000'
                }}
                bodyStyle={{ padding: 0 }}
                style={{ 
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EEEEEE'
                }}
              >
                <Descriptions 
                  column={{ xs: 1, sm: 2 }}
                  labelStyle={{ 
                    fontWeight: 500,
                    color: '#666666',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE',
                    borderRight: '1px solid #EEEEEE',
                    width: '40%'
                  }}
                  contentStyle={{ 
                    fontWeight: 500,
                    color: '#000000',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 24px',
                    borderBottom: '1px solid #EEEEEE'
                  }}
                >
                  <Descriptions.Item label="CNIC Front">
                    <DocumentLink url={loan.cnic_front_url} />
                  </Descriptions.Item>
                  <Descriptions.Item label="CNIC Back">
                    <DocumentLink url={loan.cnic_back_url} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Bank Statement">
                    <DocumentLink url={loan.bank_doc_url} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Additional Documents">
                    {loan.additional_docs_url ? (
                      <DocumentLink url={loan.additional_docs_url} />
                    ) : (
                      <Text type="secondary">None provided</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* Footer */}
          <div className="no-print" style={{ 
            marginTop: 24, 
            padding: 16,
            backgroundColor: '#000000',
            borderRadius: 8,
            border: '1px solid #333333',
            textAlign: 'center'
          }}>
            <Text style={{ color: '#B0B0B0' }}>
              Application submitted by User ID: {loan.user_id} • 
              Created: {moment(loan.created_at).format('MMMM D, YYYY [at] h:mm A')}
            </Text>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoanDetail;