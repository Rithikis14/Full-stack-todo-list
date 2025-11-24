import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, Plus, Trash2, Edit2, Search, CheckCircle, Circle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 1. Fetch Tasks
  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Handle Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error('Title is required');

    try {
      if (editId) {
        // Update Logic
        const { data } = await API.put(`/tasks/${editId}`, { title, description });
        setTasks(tasks.map(t => (t._id === editId ? data : t)));
        toast.success('Task Updated!');
        setEditId(null);
      } else {
        // Create Logic
        const { data } = await API.post('/tasks', { title, description });
        setTasks([...tasks, data]);
        toast.success('Task Added!');
      }
      setTitle('');
      setDescription('');
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task Deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // 4. Handle Status Toggle
  const toggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const { data } = await API.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => (t._id === task._id ? data : t)));
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Task Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome, {user?.name}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 sticky top-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {editId ? <Edit2 size={20} className="text-yellow-400"/> : <Plus size={20} className="text-green-400"/>} 
              {editId ? 'Edit Task' : 'Add New Task'}
            </h2>
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            />
            <textarea
              placeholder="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none h-24"
            ></textarea>
            <button type="submit" className={`w-full py-3 rounded font-bold transition ${editId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {editId ? 'Update Task' : 'Create Task'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setTitle(''); setDescription(''); }} className="w-full mt-2 text-gray-400 hover:text-white">
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Right Col: Task List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="w-full pl-10 p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* List */}
          {loading ? <p>Loading...</p> : filteredTasks.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No tasks found.</div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className={`p-4 rounded-lg flex justify-between items-start border transition ${task.status === 'completed' ? 'bg-gray-800 border-green-900 opacity-75' : 'bg-gray-800 border-gray-700'}`}>
                <div className="flex gap-4">
                  <button onClick={() => toggleStatus(task)} className="mt-1 text-gray-400 hover:text-green-500 transition">
                    {task.status === 'completed' ? <CheckCircle className="text-green-500" /> : <Circle />}
                  </button>
                  <div>
                    <h3 className={`font-bold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                    <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${task.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditId(task._id); setTitle(task.title); setDescription(task.description); }} className="p-2 text-gray-400 hover:text-blue-400 transition">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(task._id)} className="p-2 text-gray-400 hover:text-red-500 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;