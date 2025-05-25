import React from 'react';
import { Button } from 'antd';

const FormButton = ({
  children,
  onClick,
  type = 'primary',
  htmlType = 'button',
  loading = false,
  disabled = false,
  style = {},
}) => {
  const disabledStyle = disabled
    ? {
        backgroundColor: '#d9d9d9',
        color: '#aaa',
        cursor: 'not-allowed',
        borderColor: '#d9d9d9',
      }
    : {};

  return (
    <Button
      type={type}
      onClick={onClick}
      htmlType={htmlType}
      loading={loading}
      disabled={disabled}
      style={{
        padding: '0 30px',
        height: '40px',
        ...style,
        ...disabledStyle,
      }}
    >
      {children}
    </Button>
  );
};

export default FormButton;
