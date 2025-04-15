import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Tab,
  Tabs,
  CircularProgress, // Add this import
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  QuestionAnswer as QuestionAnswerIcon,
} from '@mui/icons-material';

const OrderInquiries = () => {
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAnswerDialog] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample data - replace with actual API call
  const inquiries = [
    {
      id: 1,
      orderId: 'ORD123456',
      buyer: 'John Smith',
      seller: 'Tech Store Inc',
      subject: 'Delivery Status Inquiry',
      status: 'Open',
      date: '2023-12-01',
      messages: [
        {
          id: 1,
          sender: 'John Smith',
          role: 'buyer',
          message: 'When will my order be delivered?',
          timestamp: '2023-12-01 10:00 AM',
        },
        {
          id: 2,
          sender: 'Tech Store Inc',
          role: 'seller',
          message: 'Your order will be delivered by tomorrow evening.',
          timestamp: '2023-12-01 11:30 AM',
        },
      ],
    },
    {
      id: 2,
      orderId: 'ORD789012',
      buyer: 'Sarah Johnson',
      seller: 'Fashion Hub',
      subject: 'Product Quality Issue',
      status: 'Pending',
      date: '2023-12-02',
      messages: [
        {
          id: 1,
          sender: 'Sarah Johnson',
          role: 'buyer',
          message: 'The product quality is not as described.',
          timestamp: '2023-12-02 09:15 AM',
        },
      ],
    },
  ];

  // Sample questions data - replace with actual API call
  const sampleQuestions = [
    {
      id: 1,
      productId: 'PROD123',
      question: 'Is this product available in red color?',
      askedBy: 'John Doe',
      status: 'Unanswered',
      date: '2023-12-05',
      answers: [],
    },
    {
      id: 2,
      productId: 'PROD456',
      question: 'What are the shipping options?',
      askedBy: 'Jane Smith',
      status: 'Answered',
      date: '2023-12-04',
      answers: [
        {
          id: 1,
          answer: 'We offer standard and express shipping options.',
          answeredBy: 'Admin',
          date: '2023-12-04',
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/qa/questions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAnswerQuestion = (question) => {
    setSelectedQuestion(question);
    setOpenAnswerDialog(true);
    setError(null);
  };

  const handleDeleteQuestion = async (question) => {
    try {
      const response = await fetch(`${API_BASE_URL}/qa/questions/${question.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(questions.filter(q => q.id !== question.id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting question:', err);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;

    try {
      const response = await fetch(`http://localhost:8080/qa/questions/${selectedQuestion.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ answer: answerText }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const updatedQuestion = await response.json();
      
      // Update questions list
      const updatedQuestions = questions.map(q => 
        q.id === selectedQuestion.id ? updatedQuestion : q
      );

      setQuestions(updatedQuestions);
      setAnswerText('');
      setOpenAnswerDialog(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError(error.message);
    }
  };

  const questionColumns = [
    { field: 'productId', headerName: 'Product ID', flex: 1 },
    { field: 'question', headerName: 'Question', flex: 2 },
    { field: 'askedBy', headerName: 'Asked By', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Answered' ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    { field: 'date', headerName: 'Date', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleAnswerQuestion(params.row)}
          >
            <QuestionAnswerIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteQuestion(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenDialog(true);
  };

  const handleDeleteInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenDeleteDialog(true);
  };

  const [inquiriesList, setInquiriesList] = useState([]); // Add this state
  const [inquiriesLoading, setInquiriesLoading] = useState(false); // Add this state

  // Replace the static inquiries array with this function
  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/inquiries', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }
      const data = await response.json();
      setInquiriesList(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching inquiries:', err);
    } finally {
      setInquiriesLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update handleConfirmDelete function
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/inquiries/${selectedInquiry.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete inquiry');
      }

      setInquiriesList(inquiriesList.filter(inq => inq.id !== selectedInquiry.id));
      setOpenDeleteDialog(false);
      setSelectedInquiry(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting inquiry:', err);
    }
  };

  // Update the DataGrid in the render section
  return (
    <Box sx={{ flexGrow: 1, p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Order Inquiries & Questions
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Order Inquiries" />
          <Tab label="Product Questions" />
        </Tabs>
      </Box>

      {currentTab === 0 ? (
        <Paper sx={{ mt: 2, p: 2 }}>
          {inquiriesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
              <Typography>{error}</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={inquiriesList}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              checkboxSelection
              disableSelectionOnClick
              autoHeight
              sx={{ minHeight: 400 }}
            />
          )}
        </Paper>
      ) : (
        <Paper sx={{ mt: 2, p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
              <Typography>{error}</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={questions}
              columns={questionColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              checkboxSelection
              disableSelectionOnClick
              autoHeight
              sx={{ minHeight: 400 }}
            />
          )}
        </Paper>
      )}

      {/* Inquiry Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Inquiry Details - {selectedInquiry?.orderId}
        </DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Subject: {selectedInquiry.subject}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: {selectedInquiry.status} | Date: {selectedInquiry.date}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                {selectedInquiry.messages.map((message) => (
                  <ListItem key={message.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        {message.role === 'buyer' ? <PersonIcon /> : <StoreIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          component="span"
                          variant="subtitle2"
                          color="text.primary"
                        >
                          {message.sender}
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            {message.timestamp}
                          </Typography>
                        </Typography>
                      }
                      secondary={message.message}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Inquiry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this inquiry?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Answer Question Dialog */}
      <Dialog
        open={openAnswerDialog}
        onClose={() => {
          setOpenAnswerDialog(false);
          setAnswerText('');
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Answer Question</DialogTitle>
        <DialogContent>
          {selectedQuestion && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Question: {selectedQuestion.question}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Asked By: {selectedQuestion.askedBy} | Date: {selectedQuestion.date}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Your Answer"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenAnswerDialog(false);
            setAnswerText('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAnswer}
            color="primary"
            variant="contained"
            disabled={!answerText.trim()}
          >
            Submit Answer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderInquiries;