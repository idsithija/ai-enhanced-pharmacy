import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

const validationSchema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      role: 'pharmacist',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError('');
        setLoading(true);
        
        console.log('Attempting login with:', values.email);
        
        const response = await authService.login({
          email: values.email,
          password: values.password,
        });
        
        console.log('Login successful:', response);
        
        login(response.user, response.token);
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              🏥 Pharmacy Management
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Sign in to continue
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  id="role"
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="pharmacist">Pharmacist</MenuItem>
                  <MenuItem value="cashier">Cashier</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                // onClick={(e) => {
                //   e.preventDefault();
                //   formik.handleSubmit();
                // }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

            <Typography variant="body2" align="center" sx={{mt: 2 }} color="text.secondary">
              Demo: admin@pharmacy.com / admin123
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
