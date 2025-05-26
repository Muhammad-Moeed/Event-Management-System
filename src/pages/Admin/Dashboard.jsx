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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  MoreVert,
  Visibility,
  Refresh,
  Search,
  Event,
  ThumbUp,
  ThumbDown,
  Delete,
  Edit,
  People,
  Person
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';

const themeColors = {
  primary: '#000000',
  secondary: '#ffb300',
  background: '#f5f5f5',
  paper: '#FFFFFF',
  text: '#000000',
  border: '#e0e0e0'
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
  pending: { color: 'warning', icon: <MoreVert sx={{ color: '#ffb300' }} /> },
  approved: { color: 'success', icon: <CheckCircle sx={{ color: '#4CAF50' }} /> },
  rejected: { color: 'error', icon: <Cancel sx={{ color: '#F44336' }} /> }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [participantsDialog, setParticipantsDialog] = useState({
    open: false,
    eventId: null,
    participants: []
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    eventId: null
  });
  const [users, setUsers] = useState({});

  const stats = {
    total: events.length,
    approved: events.filter(event => event.status === 'approved').length,
    rejected: events.filter(event => event.status === 'rejected').length,
    pending: events.filter(event => event.status === 'pending').length
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('event-form-request')
        .select('*, profiles(first_name,last_name, email, avatar_url)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Create users map from the joined data
      const userMap = {};
      data.forEach(event => {
        if (event.profiles) {
          userMap[event.user_id] = event.profiles;
        }
      });
      
      setUsers(userMap);
      setEvents(data || []);
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event-form-request')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select('*, profiles(first_name,last_name, email, avatar_url)');

      if (error) throw error;

      if (data && data.length > 0) {
        setEvents(prev => prev.map(event =>
          event.id === id ? data[0] : event
        ));
        
        // Update users map if needed
        if (data[0].profiles) {
          setUsers(prev => ({
            ...prev,
            [data[0].user_id]: data[0].profiles
          }));
        }
        
        showSnackbar(`Status updated to ${newStatus}`, 'success');
      }
    } catch (err) {
      console.error('Error:', err.message);
      showSnackbar(`Update failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('event-form-request')
        .delete()
        .eq('id', deleteDialog.eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== deleteDialog.eventId));
      showSnackbar('Event deleted successfully', 'success');
    } catch (err) {
      console.error('Error:', err.message);
      showSnackbar(`Delete failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, eventId: null });
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_participants')
        .select('*, profiles!inner(first_name,last_name, email, event_id)')
        .eq('event_id', eventId);

      if (error) throw error;

      setParticipantsDialog({
        open: true,
        eventId,
        participants: data || []
      });
    } catch (err) {
      console.error('Error:', err.message);
      showSnackbar(`Failed to fetch participants: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleViewDetails = (id) => {
    if (!id) {
      showSnackbar('Invalid event ID', 'error');
      return;
    }
    navigate(`/admin/event-detail/${id}`);
  };

  const handleEditEvent = (id) => {
    navigate(`/admin/edit-event/${id}`);
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, searchTerm]);

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.id?.toString().includes(searchTerm)
  );

  const paginatedEvents = filteredEvents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{
      p: 3,
      backgroundColor: themeColors.background,
      minHeight: '100vh',
      color: themeColors.text,
      margin: 0
    }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        padding: 0
      }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', backgroundColor: 'black', padding: 2, borderRadius: 2 }}>
          <span style={{ color: themeColors.secondary }}>Events</span> Management Dashboard
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: themeColors.secondary,
            color: themeColors.primary,
            fontWeight: 'bold',
            px: 2.5,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#FFB300',
              transform: 'scale(1.03)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
          disabled={loading}
          onClick={fetchEvents}
        >
          REFRESH
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            p: 2,
            backgroundColor: themeColors.paper,
            borderLeft: `4px solid ${themeColors.secondary}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{
                bgcolor: '#f5f5f5',
                mr: 2,
                color: themeColors.secondary
              }}>
                <Event />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Total Events</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.total}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            p: 2,
            backgroundColor: themeColors.paper,
            borderLeft: '4px solid #4CAF50',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{
                bgcolor: '#f5f5f5',
                mr: 2,
                color: '#4CAF50'
              }}>
                <ThumbUp />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Approved</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.approved}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            p: 2,
            backgroundColor: themeColors.paper,
            borderLeft: '4px solid #F44336',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{
                bgcolor: '#f5f5f5',
                mr: 2,
                color: '#F44336'
              }}>
                <ThumbDown />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Rejected</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.rejected}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            p: 2,
            backgroundColor: themeColors.paper,
            borderLeft: '4px solid #2196F3',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{
                bgcolor: '#f5f5f5',
                mr: 2,
                color: '#2196F3'
              }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Pending Review</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.pending}</Typography>
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
        gap: 2,
        alignItems: 'center',
        backgroundColor: themeColors.paper,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <TextField
          variant="outlined"
          placeholder="Search events..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: themeColors.secondary }} />
              </InputAdornment>
            ),
            sx: {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: themeColors.border
              }
            }
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
            sx={{
              color: themeColors,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black'
              },
              '& .MuiSvgIcon-root': {
                color: themeColors.text
              }
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Main Content */}
      {loading && !events.length ? (
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
            onClick={fetchEvents}
            sx={{
              color: themeColors.secondary,
              borderColor: themeColors.secondary
            }}
          >
            Retry
          </Button>
        </Paper>
      ) : events.length === 0 ? (
        <Paper sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: themeColors.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6">
            No events found
          </Typography>
          <Typography color="textSecondary">
            {statusFilter !== 'all'
              ? `No ${statusFilter} events available`
              : 'No events have been submitted yet'}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              mb: 2,
              backgroundColor: themeColors.paper,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: themeColors.primary }}>
                <TableRow>
                  <TableCell sx={{ color: themeColors.secondary }}>ID</TableCell>
                  <TableCell sx={{ color: themeColors.secondary }}>Event Title</TableCell>
                  <TableCell sx={{ color: themeColors.secondary }}>Organizer</TableCell>
                  <TableCell sx={{ color: themeColors.secondary }}>Location</TableCell>
                  <TableCell sx={{ color: themeColors.secondary }}>Category</TableCell>
                  <TableCell sx={{ color: themeColors.secondary }}>Status</TableCell>
                  <TableCell sx={{ color: themeColors.secondary }}>Date</TableCell>
                  <TableCell sx={{ color: themeColors.secondary }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEvents.map((event) => (
                  <StyledTableRow key={event.id}>
                    <TableCell>#{event.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {event.description?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {users[event.user_id] ? (
                        <>
                          <Typography fontWeight="medium">
                            {users[event.user_id].full_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {users[event.user_id].email}
                          </Typography>
                        </>
                      ) : (
                        <Typography>Loading user...</Typography>
                      )}
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Chip label={event.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.status}
                        color={statusConfig[event.status]?.color || 'default'}
                        icon={statusConfig[event.status]?.icon}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(event.created_at).format('DD MMM, YYYY')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            sx={{ color: themeColors.primary }}
                            onClick={() => handleViewDetails(event.id)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Event">
                          <IconButton
                            sx={{ color: '#1976D2' }}
                            onClick={() => handleEditEvent(event.id)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>

                        {event.status === 'approved' && (
                          <Tooltip title="View Participants">
                            <IconButton
                              sx={{ color: '#9C27B0' }}
                              onClick={() => fetchParticipants(event.id)}
                            >
                              <Badge badgeContent={event.participants_count || 0} color="secondary">
                                <People />
                              </Badge>
                            </IconButton>
                          </Tooltip>
                        )}

                        {event.status !== 'approved' && (
                          <Tooltip title="Approve">
                            <IconButton
                              sx={{ color: '#4CAF50' }}
                              onClick={() => updateStatus(event.id, 'approved')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}

                        {event.status !== 'rejected' && (
                          <Tooltip title="Reject">
                            <IconButton
                              sx={{ color: '#F44336' }}
                              onClick={() => updateStatus(event.id, 'rejected')}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Delete">
                          <IconButton
                            sx={{ color: '#F44336' }}
                            onClick={() => setDeleteDialog({ open: true, eventId: event.id })}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredEvents.length / rowsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: themeColors.text
                },
                '& .MuiPaginationItem-page.Mui-selected': {
                  backgroundColor: themeColors.secondary,
                  color: themeColors.primary
                }
              }}
            />
          </Box>
        </>
      )}

      {/* Participants Dialog */}
      <Dialog
        open={participantsDialog.open}
        onClose={() => setParticipantsDialog({ open: false, eventId: null, participants: [] })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Participants for Event #{participantsDialog.eventId}
          <Typography variant="subtitle2" color="textSecondary">
            Total: {participantsDialog.participants.length}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {participantsDialog.participants.length > 0 ? (
              participantsDialog.participants.map((participant, index) => (
                <div key={participant.id}>
                  <ListItem>
                    <Avatar 
                      src={participant.profiles?.avatar_url} 
                      sx={{ mr: 2 }}
                    />
                    <ListItemText
                      primary={participant.profiles?.first_name || 'Unknown User'}
                      secondary={participant.profiles?.email}
                    />
                  </ListItem>
                  {index < participantsDialog.participants.length - 1 && <Divider />}
                </div>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                No participants registered for this event yet.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParticipantsDialog({ open: false, eventId: null, participants: [] })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, eventId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this event? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, eventId: null })}>
            Cancel
          </Button>
          <Button 
            onClick={deleteEvent} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}