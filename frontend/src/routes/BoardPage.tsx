import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Avatar, CircularProgress, Alert } from '@mui/material';
import { useUser } from '../UserContext';
import { getTasks, getAllUsers, createTask, deleteTask, updateTask, patchTaskProgress } from '../utils/api';
import TaskCard from '../components/TaskCard/TaskCard';
import CreateTaskModal from '../components/TaskCard/CreateTaskModal';
import TaskModal from '../components/TaskCard/TaskModal';
import Divider from '@mui/material/Divider';

const STATUSES = [
  { key: 'ToDo', label: 'To Do' },
  { key: 'InProgress', label: 'In Progress' },
  { key: 'Done', label: 'Done' },
];

export default function BoardPage() {
  const { user } = useUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // For admin
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        await refreshTasks();
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.isAdmin]);

  // Helper to get user info by userId
  const getUserById = (id: number) => users.find((u: any) => u.id === id) || { name: 'Unknown', email: '', id };

  // Group tasks by status, then by user (for admin)
  const getSwimlaneContent = (statusKey: string) => {
    const filtered = tasks.filter(t => t.status === statusKey);
    if (user?.isAdmin) {
      // Group by user
      const byUser: Record<number, any[]> = {};
      filtered.forEach(t => {
        if (!byUser[t.userId]) byUser[t.userId] = [];
        byUser[t.userId].push(t);
      });
      // Get unique users for this swimlane, sorted alphabetically by name
      const usersInSwimlane = Array.from(new Set(filtered.map(t => t.userId)));
      const sortedUsers = usersInSwimlane
        .map(uid => ({
          uid,
          name: getUserById(uid).name || '',
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return sortedUsers.map((userObj, idx) => {
        const uid = userObj.uid;
        const userTasks = byUser[uid];
        const u = getUserById(uid);
        return (
          <Box key={uid} mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Avatar sx={{ width: 28, height: 28 }}>{u.name ? u.name[0].toUpperCase() : '?'}</Avatar>
              <Typography fontWeight={600}>{u.name}</Typography>
            </Box>
            {userTasks.map(task => (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
                totalMinutes={task.totalMinutes}
                onDelete={async () => {
                  await deleteTask(task.id);
                  await refreshTasks();
                }}
                onClick={() => handleCardClick(task)}
                onUpdateTotalMinutes={async (newMinutes) => {
                  await patchTaskProgress(task.id, { totalMinutes: newMinutes });
                  await refreshTasks();
                }}
                taskId={task.id}
              />
            ))}
            {idx < sortedUsers.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        );
      });
    } else {
      // Normal user: just list their tasks
      return filtered.map(task => (
        <TaskCard
          key={task.id}
          title={task.title}
          description={task.description}
          totalMinutes={task.totalMinutes}
          onDelete={async () => {
            await deleteTask(task.id);
            await refreshTasks();
          }}
          onClick={() => handleCardClick(task)}
          onUpdateTotalMinutes={async (newMinutes) => {
            await patchTaskProgress(task.id, { totalMinutes: newMinutes });
            await refreshTasks();
          }}
          taskId={task.id}
        />
      ));
    }
  };

  // For admin: render board as user rows, each with 3 columns (statuses)
  const getAdminBoardContent = () => {
    // Get all users with tasks in any status, sorted alphabetically
    const userIds = Array.from(new Set(tasks.map(t => t.userId)));
    const sortedUsers = userIds
      .map(uid => ({
        uid,
        name: getUserById(uid).name || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
      <Box>
        <Box display="flex" gap={0} mb={2} mt={2}>
          {STATUSES.map(status => (
            <Box key={status.key} flex={1} minWidth={0} display="flex" flexDirection="column">
              <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
                {status.label}
              </Typography>
            </Box>
          ))}
        </Box>
        {sortedUsers.map((userObj, idx) => {
          const uid = userObj.uid;
          const u = getUserById(uid);
          return (
            <Box key={uid} mb={0}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Avatar sx={{ width: 28, height: 28 }}>{u.name ? u.name[0].toUpperCase() : '?'}</Avatar>
                <Typography fontWeight={600}>{u.name}</Typography>
              </Box>
              <Box display="flex" gap={0}>
                {STATUSES.map(status => {
                  const userTasks = tasks.filter(t => t.userId === uid && t.status === status.key);
                  return (
                    <Box key={status.key} flex={1} minWidth={0} display="flex" flexDirection="column">
                      <Paper sx={{ p: 0, flex: 1, bgcolor: 'grey.50', borderRadius: 0, minHeight: 0, display: 'flex', flexDirection: 'column', boxShadow: 'none', borderRight: status.key !== 'Done' ? '1px solid #eee' : 'none' }}>
                        {userTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            title={task.title}
                            description={task.description}
                            totalMinutes={task.totalMinutes}
                            onDelete={async () => {
                              await deleteTask(task.id);
                              await refreshTasks();
                            }}
                            onClick={() => handleCardClick(task)}
                            onUpdateTotalMinutes={async (newMinutes) => {
                              await patchTaskProgress(task.id, { totalMinutes: newMinutes });
                              await refreshTasks();
                            }}
                            taskId={task.id}
                          />
                        ))}
                      </Paper>
                    </Box>
                  );
                })}
              </Box>
              {idx < sortedUsers.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          );
        })}
      </Box>
    );
  };

  // Helper to refresh tasks (and users if admin)
  const refreshTasks = async () => {
    if (user?.isAdmin) {
      const [tasksData, usersData] = await Promise.all([getTasks(), getAllUsers()]);
      setTasks(tasksData);
      setUsers(usersData);
    } else {
      const tasksData = await getTasks();
      setTasks(tasksData);
    }
  };

  const handleCreateTask = async (data: { title: string; description: string; userId: number }) => {
    setCreating(true);
    try {
      await createTask({ ...data, status: 'ToDo' });
      await refreshTasks();
      setCreateOpen(false);
    } catch (err: any) {
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const handleCardClick = (task: any) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskSave = async (data: { title: string; description: string; totalMinutes: number; status: string; userId?: number }) => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, data.title, data.description, data.status, data.totalMinutes, data.userId);
    await refreshTasks();
  };

  const handleTaskDelete = async () => {
    if (!selectedTask) return;
    await deleteTask(selectedTask.id);
    await refreshTasks();
    handleModalClose();
  };

  return (
    <Box width="100vw">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={4} px={12}>
        <Typography variant="h4" fontWeight={700}>Sprint Board</Typography>
        <Button variant="contained" color="primary" onClick={() => setCreateOpen(true)}>
          + Create Task
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        user?.isAdmin ? getAdminBoardContent() : (
          <Box display="flex" gap={0} flexGrow={1} minHeight={0}>
            {STATUSES.map(status => (
              <Box key={status.key} flex={1} minWidth={0} display="flex" flexDirection="column">
                <Paper sx={{ p: 0, flex: 1, bgcolor: 'grey.50', borderRadius: 0, minHeight: 0, display: 'flex', flexDirection: 'column', boxShadow: 'none', borderRight: status.key !== 'Done' ? '1px solid #eee' : 'none' }}>
                  <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
                    {status.label}
                  </Typography>
                  <Box px={2}>
                    {getSwimlaneContent(status.key)}
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        )
      )}
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateTask}
        users={user?.isAdmin ? users : undefined}
        currentUser={user as any}
      />
      {selectedTask && (
        <TaskModal
          open={modalOpen}
          onClose={handleModalClose}
          task={selectedTask}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          statuses={STATUSES}
          users={users}
          isAdmin={user?.isAdmin}
        />
      )}
    </Box>
  );
} 