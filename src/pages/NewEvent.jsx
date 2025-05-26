import React from 'react'
import EventForm from '../components/EventForm'
import { Typography } from 'antd'

const { Title } = Typography;

const MyEvent = () => {
  return (
    <div style={{ paddingLeft: 20, }}>
      <Title level={3} style={{ fontWeight: 600, backgroundColor:'black', color : '#ffb300', padding: '8px', borderRadius: '8px', display : 'inline-block' }}>
       New Event Application</Title>
      <EventForm />
    </div>
  )
}

export default MyEvent