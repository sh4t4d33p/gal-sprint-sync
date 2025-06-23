import { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { register } from '../../utils/api';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameError(validateName(e.target.value));
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e: React.MouseEvent) => e.preventDefault();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (nameErr || emailErr || passwordErr) return;
    setLoading(true);
    try {
      await register(name, email, password);
      window.location.href = '/board';
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Name"
        type="text"
        value={name}
        onChange={handleNameChange}
        required
        fullWidth
        autoComplete="name"
        size="medium"
        error={!!nameError}
        helperText={nameError || ' '}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        required
        fullWidth
        autoComplete="email"
        size="medium"
        error={!!emailError}
        helperText={emailError || ' '}
      />
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={handlePasswordChange}
        required
        fullWidth
        autoComplete="new-password"
        size="medium"
        error={!!passwordError}
        helperText={passwordError || 'At least 6 characters'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        fullWidth
        size="large"
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
      </Button>
    </Box>
  );
}

export default RegisterForm; 