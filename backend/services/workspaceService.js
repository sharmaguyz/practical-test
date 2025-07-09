const { WorkSpacesClient, CreateWorkspacesCommand, DescribeWorkspacesCommand, TerminateWorkspacesCommand, CreateWorkspaceImageCommand, DescribeWorkspaceImagesCommand } = require('@aws-sdk/client-workspaces');
const { DirectoryServiceDataClient, CreateUserCommand } = require('@aws-sdk/client-directory-service-data');
const { DirectoryServiceClient, EnableDirectoryDataAccessCommand, ResetUserPasswordCommand } = require('@aws-sdk/client-directory-service');
const awsConfig = require('../config/aws');
const DIRECTORY_ID = process.env.WORKSPACE_DIRECTORY_ID;

class WorkspaceService {
    constructor() {
        const config = {
            region: awsConfig.dynamoDB.region,
            credentials: {
                accessKeyId: awsConfig.dynamoDB.accessKeyId,
                secretAccessKey: awsConfig.dynamoDB.secretAccessKey
            }
        };

        this.client = new WorkSpacesClient(config);
        this.dataClient = new DirectoryServiceDataClient({ region: awsConfig.dynamoDB.region });
        this.dsClient = new DirectoryServiceClient({ region: awsConfig.dynamoDB.region });
    }

    /**
     * Clone a workspace by creating a new one with similar configuration
     * @param {string} sourceWorkspaceId - ID of the workspace to clone
     * @param {string} userName - New user name for the cloned workspace
     * @param {object} additionalParams - Additional parameters for workspace creation
     * @returns {Promise<object>} - The created workspace information
     */
    async cloneWorkspace(sourceWorkspaceId, userName, additionalParams = {}) {
        try {
            const describeCommand = new DescribeWorkspacesCommand({
                WorkspaceIds: [sourceWorkspaceId]
            });

            const { Workspaces } = await this.client.send(describeCommand);

            if (!Workspaces || Workspaces.length === 0) {
                throw new Error('Source workspace not found');
            }

            const sourceWorkspace = Workspaces[0];
            const createParams = {
                Workspaces: [{
                    DirectoryId: DIRECTORY_ID,
                    UserName: userName,
                    BundleId: sourceWorkspace.BundleId,
                    VolumeEncryptionKey: sourceWorkspace.VolumeEncryptionKey,
                    UserVolumeEncryptionEnabled: sourceWorkspace.UserVolumeEncryptionEnabled,
                    RootVolumeEncryptionEnabled: sourceWorkspace.RootVolumeEncryptionEnabled,
                    WorkspaceProperties: sourceWorkspace.WorkspaceProperties,
                    Tags: sourceWorkspace.Tags,
                    ...additionalParams
                }]
            };

            const createCommand = new CreateWorkspacesCommand(createParams);
            const result = await this.client.send(createCommand);

            if (result.FailedRequests && result.FailedRequests.length > 0) {
                throw new Error(`Failed to create workspace: ${result.FailedRequests[0].ErrorMessage}`);
            }

            return result.PendingRequests[0];
        } catch (error) {
            console.error('Error cloning workspace:', error);
            throw error;
        }
    }

    /**
     * Get workspace details
     * @param {string} workspaceId 
     * @returns {Promise<object>} - Workspace information
     */
    async getWorkspace(workspaceId) {
        try {
            const command = new DescribeWorkspacesCommand({
                WorkspaceIds: [workspaceId]
            });
            const response = await this.client.send(command);
            return response.Workspaces ? response.Workspaces[0] : null;
        } catch (error) {
            console.error('Error getting workspace:', error);
            throw error;
        }
    }

