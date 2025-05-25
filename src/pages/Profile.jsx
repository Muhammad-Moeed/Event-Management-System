import React, { useEffect, useState, useContext } from 'react';
import { Typography, Avatar, Input, Button, Space, Upload, message, Spin, Divider, Card, Badge } from 'antd';
import { EditOutlined, UploadOutlined, SaveOutlined, CloseOutlined, CheckOutlined, MailOutlined, IdcardOutlined, VerifiedOutlined } from '@ant-design/icons';
import supabase from '../services/supabaseClient';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, avatar_url')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      console.log('Profile data:', data);
    } else if (error) {
      message.error('Failed to load profile');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleUpdate = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name
      })
      .eq('id', user.id);

    if (!error) {
      message.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } else {
      message.error('Update failed');
    }

    setSaving(false);
  };

  const handleImageUpload = async (file) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      message.error('Failed to upload image');
      console.error('Upload Error:', uploadError);
      return false;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      message.error('Failed to update avatar');
      console.error('Avatar Update Error:', updateError);
    } else {
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      message.success('Profile picture updated');
    }

    return false;
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <header style={{
        backgroundColor: 'white',
        height: '64px',
        padding: '0 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#4f46e5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            marginRight: '12px'
          }}>
            LP
          </div>
          <Text strong style={{ fontSize: '18px', color: '#1e293b' }}>LoanPro</Text>
        </div>
        <Avatar 
          size="default" 
          src={profile.avatar_url} 
          style={{ backgroundColor: 'black' }}
        >
          {profile.first_name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '88px auto 24px',  /* Changed from 24px to 88px at top */
        padding: '0 24px',
        display: 'flex',
        gap: '24px'
      }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <Card style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 0',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <Badge 
                count={<Upload beforeUpload={handleImageUpload} showUploadList={false}>
                  <Button 
                    shape="circle" 
                    icon={<UploadOutlined />} 
                    size="small" 
                    style={{
                      backgroundColor: 'black',
                      color: 'white',
                      border: '2px solid white'
                    }}
                  />
                </Upload>}
                offset={[-10, 100]}
              >
                <Avatar
                  size={100}
                  src={profile.avatar_url || undefined}
                  style={{
                    backgroundColor: '#e0e7ff',
                    color: '#4f46e5',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    marginBottom: '16px'
                  }}
                >
                  {profile.first_name?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </Badge>
              
              <Title level={4} style={{ 
                margin: '8px 0 4px',
                color: '#1e293b',
                fontWeight: 600
              }}>
                {profile.first_name} {profile.last_name}
              </Title>
              
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Premium Member
              </Text>
            </div>
            
            <div style={{ padding: '16px 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '8px 16px',
                marginBottom: '8px'
              }}>
                <MailOutlined style={{ 
                  color: '#64748b', 
                  marginRight: '12px',
                  fontSize: '16px'
                }} />
                <Text style={{ fontSize: '14px' }}>{profile.email}</Text>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '8px 16px'
              }}>
                <IdcardOutlined style={{ 
                  color: '#64748b', 
                  marginRight: '12px',
                  fontSize: '16px'
                }} />
                <Text style={{ fontSize: '14px' }}>LP-{user.id.slice(0, 8)}</Text>
              </div>
            </div>
          </Card>
          
          {/* Verification Status Section */}
          <Card style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <VerifiedOutlined style={{ 
                color: '#ffb300', 
                marginRight: '8px',
                fontSize: '18px'
              }} />
              <Title level={5} style={{ 
                margin: 0,
                color: '#1e293b',
                fontWeight: 600
              }}>Verification Status</Title>
            </div>
            
            <div style={{ 
              backgroundColor: 'black',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <CheckOutlined style={{ 
                  color: '#10b981', 
                  marginRight: '8px'
                }} />
                <Text strong style={{ fontSize: '14px', color : '#ffb300' }}>Identity Verified</Text>
              </div>
              <Text type="secondary" style={{ 
                color: 'white',
                fontSize: '12px',
                paddingLeft: '24px'
              }}>Your identity has been confirmed</Text>
            </div>
            
            <div style={{ 
              backgroundColor: 'black',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <CheckOutlined style={{ 
                  color: '#10b981', 
                  marginRight: '8px'
                }} />
                <Text strong style={{ fontSize: '14px', color: '#ffb300' }}>Email Verified</Text>
              </div>
              <Text type="secondary" style={{ 
                fontSize: '12px',
                paddingLeft: '24px',
                color: 'white'
              }}>{profile.email}</Text>
            </div>
          </Card>
        </div>
        
        <div style={{ flex: 2 }}>
          <Card style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <Title level={4} style={{ 
                margin: 0,
                color: '#1e293b',
                fontWeight: 600
              }}>Personal Information</Title>
              
              {!editing ? (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
              ) : (
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => setEditing(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
              )}
            </div>

            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <Text strong style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>First Name</Text>
                  <Input
                    value={profile.first_name}
                    onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      borderColor: '#e2e8f0'
                    }}
                  />
                </div>
                
                <div>
                  <Text strong style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>Last Name</Text>
                  <Input
                    value={profile.last_name}
                    onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      borderColor: '#e2e8f0'
                    }}
                  />
                </div>
                
                <div>
                  <Text strong style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>Email</Text>
                  <Input
                    value={profile.email}
                    disabled
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0'
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'flex-end',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <Button
                    onClick={() => setEditing(false)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 500,
                      height: '40px',
                      padding: '0 20px',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleUpdate}
                    loading={saving}
                    style={{
                      backgroundColor: 'black',
                      borderRadius: '8px',
                      fontWeight: 500,
                      height: '40px',
                      padding: '0 20px',
                      fontSize: '14px'
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '24px'
              }}>
                <div>
                  <Text strong style={{ 
                    display: 'block', 
                    color: '#64748b',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>First Name</Text>
                  <Text style={{ fontSize: '16px', color: '#1e293b' }}>{profile.first_name}</Text>
                </div>
                
                <div>
                  <Text strong style={{ 
                    display: 'block', 
                    color: '#64748b',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>Last Name</Text>
                  <Text style={{ fontSize: '16px', color: '#1e293b' }}>{profile.last_name}</Text>
                </div>
                
                <div>
                  <Text strong style={{ 
                    display: 'block', 
                    color: '#64748b',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>Email</Text>
                  <Text style={{ fontSize: '16px', color: '#1e293b' }}>{profile.email}</Text>
                </div>
  
              </div>
            )}
          </Card>
          
          {/* Account Security Section */}
          <Card style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <Title level={4} style={{ 
              marginBottom: '16px',
              color: '#1e293b',
              fontWeight: 600
            }}>Account Security</Title>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div>
                  <Text strong style={{ 
                    display: 'block', 
                    color: '#1e293b',
                    fontSize: '14px',
                    marginBottom: '4px'
                  }}>Password</Text>
                  <Text type="secondary" style={{ fontSize: '13px' }}>Last changed 3 months ago</Text>
                </div>
                <Button 
                  type="text" 
                  style={{ 
                    color: 'black',
                    fontWeight: 500
                  }}
                >
                  Change
                </Button>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div>
                  <Text strong style={{ 
                    display: 'block', 
                    color: '#1e293b',
                    fontSize: '14px',
                    marginBottom: '4px'
                  }}>Two-Factor Authentication</Text>
                  <Text type="secondary" style={{ fontSize: '13px' }}>Add an extra layer of security</Text>
                </div>
                <Button 
                  type="text" 
                  style={{ 
                    color: 'black',
                    fontWeight: 500
                  }}
                >
                  Enable
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;