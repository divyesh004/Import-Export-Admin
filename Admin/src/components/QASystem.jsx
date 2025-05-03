import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Badge,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { useAuth } from '../services/AuthContext';
import { qaApi } from '../services/api';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const QASystem = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('question');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });
  
  // Check if user is a sub-admin
  const isSubAdmin = user?.role === 'sub-admin';

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Determine which API endpoint to use based on user role
      const response = await qaApi.getProductQuestions({
        page,
        pageSize,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
        // Pass industry parameter for sub-admin users
        industry: isSubAdmin ? user?.industry : undefined
      });
      
      // For sub-admin, filter questions by industry on client-side as well for extra security
      let filteredQuestions = response.questions;
      if (isSubAdmin && user?.industry) {
        filteredQuestions = filteredQuestions.filter(q => 
          q.products?.industry === user.industry
        );
      }
      
      setQuestions(filteredQuestions);
      setTotalQuestions(response.total);
      
      // Fetch answers for each question
      const answersMap = {};
      for (const question of response.questions) {
        try {
          const answersResponse = await qaApi.getQuestionAnswers(question.id);
          answersMap[question.id] = answersResponse;
        } catch (error) {
          console.error(`Error fetching answers for question ${question.id}:`, error);
        }
      }
      setAnswers(answersMap);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterStatus, searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenDialog = (mode, item = null) => {
    setDialogMode(mode);
    setSelectedItem(item);
    if (item) {
      setFormData({
        question: item.question,
        answer: item.answer || '',
      });
    } else {
      setFormData({ question: '', answer: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (dialogMode === 'question') {
        if (selectedItem) {
          setError('Question update feature is not available');
          return;
        } else {
          await qaApi.createQuestion({
            question: formData.question
          });
          setSuccess('Question added successfully!');
        }
      } else if (selectedItem) {
        await qaApi.createAnswer(selectedItem.id, formData.answer);
        setSuccess('Answer submitted successfully!');
      }
      
      await fetchQuestions();
      setTimeout(() => setSuccess(''), 3000);
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Error performing action');
      console.error('Error submitting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Check if user is a sub-admin - prevent deletion if they are
    if (isSubAdmin) {
      setError('Sub-admin users do not have permission to delete questions. Please contact an administrator.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      setLoading(true);
      setError('');
      await qaApi.deleteQuestion(id);
      setSuccess('Question deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchQuestions();
    } catch (err) {
      setError('Failed to delete question. Please try again.');
      console.error('Error deleting question:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={2}>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search questions"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setSearchQuery('')}
                          edge="end"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Filter by status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Questions</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Answered">Answered</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={fetchQuestions}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : questions.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No questions found
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenDialog('question')}
                sx={{ mt: 2 }}
              >
                Add First Question
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {questions.map((question) => (
                <Grid item xs={12} key={question.id}>
                  <Card elevation={2} sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flexGrow={1}>
                          <Typography variant="h6" fontWeight="medium" gutterBottom>
                            {question.question}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                {question.askedBy?.charAt(0) || <PersonIcon fontSize="small" />}
                              </Avatar>
                              <Typography variant="body2" color="textSecondary">
                                {question.askedBy || 'Anonymous'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {formatDate(question.date)}
                            </Typography>
                            <Chip
                              label={question.status}
                              color={question.status === 'Answered' ? 'success' : 'warning'}
                              size="small"
                              icon={question.status === 'Answered' ? 
                                <CheckCircleIcon fontSize="small" /> : 
                                <PendingIcon fontSize="small" />}
                              variant="outlined"
                            />
                            <Badge 
                              badgeContent={answers[question.id]?.length || 0} 
                              color="primary"
                              overlap="circular"
                            >
                              <QuestionAnswerIcon color="action" fontSize="small" />
                            </Badge>
                          </Box>
                        </Box>
                        <IconButton
                          onClick={() => toggleQuestionExpansion(question.id)}
                          size="small"
                        >
                          {expandedQuestions[question.id] ? 
                            <ExpandLessIcon /> : 
                            <ExpandMoreIcon />}
                        </IconButton>
                      </Box>

                      <Collapse in={expandedQuestions[question.id]}>
                        <Box mt={2}>
                          {answers[question.id]?.length > 0 ? (
                            <>
                              <Typography variant="subtitle2" gutterBottom>
                                Answers ({answers[question.id].length})
                              </Typography>
                              <List dense disablePadding>
                                {answers[question.id].map((answer) => (
                                  <React.Fragment key={answer.id}>
                                    <ListItem alignItems="flex-start" disablePadding>
                                      <ListItemAvatar>
                                        <Avatar sx={{ width: 32, height: 32 }}>
                                          {answer.users?.name?.charAt(0) || <PersonIcon />}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" fontWeight="medium">
                                            {answer.users?.name || 'Unknown'}
                                          </Typography>
                                        }
                                        secondary={
                                          <>
                                            <Typography variant="body2" color="text.secondary">
                                              {answer.answer}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                              {formatDate(answer.created_at)}
                                            </Typography>
                                          </>
                                        }
                                        secondaryTypographyProps={{ component: 'div' }}
                                      />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                  </React.Fragment>
                                ))}
                              </List>
                            </>
                          ) : (
                            <Typography variant="body2" color="textSecondary" fontStyle="italic">
                              No answers yet
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      {question.status === 'Pending' && (
                        <Tooltip title="Add answer">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenDialog('answer', question)}
                          >
                            Answer
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete question">
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(question.id)}
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {totalQuestions > pageSize && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button 
                variant="outlined" 
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalQuestions}
              >
                Load More
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          {dialogMode === 'question'
            ? selectedItem
              ? 'Edit Question'
              : 'New Question'
            : 'Add Answer'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {dialogMode === 'question' ? (
            <TextField
              autoFocus
              margin="dense"
              label="Question"
              type="text"
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              variant="outlined"
              sx={{ mt: 2 }}
            />
          ) : (
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Question:
              </Typography>
              <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                <Typography>{selectedItem?.question}</Typography>
              </Paper>
              <TextField
                autoFocus
                margin="dense"
                label="Your Answer"
                type="text"
                fullWidth
                multiline
                minRows={4}
                maxRows={8}
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading || !formData[dialogMode === 'question' ? 'question' : 'answer']}
            sx={{ borderRadius: 1 }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {dialogMode === 'question' ? 'Submit Question' : 'Post Answer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QASystem;