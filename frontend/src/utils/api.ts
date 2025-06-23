const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Set the mandatory headers for the API requests
 * @returns The headers object with the mandatory headers
 */
export function setMandatoryHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Login the user
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns The user data
 */
export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: setMandatoryHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed.');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Register the user
 * @param name - The name of the user
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns The user data
 */
export async function register(name: string, email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: setMandatoryHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed.');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Get the current user (requires JWT)
 * @returns The user data
 */
export async function getCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/current-user`, {
      method: 'GET',
      headers: setMandatoryHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch user.');
    }
    return data.user;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Update the user's name and email
 * @param userId - The user's ID
 * @param name - The new name
 * @param email - The new email
 * @returns The updated user data
 */
export async function updateUser(userId: number, name: string, email: string) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: setMandatoryHeaders(),
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Update failed');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Get all users (admin only)
 * @returns Array of users
 */
export async function getAllUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: setMandatoryHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch users.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Delete a user by ID (admin only)
 * @param userId - The user's ID
 * @returns User deleted message
 */
export async function deleteUser(userId: number) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: setMandatoryHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete user.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

// Add more API methods as needed (with JWT header if required) 