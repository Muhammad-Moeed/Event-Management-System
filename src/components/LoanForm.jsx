import React, { useState, useContext } from 'react';
import { Form, Steps, message, Row, Col, DatePicker, Input, Select, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import supabase from '../services/supabaseClient';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const LoanRequestForm = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const { user, loading, setLoading } = useContext(AuthContext);
  const [fileList, setFileList] = useState([]);

  const steps = [
    {
      title: 'Loan Information',
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loan Title"
              name="title"
              rules={[{ required: true, message: 'Please enter loan title' }]}
            >
              <Input placeholder="e.g., Home Loan Request" />
            </Form.Item>

            <Form.Item
              label="Loan Amount"
              name="amount"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <Input type="number" prefix="$" />
            </Form.Item>

            <Form.Item
              label="Loan Category"
              name="category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select loan type">
                <Option value="personal">Personal Loan</Option>
                <Option value="home">Home Loan</Option>
                <Option value="education">Education Loan</Option>
                <Option value="business">Business Loan</Option>
                <Option value="medical">Medical Loan</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item
  label="Request Date"
  name="date_time"
  rules={[
    { required: true, message: 'Please select date' },
    {
      validator: (_, value) => {
        if (value && dayjs(value).isValid()) {
          return Promise.resolve();
        }
        return Promise.reject('Please select a valid date');
      }
    }
  ]}
>
  <DatePicker 
    style={{ width: '100%' }} 
    disabledDate={(current) => current && current < dayjs().startOf('day')}
  />
</Form.Item>

  
            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: 'Please enter location' }]}
            >
              <Input placeholder="City, Country" />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: 'Additional Details',
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Loan Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={4} placeholder="Explain your loan purpose and requirements..." />
            </Form.Item>

            <Form.Item
              label="Supporting Documents"
              name="image_url"
              rules={[{ required: true, message: 'Please upload documents' }]}
            >
              <Upload
                fileList={fileList}
                beforeUpload={(file) => {
                  setFileList([file]);
                  return false;
                }}
                onRemove={() => setFileList([])}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      )
    }
  ];

  const next = () => {
    form.validateFields()
      .then(() => setCurrent(current + 1))
      .catch(() => message.error('Please complete all required fields'));
  };

  const prev = () => setCurrent(current - 1);

 const handleSubmit = async () => {
  try {
    setLoading(true);
    const values = await form.validateFields();
    
    console.log(values);
    
    // Upload image
    let image_url = '';
    if (fileList.length > 0) {
      const file = fileList[0];
      const filePath = `event-images/${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);
      
      if (error) throw error;
      image_url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-images/${filePath}`;
    }
    const eventData = {
      title: values.title || '',
      description: values.description || '',
      date_time: values.date_time ? values.date_time.format('YYYY-MM-DD HH:mm:ss') : null,
      location: values.location || '',
      category: values.category || '',
      image_url: image_url || null,
      status: 'pending',
      created_by: user.id
    };

    console.log("Data being sent to Supabase:", eventData);

    const { data: insertData, error: insertError } = await supabase
      .from('event-form-request') 
      .insert([eventData]);

    if (insertError) {
      console.error("Supabase insert error details:", insertError);
      throw insertError;
    }

    message.success('Event request submitted successfully!');
    form.resetFields();
    setFileList([]);
    setCurrent(0);
  } catch (error) {
    console.error('Full error object:', error);
    message.error(error.message || 'Failed to submit event request');
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Steps current={current} style={{ marginBottom: 24 }}>
        {steps.map(item => <Step key={item.title} title={item.title} />)}
      </Steps>

      <Form form={form} layout="vertical">
        <div style={{ 
          minHeight: 300, 
          padding: 24, 
          background: '#fafafa', 
          borderRadius: 8,
          marginBottom: 24
        }}>
          {steps[current].content}
        </div>
      </Form>

      <div style={{ textAlign: 'right' }}>
        {current > 0 && (
          <Button style={{ marginRight: 8 }} onClick={prev}>
            Previous
          </Button>
        )}
        {current < steps.length - 1 ? (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        ) : (
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
          >
            Submit Request
          </Button>
        )}
      </div>
    </div>
  );
};

export default LoanRequestForm;