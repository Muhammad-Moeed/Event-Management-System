import React from 'react';
import { Form, Input, Select, DatePicker, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';

const { Option } = Select;
const normFile = (e) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const FormInput = ({ label, name, rules, type, options }) => {
  if (type === 'file') {
    return (
      <Form.Item
        label={label}
        name={name}
        rules={rules}
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
      </Form.Item>
    );
  }

  return (
    <Form.Item label={label} name={name} rules={rules}>
      {type === 'select' ? (
        <Select placeholder={`Select ${label}`}>
          {options.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      ) : type === 'date' ? (
        <DatePicker style={{ width: '100%' }} />
      ) : (
        <Input placeholder={`Enter ${label}`} />
      )}
    </Form.Item>
  );
};

export default FormInput;
