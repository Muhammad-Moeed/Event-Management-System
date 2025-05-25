import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../services/supabaseClient';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Grid,
  Card,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Refresh,
  Search,
  Person,
  VerifiedUser,
  AdminPanelSettings,
  PersonAdd,
  Block,

} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { color } from 'framer-motion';

const themeColors = {
  primary: '#000000',
  secondary: '#ffb300',
  paper: '#1E1E1E',
  text: '#FFFFFF',
  border: '#333333'
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#fafafa',
  },
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
}));

const statusConfig = {
  active: { color: 'success', icon: <CheckCircle /> },
  inactive: { color: 'error', icon: <Block /> },
};

const roleConfig = {
  admin: { color: 'error', icon: <AdminPanelSettings /> },
  user: { color: 'primary', icon: <Person /> },
  premium: { color: 'warning', icon: <VerifiedUser /> }
};

export default function UserManagementDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const stats = {
    total: users.length,
    active: users.filter(user => user.status === 'active').length,
    inactive: users.filter(user => user.status === 'inactive').length,
    premium: users.filter(user => user.role === 'premium').length,
    admins: users.filter(user => user.role === 'admin').length
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Status filter
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);

      // Role filter
      if (roleFilter !== 'all') query = query.eq('role', roleFilter);

      // Multi-word search filter
      if (searchTerm) {
        const words = searchTerm.trim().split(/\s+/);
        let orFilters = [];

        words.forEach(word => {
          orFilters.push(`first_name.ilike.%${word}%`);
          orFilters.push(`last_name.ilike.%${word}%`);
          orFilters.push(`email.ilike.%${word}%`);
        });

        query = query.or(orFilters.join(','));
      }

      const { data, error } = await query;

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };


  const updateUserStatus = async (id, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id)
        .select();

      if (error) throw error;
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
      showSnackbar(`Status of user updated to "${newStatus}"`, 'success');
    } catch (err) {
      console.error('Error updating user:', err.message);
      showSnackbar(`Update failed: ${err.message}`, 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };


  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter, searchTerm]);

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{
      p: 3,
      backgroundColor: themeColors.background,
      minHeight: '100vh',
      color: themeColors.text
    }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', backgroundColor: 'black', padding: 2, borderRadius: 2 }}>
          <span style={{ color: themeColors.secondary }}>Users</span> Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: themeColors.secondary,
              color: themeColors.primary,
              '&:hover': {
                backgroundColor: '#FFC000',
              },
              fontWeight: 'bold'
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
            onClick={fetchUsers}
          >
            Refresh
          </Button>
            
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            p: 2,
            borderLeft: `4px solid ${themeColors.secondary}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{
                bgcolor: 'rgba(255, 215, 0, 0.1)',
                mr: 2,
                color: themeColors.secondary
              }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Total Users</Typography>
                <Typography variant="h5" fontWeight="bold" color={themeColors}>
                  {stats.total}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            p: 2,
            borderLeft: '4px solid #F44336',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                mr: 2,
                color: '#F44336'
              }}>
                <AdminPanelSettings />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Admin Users</Typography>
                <Typography variant="h5" fontWeight="bold" color={themeColors}>
                  {stats.admins}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Paper sx={{
        p: 2,
        mb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <TextField
          variant="outlined"
          placeholder="Search users by Emails..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: themeColors.secondary }} />
              </InputAdornment>
            ),
            sx: {
              color: themeColors,
              '& .MuiOutlinedInput-notchedOutline': {
              }
            }
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel sx={{ color: themeColors }}>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
            sx={{
              color: themeColors,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: themeColors.border
              },
              '& .MuiSvgIcon-root': {
                color: themeColors.text
              }
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel sx={{ color: themeColors }}>Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role"
            sx={{
              color: themeColors,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: themeColors.border
              },
              '& .MuiSvgIcon-root': {
                color: themeColors.text
              }
            }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="premium">Premium</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Main Content */}
      {loading && !users.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: themeColors.secondary }} />
        </Box>
      ) : error ? (
        <Paper sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: themeColors.paper,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <Typography color="error" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography sx={{ mb: 2 }}>{error}</Typography>
          <Button
            variant="outlined"
            onClick={fetchUsers}
            sx={{
              color: 'black',
              borderColor: themeColors.secondary,
              '&:hover': {
                borderColor: themeColors.secondary
              }
            }}
          >
            Retry
          </Button>
        </Paper>
      ) : users.length === 0 ? (
        <Paper sx={{
          p: 3,
          textAlign: 'center',
        }}>
          <Typography variant="h6" color={themeColors.text}>
            No users found
          </Typography>
          <Typography color="textSecondary">
            {statusFilter !== 'all' || roleFilter !== 'all'
              ? `No users match the current filters`
              : 'No users have been registered yet'}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              mb: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: themeColors.primary }}>
                <TableRow>
                  <TableCell sx={{ color: themeColors.secondary, fontWeight: 'bold' }}>USER</TableCell>
                  <TableCell sx={{ color: themeColors.secondary, fontWeight: 'bold' }}>EMAIL</TableCell>
                  <TableCell sx={{ color: themeColors.secondary, fontWeight: 'bold' }}>ROLE</TableCell>
                  <TableCell sx={{ color: themeColors.secondary, fontWeight: 'bold' }}>STATUS</TableCell>
                  <TableCell sx={{ color: themeColors.secondary, fontWeight: 'bold' }}>JOINED</TableCell>
                  <TableCell sx={{ color: themeColors.secondary, fontWeight: 'bold' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <StyledTableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.avatar_url}
                          sx={{
                            bgcolor: 'rgba(255, 215, 0, 0.1)',
                            color: themeColors.secondary
                          }}
                        >
                          {user.full_name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="bold" color={'black'}>
                            {`${user.first_name} ${user.last_name}` || 'Unknown User'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography color={'black'}>{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        icon={roleConfig[user.role]?.icon}
                        size="small"
                        sx={{
                          bgcolor: `rgba(var(--mui-palette-${roleConfig[user.role]?.color || 'default'}-main), 0.1)`,
                          color: `${roleConfig[user.role]?.color || 'default'}.main`,
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        icon={statusConfig[user.status]?.icon}
                        size="small"
                        sx={{
                          bgcolor: `rgba(var(--mui-palette-${statusConfig[user.status]?.color || 'default'}-main), 0.1)`,
                          color: `${statusConfig[user.status]?.color || 'default'}.main`,
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(user.created_at).format('DD MMM, YYYY')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {user.status !== 'inactive' ? (
                          <Tooltip title="Deactivate">
                            <IconButton
                              sx={{ color: '#F44336' }}
                              onClick={() => updateUserStatus(user.id, 'inactive')}
                            >
                              <Block />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activate">
                            <IconButton
                              sx={{ color: '#4CAF50' }}
                              onClick={() => updateUserStatus(user.id, 'active')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}

                      </Box>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredUsers.length / rowsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: themeColors.text
                },
                '& .MuiPaginationItem-page.Mui-selected': {
                  backgroundColor: themeColors.secondary,
                  color: themeColors.primary,
                  fontWeight: 'bold'
                }
              }}
            />
          </Box>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            backgroundColor: themeColors.paper,
            color: themeColors.text,
            border: `1px solid ${themeColors.secondary}`
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}