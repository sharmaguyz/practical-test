const AdminModel = require('../../models/admin');
// const CurrenltyEnrolledDegree = require('../../models/currently_enrolled_degree');
const TokenBlacklistModel = require('../../models/token_blacklist');
const UserRolesModel = require('../../models/user_roles');
const UserModel = require('../../models/users');
const UserMetaDataModel = require('../../models/users_meta_data');
const InstructorMetaDataModel = require('../../models/instructor_meta_data');
const CourseModel = require('../../models/course');
const UserWorkspaceModel = require('../../models/user_workspace');
const UserWorkspaceImageModel = require('../../models/user_workspace_image');
const CartModel = require('../../models/cart');
const BillingAddressModel = require('../../models/billing_address');
const OrderModel = require('../../models/order');
const OrderItemModel = require('../../models/order_item');
const SettingModel = require('../../models/payment_setting')
class Migration {
    constructor() {
        this.adminmodel = new AdminModel();
        this.TokenBlacklistModel = new TokenBlacklistModel();
        this.UserRolesModel = new UserRolesModel();
        this.UserModel = new UserModel();
        this.UserMetaDataModel = new UserMetaDataModel();
        this.InstructorMetaDataModel = new InstructorMetaDataModel();
        this.CourseModel = new CourseModel();
        this.UserWorkspaceModel = new UserWorkspaceModel();
        this.UserWorkspaceImageModel = new UserWorkspaceImageModel();
        this.CartModel = new CartModel();
        this.BillingAddressModel = new BillingAddressModel();
        this.OrderModel = new OrderModel();
        this.OrderItemModel = new OrderItemModel();
        this.SettingModel = new SettingModel();
        // this.CurrenltyEnrolledDegree = new CurrenltyEnrolledDegree();
    }
    createTables = async (req, res) => {
        try {
            await this.adminmodel.checkAndCreateTable();
            await this.TokenBlacklistModel.checkAndCreateTable();
            await this.UserRolesModel.checkAndCreateTable();
            await this.UserModel.checkAndCreateTable();
            await this.UserMetaDataModel.checkAndCreateTable();
            await this.InstructorMetaDataModel.checkAndCreateTable();
            await this.CourseModel.checkAndCreateTable();
            await this.UserWorkspaceModel.checkAndCreateTable();
            await this.CartModel.checkAndCreateTable();
            await this.BillingAddressModel.checkAndCreateTable();
            await this.OrderModel.checkAndCreateTable();
            await this.OrderItemModel.checkAndCreateTable();
            await this.OrderItemModel.UserWorkspaceImageModel();
            await this.SettingModel.checkAndCreateTable();
            return res.json({ message: '✅ Tables checked/created successfully' });
        } catch (error) {
            console.error('❌ Migration error:', error);
            return res.status(500).json({ error: 'Migration failed', details: error.message });
        }
    };
}
module.exports = new Migration();