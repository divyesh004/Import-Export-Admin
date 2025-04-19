import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  useMediaQuery,
  TablePagination,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import qaService from '../services/qaService';

const QAModeration = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [pendingAnswers, setPendingAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isSubAdmin = user?.role === 'sub-admin';

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      setError('');

      const questions = await qaService.getPendingQuestions();
      setPendingQuestions(questions);

      const answers = await qaService.getPendingAnswers();
      setPendingAnswers(answers);
    } catch (err) {
      setError('Failed to load pending items. Please try again.');
      console.error('Error fetching pending items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleViewItem = (item) => {
    console.log('Selected item for viewing:', item); // Add logging to debug
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedItem(null);
  };



  const handleUpdateQuestionStatus = async (questionId, status) => {
    try {
      setLoading(true);
      await qaService.updateQuestionStatus(questionId, status);
      setSuccess(`Question ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setPendingQuestions(pendingQuestions.filter(q => q.id !== questionId));
    } catch (err) {
      setError(`Failed to ${status} question. Please try again.`);
      console.error(`Error ${status}ing question:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnswerStatus = async (answerId, status) => {
    try {
      setLoading(true);
      await qaService.updateAnswerStatus(answerId, status);
      setSuccess(`Answer ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setPendingAnswers(pendingAnswers.filter(a => a.id !== answerId));
    } catch (err) {
      setError(`Failed to ${status} answer. Please try again.`);
      console.error(`Error ${status}ing answer:`, err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, length = 50) => {
    if (!text) return '';
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  return (
    <Box sx={{  
      p: { xs: 2, sm: 3 }, 
      mt: { xs: 6, sm: 8 },
      flexGrow: 1, 
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        maxWidth: '1800px', 
        mx: 'auto',
        p: isMobile ? 1 : 3,
        borderRadius: 4,
        bgcolor: 'background.paper',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
            mb: isMobile ? 2 : 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <QuestionAnswerIcon fontSize={isMobile ? "medium" : "large"} />
          QA Moderation Dashboard
          {isSubAdmin && user?.industry && (
            <Chip 
              label={`${user.industry} Industry`} 
              color="secondary" 
              size={isMobile ? "small" : "medium"}
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: isMobile ? 1 : 3,
              borderRadius: 2,
              boxShadow: theme.shadows[1]
            }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: isMobile ? 1 : 3,
              borderRadius: 2,
              boxShadow: theme.shadows[1]
            }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        <Paper 
          sx={{ 
            mb: isMobile ? 2 : 4, 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                py: isMobile ? 1 : 2,
                px: isMobile ? 1 : 2,
                fontSize: isMobile ? '0.8rem' : '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 'auto',
                minWidth: 'unset'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingIcon fontSize={isMobile ? "small" : "medium"} />
                  <span>Questions</span>
                  <Chip 
                    label={pendingQuestions.length} 
                    size="small" 
                    color="primary"
                    sx={{ 
                      ml: 1,
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HourglassEmptyIcon fontSize={isMobile ? "small" : "medium"} />
                  <span>Answers</span>
                  <Chip 
                    label={pendingAnswers.length} 
                    size="small" 
                    color="secondary"
                    sx={{ 
                      ml: 1,
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              } 
            />
          </Tabs>
        </Paper>

        {loading ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            py={8}
            sx={{
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.default, 0.6),
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
            }}
          >
            <CircularProgress size={isMobile ? 40 : 60} thickness={4} color="primary" />
          </Box>
        ) : (
          <>
            {/* Pending Questions Tab */}
            {activeTab === 0 && (
              <Box>
                {pendingQuestions.length === 0 ? (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: isMobile ? 3 : 6, 
                      textAlign: 'center',
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.default, 0.6)
                    }}
                  >
                    <HourglassEmptyIcon 
                      sx={{ 
                        fontSize: isMobile ? 40 : 60,
                        color: theme.palette.text.disabled,
                        mb: 2 
                      }} 
                    />
                    <Typography variant={isMobile ? "body1" : "h6"} color="textSecondary">
                      No pending questions to moderate
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      All caught up! New questions will appear here when submitted.
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, mb: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Asked By</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Industry</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pendingQuestions
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((question) => (
                              <TableRow key={question.id} hover>
                                <TableCell>
                                  <Typography fontWeight={500}>
                                    {truncateText(question.question, isMobile ? 30 : 50)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar 
                                      sx={{ 
                                        width: 24, 
                                        height: 24,
                                        bgcolor: theme.palette.secondary.main,
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      {question.users?.name?.charAt(0) || <PersonIcon fontSize="small" />}
                                    </Avatar>
                                    <Typography>
                                      {question.users?.name || 'Anonymous'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{formatDate(question.created_at || question.date)}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={question.industry || 'General'}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={<PendingIcon fontSize="small" />}
                                    label="Pending"
                                    color="warning"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Box display="flex" gap={1} justifyContent="flex-end">
                                    <Tooltip title="View Details">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewItem(question)}
                                        sx={{
                                          color: theme.palette.text.secondary,
                                          '&:hover': {
                                            color: theme.palette.primary.main,
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                          }
                                        }}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Approve">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleUpdateQuestionStatus(question.id, 'approved')}
                                        sx={{
                                          color: theme.palette.success.main,
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.success.main, 0.1)
                                          }
                                        }}
                                      >
                                        <CheckCircleIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Reject">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleUpdateQuestionStatus(question.id, 'rejected')}
                                        sx={{
                                          color: theme.palette.error.main,
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.error.main, 0.1)
                                          }
                                        }}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={pendingQuestions.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      sx={{
                        '& .MuiTablePagination-toolbar': {
                          paddingLeft: 0
                        }
                      }}
                    />
                  </>
                )}
              </Box>
            )}

            {/* Pending Answers Tab */}
            {activeTab === 1 && (
              <Box>
                {pendingAnswers.length === 0 ? (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: isMobile ? 3 : 6, 
                      textAlign: 'center',
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.default, 0.6)
                    }}
                  >
                    <HourglassEmptyIcon 
                      sx={{ 
                        fontSize: isMobile ? 40 : 60,
                        color: theme.palette.text.disabled,
                        mb: 2 
                      }} 
                    />
                    <Typography variant={isMobile ? "body1" : "h6"} color="textSecondary">
                      No pending answers to moderate
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      All answers have been reviewed. New answers will appear here when submitted.
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, mb: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                            <TableCell sx={{ fontWeight: 600 }}>Answer</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Answered By</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pendingAnswers
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((answer) => (
                              <TableRow key={answer.id} hover>
                                <TableCell>
                                  <Typography>
                                    {truncateText(answer.answer, isMobile ? 30 : 50)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography fontWeight={500}>
                                    {truncateText(answer.question?.question || 'Question not available', isMobile ? 30 : 50)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar 
                                      sx={{ 
                                        width: 24, 
                                        height: 24,
                                        bgcolor: theme.palette.info.main,
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      {answer.users?.name?.charAt(0) || <PersonIcon fontSize="small" />}
                                    </Avatar>
                                    <Typography>
                                      {answer.users?.name || 'Anonymous'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{formatDate(answer.created_at)}</TableCell>
                                <TableCell>
                                  <Chip
                                    icon={<PendingIcon fontSize="small" />}
                                    label="Pending"
                                    color="warning"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Box display="flex" gap={1} justifyContent="flex-end">
                                    <Tooltip title="View Details">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewItem(answer)}
                                        sx={{
                                          color: theme.palette.text.secondary,
                                          '&:hover': {
                                            color: theme.palette.secondary.main,
                                            backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                                          }
                                        }}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Approve">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleUpdateAnswerStatus(answer.id, 'approved')}
                                        sx={{
                                          color: theme.palette.success.main,
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.success.main, 0.1)
                                          }
                                        }}
                                      >
                                        <CheckCircleIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Reject">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleUpdateAnswerStatus(answer.id, 'rejected')}
                                        sx={{
                                          color: theme.palette.error.main,
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.error.main, 0.1)
                                          }
                                        }}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={pendingAnswers.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      sx={{
                        '& .MuiTablePagination-toolbar': {
                          paddingLeft: 0
                        }
                      }}
                    />
                  </>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ 
          sx: { 
            borderRadius: isMobile ? 0 : 3,
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`
              : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`
          } 
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: isMobile ? 2 : 3
          }}
        >
          {selectedItem?.question ? (
            <>
              <QuestionAnswerIcon fontSize={isMobile ? "medium" : "large"} />
              <span>Question Details</span>
            </>
          ) : (
            <>
              <CheckCircleIcon fontSize={isMobile ? "medium" : "large"} />
              <span>Answer Details</span>
            </>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 4 }}>
          {selectedItem && (
            <>
              {/* Question Details */}
              {selectedItem.question && !selectedItem.answer && (
                <>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                    Question Content:
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: isMobile ? 1.5 : 3, 
                      mb: isMobile ? 2 : 4, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderLeft: `4px solid ${theme.palette.primary.main}`
                    }}
                  >
                    <Typography>{selectedItem.question}</Typography>
                  </Paper>
                  <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Asked By:
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          sx={{ 
                            width: isMobile ? 32 : 40, 
                            height: isMobile ? 32 : 40,
                            bgcolor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText
                          }}
                        >
                          {selectedItem.users?.name?.charAt(0) || <PersonIcon />}
                        </Avatar>
                        <Typography fontWeight={500}>
                          {selectedItem.users?.name || 'Anonymous'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Date Submitted:
                      </Typography>
                      <Typography fontWeight={500}>
                        {formatDate(selectedItem.created_at || selectedItem.date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Industry:
                      </Typography>
                      <Chip
                        label={selectedItem.industry || 'General'}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Status:
                      </Typography>
                      <Chip
                        icon={<PendingIcon fontSize="small" />}
                        label="Pending"
                        color="warning"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Answer Details */}
              {selectedItem.answer && (
                <>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                    Original Question:
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: isMobile ? 1.5 : 3, 
                      mb: isMobile ? 2 : 4, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderLeft: `4px solid ${theme.palette.secondary.main}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>{selectedItem.question?.question || selectedItem.question || 'Question not available'}</Typography>
                    {selectedItem.question?.users && (
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24,
                            bgcolor: theme.palette.primary.main,
                            fontSize: '0.8rem'
                          }}
                        >
                          {selectedItem.question.users?.name?.charAt(0) || <PersonIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="caption" color="textSecondary">
                          {selectedItem.question.users?.name || 'Anonymous'} • {formatDate(selectedItem.question.created_at || selectedItem.question.date)}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                  
                  <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                    Submitted Answer:
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: isMobile ? 1.5 : 3, 
                      mb: isMobile ? 2 : 4, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderLeft: `4px solid ${theme.palette.info.main}`
                    }}
                  >
                    <Typography>{selectedItem.answer}</Typography>
                  </Paper>
                  
                  <Grid container spacing={isMobile ? 1 : 3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Answered By:
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          sx={{ 
                            width: isMobile ? 32 : 40, 
                            height: isMobile ? 32 : 40,
                            bgcolor: theme.palette.info.main,
                            color: theme.palette.info.contrastText
                          }}
                        >
                          {selectedItem.users?.name?.charAt(0) || <PersonIcon />}
                        </Avatar>
                        <Typography fontWeight={500}>
                          {selectedItem.users?.name || 'Anonymous'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Date Submitted:
                      </Typography>
                      <Typography fontWeight={500}>
                        {formatDate(selectedItem.created_at || selectedItem.date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Status:
                      </Typography>
                      <Chip
                        icon={<PendingIcon fontSize="small" />}
                        label="Pending"
                        color="warning"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3, justifyContent: 'space-between' }}>
          <Box>
            {selectedItem && !selectedItem.answer && (
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    handleUpdateQuestionStatus(selectedItem.id, 'approved');
                    handleCloseViewDialog();
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500,
                    boxShadow: 2
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    handleUpdateQuestionStatus(selectedItem.id, 'rejected');
                    handleCloseViewDialog();
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500,
                    boxShadow: 2
                  }}
                >
                  Reject
                </Button>
              </Box>
            )}
            {selectedItem && selectedItem.answer && (
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    handleUpdateAnswerStatus(selectedItem.id, 'approved');
                    handleCloseViewDialog();
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500,
                    boxShadow: 2
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    handleUpdateAnswerStatus(selectedItem.id, 'rejected');
                    handleCloseViewDialog();
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500,
                    boxShadow: 2
                  }}
                >
                  Reject
                </Button>
              </Box>
            )}
          </Box>
          <Button 
            onClick={handleCloseViewDialog} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 500,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2
              },
              width: isMobile ? 'auto' : 'auto'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default QAModeration;