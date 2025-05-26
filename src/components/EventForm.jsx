import React, { useState, useContext } from 'react';
import { Form, message, Row, Col, DatePicker, TimePicker, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import FormInput from './FormInput';
import FormButton from './FormButton';
import supabase from '../services/supabaseClient';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';

const EventForm = () => {
  const [form] = Form.useForm();
  const { loading, setLoading, user } = useContext(AuthContext);
  const [formKey, setFormKey] = useState(0);
  const [imageFile, setImageFile] = useState(null);

  const categories = [
    { value: 'tech', label: 'Technology' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'business', label: 'Business' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' },
  ];

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isLt5MB) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    setImageFile(file);
  };


  const uploadImageToSupabase = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    // console.log('Uploading file to:', filePath);

    try {
      const { data, error } = await supabase
        .storage
        .from('event-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase
        .storage
        .from('event-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload image. Please try again.');
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      if (loading) return;
      setLoading(true);

      const values = await form.validateFields();
      const eventDateTime = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .toISOString();

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile);
        console.log('Image URL:', imageUrl);
      }

      const submissionData = {
        title: values.title,
        description: values.description,
        date_time: eventDateTime,
        location: values.location,
        category: values.category,
        image_url: imageUrl,
        user_id: user.id,
      };

      // console.log('Submitting data:', submissionData);
      const { error } = await supabase
        .from('event-form-request')
        .insert([submissionData]);

      if (error) throw error;

      message.success('Event created successfully!');
      form.resetFields();
      setImageFile(null);
      setFormKey(prev => prev + 1);

    } catch (error) {
      console.error('Submission error:', error);
      message.error(error.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <h2 style={{ marginBottom: 24 }}>Create New Event</h2>

      <Form
        key={formKey}
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <FormInput
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please enter event title' }]}
              type="text"
            />

            <FormInput
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter event description' }]}
              type="textarea"
              rows={4}
            />

            <Form.Item
              label="Event Image"
              name="image"
              rules={[{ required: false }]}
            >
              <Upload
                name="image"
                listType="picture"
                beforeUpload={beforeUpload}
                onChange={handleImageChange}
                maxCount={1}
                accept="image/*"
                showUploadList={{ showRemoveIcon: true }}
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>

          </Col>

          <Col span={12}>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select event date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Time"
              name="time"
              rules={[{ required: true, message: 'Please select event time' }]}
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>

            <FormInput
              label="Location"
              name="location"
              rules={[{ required: true, message: 'Please enter event location' }]}
              type="text"
            />

            <FormInput
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please select event category' }]}
              type="select"
              options={categories}
            />
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <FormButton
            type="primary"
            style={{ background: 'black' }}
            onClick={handleSubmit}
            loading={loading}
          >
            Create Event
          </FormButton>
        </Form.Item>
      </Form>

      <style jsx>{`
        .event-form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .ant-upload.ant-upload-select-picture-card {
          width: 100%;
          margin-right: 0;
        }
      `}</style>
    </div>
  );
};

export default EventForm;