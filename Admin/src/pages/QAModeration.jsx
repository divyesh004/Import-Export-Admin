import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import qaService from '../services/qaService';

const QAModeration = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [activeTab, setActiveTab] = useState(0);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [pendingAnswers, setPendingAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [answerText, setAnswerText] = useState('');

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedItem(null);
  };

  const handleOpenAnswerDialog = (question) => {
    setSelectedItem(question);
    setAnswerDialogOpen(true);
  };

  const handleCloseAnswerDialog = () => {
    setAnswerDialogOpen(false);
    setSelectedItem(null);
    setAnswerText('');
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !selectedItem) return;

    try {
      setLoading(true);
      await qaService.createAnswer(selectedItem.id, answerText);
      setSuccess('Answer submitted successfully!');
      handleCloseAnswerDialog();
      fetchPendingItems();
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      console.error('Error submitting answer:', err);
    } finally {
      setLoading(false);
    }
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

  return (
    <Box sx={{  p: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 },
      flexGrow: 1, 
      p: isMobile ? 1 : 3,
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
              <Grid container spacing={isMobile ? 1 : 3}>
                {pendingQuestions.length === 0 ? (
                  <Grid item xs={12}>
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
                  </Grid>
                ) : (
                  pendingQuestions.map((question) => (
                    <Grid item xs={12} sm={6} md={isTablet ? 6 : 4} key={question.id}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          borderRadius: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[4],
                            borderColor: alpha(theme.palette.primary.main, 0.2)
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant={isMobile ? "subtitle1" : "h6"} 
                            gutterBottom 
                            noWrap={!isMobile}
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
                            }}
                          >
                            {question.question}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2} mb={2} flexWrap="wrap">
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                sx={{ 
                                  width: isMobile ? 24 : 28, 
                                  height: isMobile ? 24 : 28, 
                                  mr: 1,
                                  bgcolor: theme.palette.secondary.main,
                                  color: theme.palette.secondary.contrastText
                                }}
                              >
                                {question.users?.name?.charAt(0) || <PersonIcon fontSize="small" />}
                              </Avatar>
                              <Typography variant="body2" color="textSecondary">
                                {question.users?.name || 'Anonymous'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {formatDate(question.created_at || question.date)}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<PendingIcon fontSize="small" />}
                            label="Pending"
                            color="warning"
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontWeight: 500,
                              borderStyle: 'dashed'
                            }}
                          />
                        </CardContent>
                        <Divider sx={{ opacity: 0.5 }} />
                        <CardActions sx={{ 
                          justifyContent: 'space-between', 
                          p: isMobile ? 1 : 2,
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: isMobile ? 1 : 0
                        }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewItem(question)}
                            sx={{
                              color: theme.palette.text.secondary,
                              '&:hover': {
                                color: theme.palette.primary.main
                              },
                              minWidth: isMobile ? '100%' : 'auto'
                            }}
                          >
                            View Details
                          </Button>
                          <Box sx={{ 
                            display: 'flex', 
                            gap: isMobile ? 1 : 0,
                            width: isMobile ? '100%' : 'auto'
                          }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleUpdateQuestionStatus(question.id, 'approved')}
                              sx={{ 
                                mr: isMobile ? 0 : 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                  boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`
                                },
                                flex: isMobile ? 1 : 'none',
                                minWidth: isMobile ? 0 : 'auto'
                              }}
                            >
                              {isMobile ? 'Approve' : 'Approve'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleUpdateQuestionStatus(question.id, 'rejected')}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                flex: isMobile ? 1 : 'none',
                                minWidth: isMobile ? 0 : 'auto'
                              }}
                            >
                              {isMobile ? 'Reject' : 'Reject'}
                            </Button>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}

            {/* Pending Answers Tab */}
            {activeTab === 1 && (
              <Grid container spacing={isMobile ? 1 : 3}>
                {pendingAnswers.length === 0 ? (
                  <Grid item xs={12}>
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
                  </Grid>
                ) : (
                  pendingAnswers.map((answer) => (
                    <Grid item xs={12} key={answer.id}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          borderRadius: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[4],
                            borderColor: alpha(theme.palette.secondary.main, 0.2)
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant={isMobile ? "subtitle1" : "subtitle1"} 
                            gutterBottom 
                            fontWeight={600}
                            sx={{
                              color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.dark
                            }}
                          >
                            Answer to: {answer.question?.question || 'Question not available'}
                          </Typography>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: isMobile ? 1 : 2, 
                              mb: 2, 
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.background.default, 0.5),
                              borderLeft: `4px solid ${theme.palette.primary.main}`
                            }}
                          >
                            <Typography variant="body2" paragraph>
                              {answer.answer}
                            </Typography>
                          </Paper>
                          <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2} flexWrap="wrap">
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                sx={{ 
                                  width: isMobile ? 24 : 28, 
                                  height: isMobile ? 24 : 28, 
                                  mr: 1,
                                  bgcolor: theme.palette.info.main,
                                  color: theme.palette.info.contrastText
                                }}
                              >
                                {answer.users?.name?.charAt(0) || <PersonIcon fontSize="small" />}
                              </Avatar>
                              <Typography variant="body2" color="textSecondary">
                                {answer.users?.name || 'Anonymous'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {formatDate(answer.created_at)}
                            </Typography>
                            <Chip
                              icon={<PendingIcon fontSize="small" />}
                              label="Pending"
                              color="warning"
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontWeight: 500,
                                borderStyle: 'dashed'
                              }}
                            />
                          </Box>
                        </CardContent>
                        <Divider sx={{ opacity: 0.5 }} />
                        <CardActions sx={{ 
                          justifyContent: 'space-between', 
                          p: isMobile ? 1 : 2,
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: isMobile ? 1 : 0
                        }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewItem(answer)}
                            sx={{
                              color: theme.palette.text.secondary,
                              '&:hover': {
                                color: theme.palette.secondary.main
                              },
                              minWidth: isMobile ? '100%' : 'auto'
                            }}
                          >
                            View Details
                          </Button>
                          <Box sx={{ 
                            display: 'flex', 
                            gap: isMobile ? 1 : 0,
                            width: isMobile ? '100%' : 'auto'
                          }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleUpdateAnswerStatus(answer.id, 'approved')}
                              sx={{ 
                                mr: isMobile ? 0 : 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                  boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`
                                },
                                flex: isMobile ? 1 : 'none',
                                minWidth: isMobile ? 0 : 'auto'
                              }}
                            >
                              {isMobile ? 'Approve' : 'Approve'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleUpdateAnswerStatus(answer.id, 'rejected')}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                flex: isMobile ? 1 : 'none',
                                minWidth: isMobile ? 0 : 'auto'
                              }}
                            >
                              {isMobile ? 'Reject' : 'Reject'}
                            </Button>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
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
              {selectedItem.question && (
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
                  </Grid>
                  {!selectedItem.answer && (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          handleCloseViewDialog();
                          handleOpenAnswerDialog(selectedItem);
                        }}
                        startIcon={<QuestionAnswerIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          py: isMobile ? 1 : 1.5,
                          fontWeight: 600,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                          '&:hover': {
                            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                          },
                          width: isMobile ? '100%' : 'auto'
                        }}
                      >
                        Answer This Question
                      </Button>
                    </Box>
                  )}
                </>
              )}

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
                    <Typography variant="body1" fontWeight={500}>{selectedItem.question?.question || 'Question not available'}</Typography>
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
                        {formatDate(selectedItem.created_at)}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
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
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Answer Dialog */}
      <Dialog
        open={answerDialogOpen}
        onClose={handleCloseAnswerDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ 
          sx: { 
            borderRadius: isMobile ? 0 : 3,
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`
              : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`
          } 
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'secondary.main', 
            color: 'secondary.contrastText',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: isMobile ? 2 : 3
          }}
        >
          <QuestionAnswerIcon fontSize={isMobile ? "medium" : "large"} />
          <span>Answer Question</span>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 4 }}>
          {selectedItem && (
            <>
              <Typography variant={isMobile ? "subtitle1" : "subtitle1"} fontWeight="medium" gutterBottom>
                Question:
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
              <TextField
                autoFocus
                margin="dense"
                label="Your Answer"
                type="text"
                fullWidth
                multiline
                minRows={isMobile ? 4 : 6}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    '& fieldset': {
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  }
                }}
                InputLabelProps={{
                  sx: {
                    fontWeight: 500,
                    color: theme.palette.text.secondary
                  }
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button 
            onClick={handleCloseAnswerDialog} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 500,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2
              },
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAnswer}
            variant="contained"
            color="secondary"
            disabled={loading || !answerText.trim()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.3)}`
              },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.secondary.main, 0.5),
                color: theme.palette.secondary.contrastText
              },
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Submit Answer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QAModeration;