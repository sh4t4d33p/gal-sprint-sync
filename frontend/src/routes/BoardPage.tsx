import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Avatar, CircularProgress, Alert } from '@mui/material';
import { useUser } from '../UserContext';
import { getTasks, getAllUsers, createTask, deleteTask, updateTask, patchTaskProgress } from '../utils/api';
import TaskCard from '../components/TaskCard/TaskCard';
import CreateTaskModal from '../components/TaskCard/CreateTaskModal';
import TaskModal from '../components/TaskCard/TaskModal';
import Divider from '@mui/material/Divider';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

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

  // Handle drag end for both admin and normal user
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    // Only handle status change (column change)
    if (source.droppableId === destination.droppableId) return;
    // Find the task
    const taskId = Number(draggableId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    // For admin, only allow moving within the same user row
    if (user?.isAdmin && source.droppableId.split('-')[0] !== destination.droppableId.split('-')[0]) return;
    // For normal user, only allow moving own tasks
    if (!user?.isAdmin && task.userId !== user?.userId) return;
    // Update status
    const newStatus = destination.droppableId.split('-')[1];
    if (task.status === newStatus) return;
    await patchTaskProgress(taskId, { status: newStatus });
    await refreshTasks();
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
        <DragDropContext onDragEnd={handleDragEnd}>
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
                      <Droppable key={status.key} droppableId={`${uid}-${status.key}`} direction="vertical">
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            flex={1}
                            minWidth={0}
                            display="flex"
                            flexDirection="column"
                            sx={{ minHeight: 80, bgcolor: snapshot.isDraggingOver ? 'primary.light' : 'grey.50', borderRadius: 0, boxShadow: 'none', borderRight: status.key !== 'Done' ? '1px solid #eee' : 'none', p: 0 }}
                          >
                            {userTasks.map((task, idx2) => (
                              <Draggable key={task.id} draggableId={String(task.id)} index={idx2}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.7 : 1,
                                    }}
                                  >
                                    <TaskCard
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
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    );
                  })}
                </Box>
                {idx < sortedUsers.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            );
          })}
        </DragDropContext>
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
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box display="flex" gap={0} flexGrow={1} minHeight={0}>
              {STATUSES.map(status => (
                <Droppable key={status.key} droppableId={`user-${status.key}`} direction="vertical">
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      flex={1}
                      minWidth={0}
                      display="flex"
                      flexDirection="column"
                      sx={{ bgcolor: snapshot.isDraggingOver ? 'primary.light' : 'grey.50', borderRadius: 0, minHeight: 0, boxShadow: 'none', borderRight: status.key !== 'Done' ? '1px solid #eee' : 'none' }}
                    >
                      <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
                        {status.label}
                      </Typography>
                      <Box px={2}>
                        {tasks.filter(t => t.status === status.key).map((task, idx2) => (
                          <Draggable key={task.id} draggableId={String(task.id)} index={idx2}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.7 : 1,
                                }}
                              >
                                <TaskCard
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
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    </Box>
                  )}
                </Droppable>
              ))}
            </Box>
          </DragDropContext>
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