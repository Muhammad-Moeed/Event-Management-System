import React, { useState, useContext } from 'react';
import { Form, Steps, message, Row, Col, DatePicker, Input, Select, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import supabase from '../services/supabaseClient';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const EventRequestForm = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const { user, loading, setLoading } = useContext(AuthContext);
  const [fileList, setFileList] = useState([]);

  const steps = [
    {
      title: 'Event Details',
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Event Title"
              name="title"
              rules={[{ required: true, message: 'Please enter event title' }]}
            >
              <Input placeholder="e.g., Annual Conference" />
            </Form.Item>

            <Form.Item
              label="Event Date & Time"
              name="date_time"
              rules={[{ required: true, message: 'Please select date and time' }]}
            >
              <DatePicker 
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }} 
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              label="Event Location"
              name="location"
              rules={[{ required: true, message: 'Please enter location' }]}
            >
              <Input placeholder="Venue, City, Country" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Event Category"
              name="category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select event type">
                <Option value="conference">Conference</Option>
                <Option value="workshop">Workshop</Option>
                <Option value="seminar">Seminar</Option>
                <Option value="social">Social Event</Option>
                <Option value="sports">Sports Event</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Event Image"
              name="image_url"
              rules={[{ required: true, message: 'Please upload event image' }]}
            >
              <Upload
                fileList={fileList}
                beforeUpload={(file) => {
                  setFileList([file]);
                  return false;
                }}
                onRemove={() => setFileList([])}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: 'Event Description',
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Event Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea 
                rows={6} 
                placeholder="Describe your event in detail including purpose, agenda, and any special requirements..." 
              />
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
      console.log(values)
      
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
  
      // Prepare event data
      const eventData = {
        title: values.title ,
        description: values.description,
        date_time: values.date_time, // Ensure proper date formatting
        location: values.location,
        category: values.category,
        image_url: image_url,
        status: 'pending',
        created_by: user.id
      };
  
      console.log('Submitting event data:', eventData); // Debug log
  
      // Insert into events table
      const { error } = await supabase.from('event-form-request').insert([eventData]);
      if (error) throw error;
  
      message.success('Event request submitted successfully!');
      form.resetFields();
      setFileList([]);
      setCurrent(0);
    } catch (error) {
      console.error('Error:', error);
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
            Submit Event Request
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventRequestForm;