const express = require('express');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

// Define Employee model
const Employee = sequelize.define('Employee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salary: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

// API Routes

// Initialize database with sample data
app.post('/api/init-db', async (req, res) => {
    try {
        // Drop and recreate tables
        await sequelize.sync({ force: true });
        
        // Sample data
        const sampleData = [
            { name: 'John Doe', department: 'IT', salary: 75000, age: 30, position: 'Developer' },
            { name: 'Jane Smith', department: 'HR', salary: 65000, age: 35, position: 'Manager' },
            { name: 'Bob Johnson', department: 'IT', salary: 85000, age: 40, position: 'Senior Developer' },
            { name: 'Alice Brown', department: 'Finance', salary: 90000, age: 45, position: 'Director' },
            { name: 'Charlie Wilson', department: 'IT', salary: 60000, age: 25, position: 'Junior Developer' },
            { name: 'Diana Miller', department: 'HR', salary: 55000, age: 28, position: 'Assistant' },
            { name: 'Edward Davis', department: 'Finance', salary: 95000, age: 50, position: 'CFO' },
            { name: 'Fiona Clark', department: 'IT', salary: 78000, age: 32, position: 'Team Lead' },
            { name: 'George White', department: 'Marketing', salary: 68000, age: 29, position: 'Specialist' },
            { name: 'Hannah Green', department: 'Marketing', salary: 72000, age: 31, position: 'Manager' }
        ];
        
        // Insert sample data
        await Employee.bulkCreate(sampleData);
        
        res.json({ success: true, message: 'Database initialized with sample data' });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Horizontal Fragmentation
app.post('/api/fragment/horizontal', async (req, res) => {
    try {
        const { condition } = req.body;
        
        if (!condition) {
            return res.status(400).json({ success: false, message: 'Condition is required' });
        }
        
        // Execute query with the condition
        const results = await Employee.findAll({
            where: sequelize.literal(condition)
        });
        
        res.json({
            success: true,
            fragmentType: 'Horizontal',
            condition,
            data: results || []
        });
    } catch (error) {
        console.error('Error in horizontal fragmentation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Vertical Fragmentation
app.post('/api/fragment/vertical', async (req, res) => {
    try {
        const { columns } = req.body;
        
        if (!columns || !Array.isArray(columns) || columns.length === 0) {
            return res.status(400).json({ success: false, message: 'Columns array is required' });
        }
        
        // Ensure 'id' is included for joining later
        const selectedColumns = columns.includes('id') ? columns : ['id', ...columns];
        
        // Execute query with selected columns
        const [results] = await sequelize.query(
            `SELECT ${selectedColumns.join(', ')} FROM Employees`,
            { type: sequelize.QueryTypes.SELECT }
        );
        
        res.json({
            success: true,
            fragmentType: 'Vertical',
            columns: selectedColumns,
            data: results || []
        });
    } catch (error) {
        console.error('Error in vertical fragmentation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Derived Fragmentation
app.post('/api/fragment/derived', async (req, res) => {
    try {
        const { parentCondition, childCondition } = req.body;
        
        if (!parentCondition || !childCondition) {
            return res.status(400).json({
                success: false,
                message: 'Both parent and child conditions are required'
            });
        }
        
        // Execute query with both conditions
        const [results] = await sequelize.query(
            `SELECT * FROM Employees WHERE ${parentCondition} AND ${childCondition}`,
            { type: sequelize.QueryTypes.SELECT }
        );
        
        res.json({
            success: true,
            fragmentType: 'Derived',
            parentCondition,
            childCondition,
            data: results || []
        });
    } catch (error) {
        console.error('Error in derived fragmentation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Reconstruction
app.post('/api/reconstruct', async (req, res) => {
    try {
        const { fragments, type } = req.body;
        
        if (!fragments || !Array.isArray(fragments) || fragments.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'At least two fragments are required for reconstruction'
            });
        }
        
        if (!type || !['union', 'join', 'intersection'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Valid reconstruction type (union, join, intersection) is required'
            });
        }
        
        let reconstructedData = [];
        
        // Perform reconstruction based on type
        switch (type) {
            case 'union':
                // Union operation (combine all rows, remove duplicates)
                reconstructedData = [...new Map(
                    fragments.flatMap(f => f.data)
                        .map(item => [item.id, item])
                ).values()];
                break;
                
            case 'join':
                // Join operation (combine fragments based on common columns)
                if (fragments[0].fragmentType === 'Vertical' && fragments[1].fragmentType === 'Vertical') {
                    // For vertical fragments, join on id
                    const fragment1 = fragments[0].data;
                    const fragment2 = fragments[1].data;
                    
                    reconstructedData = fragment1.map(row1 => {
                        const row2 = fragment2.find(r => r.id === row1.id);
                        return row2 ? { ...row1, ...row2 } : row1;
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Join operation is only supported for vertical fragments'
                    });
                }
                break;
                
            case 'intersection':
                // Intersection operation (only rows that exist in all fragments)
                const allIds = fragments.map(f => new Set(f.data.map(row => row.id)));
                const commonIds = [...allIds[0]].filter(id => 
                    allIds.every(idSet => idSet.has(id))
                );
                
                reconstructedData = commonIds.map(id => {
                    // Find this row in any fragment (preferably the first)
                    return fragments[0].data.find(row => row.id === id);
                }).filter(Boolean);
                break;
        }
        
        res.json({
            success: true,
            reconstructionType: type,
            data: reconstructedData
        });
    } catch (error) {
        console.error('Error in reconstruction:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});