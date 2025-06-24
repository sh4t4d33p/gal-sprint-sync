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

/**
 * Get time logged per day for users (admin: all users, user: self)
 * @param startDate - YYYY-MM-DD
 * @param endDate - YYYY-MM-DD
 * @returns Array of user stats with per-day data
 */
export async function getTimeLoggedPerDay(startDate: string, endDate: string) {
  try {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await fetch(`${API_BASE}/users/stats/time-logged-per-day?${params.toString()}`, {
      method: 'GET',
      headers: setMandatoryHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch analytics.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Get top users by total minutes logged (admin only)
 * @returns Array of top users
 */
export async function getTopUsers() {
  try {
    const res = await fetch(`${API_BASE}/users/stats/top-users`, {
      method: 'GET',
      headers: setMandatoryHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch top users.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Get all tasks (admin: all, user: own)
 * @returns Array of tasks
 */
export async function getTasks() {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'GET',
      headers: setMandatoryHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch tasks.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Create a new task (admin can assign to any user)
 * @param task - { title, description, status, userId? }
 * @returns The created task
 */
export async function createTask(task: { title: string; description: string; status: string; userId?: number }) {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: setMandatoryHeaders(),
      body: JSON.stringify(task),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create task.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Get AI suggested description for a task title
 * @param title - The task title
 * @returns The suggested description string
 */
export async function suggestDescriptionAI(title: string): Promise<string> {
  try {
    let url = `${API_BASE}/ai/suggest?title=${title}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: setMandatoryHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to get AI suggestion.');
    }
    return data.description || '';
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}

/**
 * Delete a task by ID
 * @param taskId - The task's ID
 * @returns Task deleted message
 */
export async function deleteTask(taskId: number) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: setMandatoryHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete task.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error.');
  }
}