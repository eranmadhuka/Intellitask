const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');
const Reminder = require('../models/Reminder');

// Middleware to verify JWT and admin role
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin only' });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// GET /api/analytics
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { timePeriod } = req.query; // e.g., '7d', '30d', '90d'
        const days = timePeriod ? parseInt(timePeriod.replace('d', '')) : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Total users
        const totalUsers = await User.countDocuments();

        // Total tasks and reminders
        const totalTasks = await Task.countDocuments({
            createdAt: { $gte: startDate }
        });
        const totalReminders = await Reminder.countDocuments({
            createdAt: { $gte: startDate }
        });

        // Average tasks and reminders per user
        const avgTasksPerUser = totalUsers ? totalTasks / totalUsers : 0;
        const avgRemindersPerUser = totalUsers ? totalReminders / totalUsers : 0;

        // Task completion rate
        const completedTasks = await Task.countDocuments({
            completed: true,
            createdAt: { $gte: startDate }
        });
        const taskCompletionRate = totalTasks ? completedTasks / totalTasks : 0;

        // Overdue tasks and reminders
        const now = new Date();
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: now },
            completed: false,
            createdAt: { $gte: startDate }
        });
        const overdueReminders = await Reminder.countDocuments({
            dueDate: { $lt: now },
            completed: false,
            createdAt: { $gte: startDate }
        });

        // Task status distribution
        const taskStatus = await Task.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ]);
        const taskStatusMap = { todo: 0, inProgress: 0, completed: 0 };
        taskStatus.forEach(({ status, count }) => {
            taskStatusMap[status] = count;
        });

        // Task priority distribution
        const taskPriority = await Task.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    priority: '$_id',
                    count: 1
                }
            }
        ]);
        const taskPriorityMap = { high: 0, medium: 0, low: 0 };
        taskPriority.forEach(({ priority, count }) => {
            taskPriorityMap[priority] = count;
        });

        // Reminder category distribution
        const reminderCategories = await Reminder.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    count: 1
                }
            },
            { $sort: { count: -1 } } // Sort by count descending
        ]);

        // Activity trend (tasks/reminders created per day)
        const activityTrend = await Promise.all([
            Task.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Reminder.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const dates = [];
        const tasks = [];
        const reminders = [];
        const dateSet = new Set([
            ...activityTrend[0].map(item => item._id),
            ...activityTrend[1].map(item => item._id)
        ]);
        Array.from(dateSet).sort().forEach(date => {
            dates.push(date);
            const taskItem = activityTrend[0].find(item => item._id === date);
            const reminderItem = activityTrend[1].find(item => item._id === date);
            tasks.push(taskItem ? taskItem.count : 0);
            reminders.push(reminderItem ? reminderItem.count : 0);
        });

        res.json({
            totalUsers,
            totalTasks,
            totalReminders,
            avgTasksPerUser: avgTasksPerUser.toFixed(2),
            avgRemindersPerUser: avgRemindersPerUser.toFixed(2),
            taskCompletionRate: taskCompletionRate.toFixed(2),
            overdueTasks,
            overdueReminders,
            taskStatus: taskStatusMap,
            taskPriority: taskPriorityMap,
            reminderCategories: reminderCategories.map(item => ({
                category: item.category || '',
                count: item.count
            })),
            activityTrend: { dates, tasks, reminders }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;