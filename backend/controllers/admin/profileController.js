const adminModel = require('../../models/admin');

exports.createAdmin = async (req, res) => {
    try {
        const { email, name, password, role } = req.body;
        const newAdmin = await adminModel.create({
            email,
            name,
            password,
            role: role || 'admin',
            status: 'active'
        });
        res.status(201).json({
            status: true,
            data: {
                id: newAdmin.adminId,
                email: newAdmin.email,
                name: newAdmin.name,
                role: newAdmin.role,
                status: newAdmin.status
            }
        });
    } catch (error) {
        let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
        console.error('Error creating admin:', error);
        res.status(500).json({
            status: false,
            message: errorMessage
        });
    }
};
exports.getProfile = async (req, res) => {
    try {
        const adminId = req.admin.adminId;
        const admin = await adminModel.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                status: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            status: true,
            data: {
                id: admin.adminId,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                createdAt: admin.createdAt,
                status: admin.status
            }
        });
    } catch (error) {
        let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
        res.status(500).json({
            status: false,
            message: errorMessage
        });
    }
};