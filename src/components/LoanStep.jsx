import React from 'react';
import { Row, Col } from 'antd';

const FormStepLayout = ({ children }) => {
  return (
    <Row gutter={[16, 16]}>
      {children.map((child, idx) => (
        <Col xs={24} sm={12} md={8} key={idx}>
          {child}
        </Col>
      ))}
    </Row>
  );
};

export default FormStepLayout;
