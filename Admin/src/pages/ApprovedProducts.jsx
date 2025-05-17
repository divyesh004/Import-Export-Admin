import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Snackbar,
  Avatar,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Store as StoreIcon,
  Star as StarIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  DateRange as DateRangeIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  StarHalf as StarHalfIcon,
  Comment as CommentIcon,
  PhotoLibrary as PhotoLibraryIcon
} from '@mui/icons-material';
import productService from '../services/productService';

const ApprovedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [userIndustry, setUserIndustry] = useState('');

  useEffect(() => {
    // Get user role and industry from localStorage
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'sub-admin') {
      setUserIndustry(localStorage.getItem('userIndustry') || '');
    }
    
    const fetchApprovedProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getApprovedProducts();
        
        const transformedProducts = data.map(product => {
          let imageUrl = null;
          
          if (product.product_images && product.product_images.length > 0) {
            imageUrl = product.product_images[0].image_url;
          } else if (product.image_url) {
            imageUrl = product.image_url;
          } else if (product.image) {
            imageUrl = product.image;
          }
          
          return {
            ...product,
            image: imageUrl,
            image_url: imageUrl
          };
        });
        
        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching approved products:', err);
        setError('Failed to load approved products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedProducts();
  }, []);
  
  const handleReject = async (productId) => {
    try {
      setLoading(true);
      await productService.updateProductStatus(productId, 'reject');
      setProducts(products.filter(product => product.id !== productId));
      setSnackbar({
        open: true,
        message: 'Product rejected successfully',
        severity: 'success'
      });
      setOpenDetails(false);
    } catch (err) {
      console.error('Error rejecting product:', err);
      setSnackbar({
        open: true,
        message: 'Failed to reject product. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setOpenDetails(true);
    setActiveTab(0);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedProduct(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        background: '##e5e7eb',
        borderRadius: 3
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (products.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 } }}>
        <Paper elevation={0} >
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <InfoIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Approved Products Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {localStorage.getItem('userRole') === 'sub-admin' 
                ? 'There are no approved products in your assigned industry category.'
                : 'There are no approved products available at this time.'}
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 } }}>
      <Paper elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Avatar sx={{ 
                  bgcolor: 'success.main', 
                  width: 24, 
                  height: 24,
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                }}>
                  <CheckCircleIcon fontSize="small" />
                </Avatar>
              }
            >
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56,
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)'
              }}>
                <StoreIcon fontSize="large" />
              </Avatar>
            </Badge>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Approved Products
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage all approved marketplace products
            </Typography>
          </Box>
        </Box>
        {userIndustry && localStorage.getItem('userRole') === 'sub-admin' && (
          <Chip
            icon={<CategoryIcon />}
            label={`Industry: ${userIndustry}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        )}
        
        <Divider sx={{ 
          my: 3, 
          borderColor: 'rgba(0, 0, 0, 0.08)',
          borderBottomWidth: 2 
        }} />
        
        {products.length === 0 ? (
          <Paper>
            <Typography variant="h6" color="textSecondary">
              No approved products found
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              All approved products will appear here
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  onView={handleViewDetails}
                  onReject={handleReject}
                  showActions={true}
                  actionButtons={{ view: true, approve: false, reject: true }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Product Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden'
          }
        }}
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box display="flex" alignItems="center">
                <InfoIcon sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedProduct.name}
                </Typography>
              </Box>
              <Chip 
                label="Approved" 
                color="success" 
                icon={<CheckCircleIcon />}
                sx={{ 
                  fontWeight: 600,
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                }}
              />
            </DialogTitle>
            
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Tab label="Overview" icon={<InfoIcon />} />
              <Tab label="Details" icon={<DescriptionIcon />} />
              <Tab label="Images" icon={<PhotoLibraryIcon />} />
            </Tabs>
            
            <DialogContent dividers sx={{ p: 0, bgcolor: 'background.default' }}>
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <CardMedia
                        component="img"
                        height="400"
                        image={selectedProduct.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={selectedProduct.name}
                        sx={{
                          objectFit: 'contain',
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          p: 1
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 3,
                        height: '100%'
                      }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                          {selectedProduct.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mr: 2 }}>
                            ${selectedProduct.price.toFixed(2)}
                          </Typography>
                          {selectedProduct.rating && (
                            <Chip
                              label={`${selectedProduct.rating} ★`}
                              color="warning"
                              icon={<StarHalfIcon />}
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                          {selectedProduct.description}
                        </Typography>
                        
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, border: 'none' }}>
                                  <Box display="flex" alignItems="center">
                                    <CategoryIcon color="primary" sx={{ mr: 1 }} />
                                    Category
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                  {selectedProduct.category}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, border: 'none' }}>
                                  <Box display="flex" alignItems="center">
                                    <InventoryIcon color="primary" sx={{ mr: 1 }} />
                                    Stock
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                  {selectedProduct.stock || 'N/A'}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, border: 'none' }}>
                                  <Box display="flex" alignItems="center">
                                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                                    Seller
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                  {selectedProduct.sellerName}
                                </TableCell>
                              </TableRow>
                              {selectedProduct.createdAt && (
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600, border: 'none' }}>
                                    <Box display="flex" alignItems="center">
                                      <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                                      Date Added
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ border: 'none' }}>
                                    {new Date(selectedProduct.createdAt).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Product Specifications
                  </Typography>
                  
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableBody>
                        {Object.entries(selectedProduct.specifications || {}).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell sx={{ fontWeight: 600, width: '30%' }}>
                              {key}
                            </TableCell>
                            <TableCell>
                              {Array.isArray(value) ? value.join(', ') : value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Additional Information
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.additionalInfo || 'No additional information available.'}
                  </Typography>
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Product Images
                  </Typography>
                  
                  {selectedProduct.product_images && selectedProduct.product_images.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedProduct.product_images.map((image, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card>
                            <CardMedia
                              component="img"
                              height="200"
                              image={image.image_url}
                              alt={`${selectedProduct.name} - ${index + 1}`}
                              sx={{
                                objectFit: 'contain',
                                bgcolor: 'background.paper',
                                p: 1
                              }}
                            />
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Image {index + 1}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No additional images available
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Button 
                onClick={handleCloseDetails}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
              <Button 
                onClick={() => handleReject(selectedProduct.id)}
                color="error"
                variant="contained"
                startIcon={<CancelIcon />}
                sx={{ borderRadius: 2 }}
                disabled={loading}
              >
                Reject Product
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ApprovedProducts;