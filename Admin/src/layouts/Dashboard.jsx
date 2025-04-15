
import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert, Chip, Container, Divider, Avatar, Card, CardContent, LinearProgress, Tooltip, Badge } from '@mui/material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  QuestionAnswer as QuestionAnswerIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  CloudDone as CloudDoneIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';

// Animated stat card component with enhanced visuals
const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 160,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: 'white',
        boxShadow: `0 8px 32px ${color}33`,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 12px 40px ${color}40`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at top right, ${color}22 0%, transparent 70%)`,
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Avatar
          sx={{ 
            width: 56, 
            height: 56, 
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 32 } })}
        </Avatar>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 'bold',
            textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          {value}
        </Typography>
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          mt: 2,
          fontWeight: 'medium',
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontSize: '0.9rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {title}
      </Typography>
    </Paper>
  </motion.div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    pendingProducts: 0,
    activeInquiries: 0,
    monthlySales: 0,
    recentActivities: [],
    systemStatus: {
      server: 'Offline',
      database: 'Disconnected',
      api: 'Stopped'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken, user } = useAuth();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Access token required. Please login.');
          setLoading(false);
          return;
        }
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // console.log('Using token:', token);
        
        // Fetch dashboard stats
        const dashboardResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}analytics/dashboard`, {
          method: 'GET',
          headers: headers
        });
        
        if (!dashboardResponse.ok) {
          const errorData = await dashboardResponse.json().catch(() => ({}));
          console.error('Dashboard response error:', dashboardResponse.status, errorData);
          throw new Error(`Failed to fetch dashboard data: ${errorData.error || dashboardResponse.statusText}`);
        }
        
        const dashboardStats = await dashboardResponse.json();
        
        // Fetch recent activities
        const activitiesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}analytics/activities`, {
          method: 'GET',
          headers: headers
        });
        
        if (!activitiesResponse.ok) {
          const errorData = await activitiesResponse.json().catch(() => ({}));
          console.error('Activities response error:', activitiesResponse.status, errorData);
          throw new Error(`Failed to fetch activities: ${errorData.error || activitiesResponse.statusText}`);
        }
        
        const activitiesData = await activitiesResponse.json();
        
        // Map backend data to frontend structure
        setDashboardData({
          totalUsers: dashboardStats.totalCustomers + dashboardStats.totalSellers,
          pendingProducts: dashboardStats.pendingProducts || 0,
          activeInquiries: dashboardStats.pendingQuestions || 0,
          monthlySales: dashboardStats.monthlyIncome || 0,
          recentActivities: activitiesData.activities || [],
          systemStatus: {
            server: 'Online',
            database: 'Connected',
            api: 'Running'
          }
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [getToken]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, mt: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="h4">Unable to load dashboard</Typography>
      </Box>
    );
  }
  
  const stats = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers.toLocaleString(),
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#1565C0' }} />, // Deep Blue
      color: '#E3F2FD', // Light Blue Background
      textColor: '#0D47A1', // Dark Blue Text
      valueColor: '#000', // Black Bold Value
    },
    {
      title: 'Pending Products',
      value: dashboardData.pendingProducts.toLocaleString(),
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#D32F2F' }} />, // Bold Red
      color: '#FFEBEE', // Light Red Background
      textColor: '#B71C1C', // Dark Red Text
      valueColor: '#000', // Black Bold Value
    },
    {
      title: 'Active Inquiries',
      value: dashboardData.activeInquiries.toLocaleString(),
      icon: <QuestionAnswerIcon sx={{ fontSize: 40, color: '#2E7D32' }} />, // Dark Green
      color: '#E8F5E9', // Light Green Background
      textColor: '#1B5E20', // Deep Green Text
      valueColor: '#000', // Black Bold Value
    },
    {
      title: 'Monthly Sales',
      value: `$${dashboardData.monthlySales.toLocaleString()}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#7B1FA2' }} />, // Rich Purple
      color: '#F3E5F5', // Light Purple Background
      textColor: '#4A148C', // Deep Purple Text
      valueColor: '#000', // Black Bold Value
    },
  ];
  

  return (
    <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 } }}>
      <Box 
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 4 }, 
          borderRadius: 4,
          background: 'linear-gradient(to bottom,rgb(156, 181, 231), #f0f2f5)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        {error ? (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.1)' 
            }}
            icon={<Badge badgeContent="!" color="error" />}
          >
            {error}
          </Alert>
        ) : null}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box
            component={motion.div}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            sx={{ 
              mr: 2, 
              p: 1.5, 
              borderRadius: '50%', 
              background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)',
            }}
          >
            <SpeedIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography 
            variant="h4" 
            component={motion.h4}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 0.5,
            }}
          >
            {user?.role === 'sub-admin' && user?.industry ? 
              `${user.industry} Industry Dashboard` : 
              'Admin Dashboard'}
          </Typography>
        </Box>

        <Grid container spacing={3}>
  {stats.map((stat, index) => (
    <Grid item xs={12} sm={6} md={3} key={index}>
      <Box 
        component={motion.div} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        sx={{
          backgroundColor: stat.color,
          borderRadius: 2,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderLeft: `5px solid ${stat.icon.props.sx.color}`, // Accent Border
        }}
      >
        <Typography variant="h6" sx={{ color: stat.textColor, fontWeight: 600 }}>
          {stat.title}
        </Typography>
        <Typography variant="h4" sx={{ color: stat.valueColor, fontWeight: 'bold' }}>
          {stat.value}
        </Typography>
        {stat.icon}
      </Box>
    </Grid>
  ))}
</Grid>;

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2,
                    boxShadow: '0 4px 8px rgba(63, 81, 181, 0.25)',
                  }}
                >
                  <NotificationsIcon />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main',
                  }}
                >
                  Recent Activities
                </Typography>
              </Box>
              
              {dashboardData.recentActivities.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    border: '1px dashed rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                  <Typography color="text.secondary">No recent activities</Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
                  {dashboardData.recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card 
                        sx={{ 
                          mb: 2, 
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: activity.type === 'order' ? 'success.main' : 
                                      activity.type === 'question' ? 'info.main' : 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {activity.type === 'order' ? '🛒 New Order' : 
                              activity.type === 'question' ? '❓ New Question' : '👤 New User'}
                            </Typography>
                            <Chip 
                              label={activity.time} 
                              size="small" 
                              variant="outlined" 
                              sx={{ 
                                fontSize: '0.7rem', 
                                height: 24,
                                bgcolor: 'background.paper',
                              }} 
                            />
                          </Box>
                          <Typography variant="body2">{activity.text}</Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>
        
        {/* System Status */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2,
                    boxShadow: '0 4px 8px rgba(63, 81, 181, 0.25)',
                  }}
                >
                  <CloudDoneIcon />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main',
                  }}
                >
                  System Status
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: dashboardData.systemStatus.server === 'Online' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        border: `1px solid ${dashboardData.systemStatus.server === 'Online' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                        boxShadow: dashboardData.systemStatus.server === 'Online' ? '0 4px 12px rgba(76, 175, 80, 0.15)' : '0 4px 12px rgba(244, 67, 54, 0.15)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <StorageIcon 
                          sx={{ 
                            mr: 1, 
                            color: dashboardData.systemStatus.server === 'Online' ? 'success.main' : 'error.main',
                            fontSize: 20,
                          }} 
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                          Server
                        </Typography>
                      </Box>
                      <Chip 
                        label={dashboardData.systemStatus.server}
                        size="small"
                        color={dashboardData.systemStatus.server === 'Online' ? 'success' : 'error'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Paper>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: dashboardData.systemStatus.database === 'Connected' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        border: `1px solid ${dashboardData.systemStatus.database === 'Connected' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                        boxShadow: dashboardData.systemStatus.database === 'Connected' ? '0 4px 12px rgba(76, 175, 80, 0.15)' : '0 4px 12px rgba(244, 67, 54, 0.15)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                         <StorageIcon 
                           sx={{ 
                             mr: 1, 
                             color: dashboardData.systemStatus.database === 'Connected' ? 'success.main' : 'error.main',
                             fontSize: 20,
                           }} 
                         />
                         <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                           Database
                         </Typography>
                       </Box>
                       <Chip 
                         label={dashboardData.systemStatus.database}
                         size="small"
                         color={dashboardData.systemStatus.database === 'Connected' ? 'success' : 'error'}
                         sx={{ fontWeight: 'bold' }}
                       />
                     </Paper>
                   </motion.div>
                 </Grid>
                 
                 <Grid item xs={12} md={4}>
                   <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                     <Paper 
                       elevation={0}
                       sx={{ 
                         p: 2, 
                         textAlign: 'center',
                         borderRadius: 2,
                         bgcolor: dashboardData.systemStatus.api === 'Running' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                         border: `1px solid ${dashboardData.systemStatus.api === 'Running' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                         boxShadow: dashboardData.systemStatus.api === 'Running' ? '0 4px 12px rgba(76, 175, 80, 0.15)' : '0 4px 12px rgba(244, 67, 54, 0.15)',
                       }}
                     >
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                         <CloudDoneIcon 
                           sx={{ 
                             mr: 1, 
                             color: dashboardData.systemStatus.api === 'Running' ? 'success.main' : 'error.main',
                             fontSize: 20,
                           }} 
                         />
                         <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                           API
                         </Typography>
                       </Box>
                       <Chip 
                         label={dashboardData.systemStatus.api}
                         size="small"
                         color={dashboardData.systemStatus.api === 'Running' ? 'success' : 'error'}
                         sx={{ fontWeight: 'bold' }}
                       />
                     </Paper>
                   </motion.div>
                 </Grid>
                 
                 <Grid item xs={12} sx={{ mt: 2 }}>
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                   >
                     <Box 
                       sx={{ 
                         p: 3, 
                         borderRadius: 2,
                         bgcolor: 'rgba(63, 81, 181, 0.05)',
                         border: '1px dashed rgba(63, 81, 181, 0.2)',
                         position: 'relative',
                         overflow: 'hidden',
                       }}
                     >
                       <Box sx={{ position: 'relative', zIndex: 1 }}>
                         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                           <SpeedIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                           Platform Summary
                         </Typography>
                         
                         <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                           Your platform is running smoothly with {dashboardData.totalUsers} registered users and ${dashboardData.monthlySales} in monthly revenue.
                         </Typography>
                         
                         <Divider sx={{ my: 2 }} />
                         
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                             <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                             Last updated: {new Date().toLocaleString()}
                           </Typography>
                           <Chip
                             label="All systems operational"
                             size="small"
                             color="primary"
                             variant="outlined"
                             sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                           />
                         </Box>
                       </Box>
                       
                       <Box 
                         sx={{ 
                           position: 'absolute',
                           top: -20,
                           right: -20,
                           width: 120,
                           height: 120,
                           borderRadius: '50%',
                           background: 'radial-gradient(circle, rgba(63, 81, 181, 0.1) 0%, transparent 70%)',
                           zIndex: 0,
                         }}
                       />
                     </Box>
                   </motion.div>
                 </Grid>
               </Grid>
             </Paper>
           </motion.div>
         </Grid>
       </Grid>
       
       {/* Remove duplicate sections */}
     </Box>
   </Container>

  );
};

export default Dashboard;