    /**
 * Check workspace status until it's available or fails
 * @param {string} workspaceId 
 * @param {number} [interval=5000] - Check interval in ms
 * @param {number} [timeout=300000] - Timeout in ms (5 minutes default)
 * @returns {Promise<object>} - Final workspace state
 */
    async trackWorkspaceCreation(workspaceId, interval = 5000, timeout = 300000) {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkStatus = async () => {
                try {
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('Workspace creation tracking timed out'));
                        return;
                    }

                    const workspace = await this.getWorkspace(workspaceId);

                    if (!workspace) {
                        reject(new Error('Workspace not found'));
                        return;
                    }

                    switch (workspace.State) {
                        case 'AVAILABLE':
                            resolve(workspace);
                            return;
                        case 'ERROR':
                        case 'TERMINATED':
                        case 'UNHEALTHY':
                            reject(new Error(`Workspace creation failed with state: ${workspace.State}`));
                            return;
                        default:
                            setTimeout(checkStatus, interval);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            checkStatus();
        });
    }

    async verifyUserExists(userName, fullName, password) {
        try {
            const [firstName, lastName] = fullName.split(' ');
            // await this.enableDirectoryDataAccess();
            const samCommand = new CreateUserCommand({
                DirectoryId: DIRECTORY_ID,
                SAMAccountName: userName,
                GivenName: firstName,
                Surname: lastName,
            });

            const samResponse = await this.dataClient.send(samCommand);
            if (samResponse.$metadata.httpStatusCode === 200) {
                await this.resetUserPassword(userName, password);
            }
            return samResponse;
        } catch (error) {
            console.log('Error verifying user:', error);
            throw new Error(`Failed to verify user existence: ${error}`);
        }
    }

    async enableDirectoryDataAccess() {
        try {
            const command = new EnableDirectoryDataAccessCommand({
                DirectoryId: DIRECTORY_ID
            });
            await this.dsClient.send(command);
            return true;
        } catch (error) {
            if (error.name === 'AccessDeniedException') {
                console.error('Access denied. Check IAM permissions for ds:EnableDirectoryDataAccess.');
                throw new Error('Access denied');
            } else if (error.name === 'ValidationException' && error.message.includes('already enabled')) {
                console.log(`Directory Data Access already enabled for directory ${DIRECTORY_ID}`);
                return true;
            } else {
                console.error(`Error enabling Directory Data Access: ${error.message}`);
                throw error;
            }
        }
    }

    async resetUserPassword(userName, password = '') {
        try {
            const command = new ResetUserPasswordCommand({
                UserName: userName,
                DirectoryId: DIRECTORY_ID,
                NewPassword: password === '' ? this.generateTempPassword() : password,
            });
            await this.dsClient.send(command);
            return true;
        } catch (error) {
            console.error(`Error resetting password for user ${userName}:`, error);
            throw error;
        }
    }

    async terminateWorkspaces(workspaceIds) {
        try {
            const input = {
                TerminateWorkspaceRequests: [],
            };

            workspaceIds.forEach(id => {
                input.TerminateWorkspaceRequests.push({ WorkspaceId: id });
            });
            const command = new TerminateWorkspacesCommand(input);
            await this.client.send(command);
            return true;
        } catch (error) {
            console.error('Error terminating workspaces:', error);
            throw error;
        }
    }

    generateTempPassword() {
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    async createWorkspaceImage(workspaceId, imageName, description) {
        try {
            const command = new CreateWorkspaceImageCommand({
                WorkspaceId: workspaceId,
                Name: imageName,
                Description: description,
            });
            const response = await this.client.send(command);
            return [response.ImageId, response.State];
        } catch (error) {
            console.error('Error terminating workspaces:', error);
            throw error;
        }
    }

    async getWorkspaceImage(ImageId) {
        try {
            const command = new DescribeWorkspaceImagesCommand({
                ImageIds: [ImageId]
            });
            const response = await this.client.send(command);
            return response.Images ? response.Images[0] : null;
        } catch (error) {
            console.error('Error getting workspace:', error);
            throw error;
        }
    }

}

module.exports = new WorkspaceService();