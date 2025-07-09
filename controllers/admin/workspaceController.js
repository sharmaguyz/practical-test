const workspaceService = require('../../services/workspaceService');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
const WorkspacesModel = require('../../models/user_workspace');
const WorkspacesImageModel = require('../../models/user_workspace_image');

function getStatusMessage(state) {
    const messages = {
        'PENDING': 'Workspace is being provisioned',
        'AVAILABLE': 'Workspace is ready for use',
        'ERROR': 'Workspace creation failed',
        'STARTING': 'Workspace is starting',
        'STOPPING': 'Workspace is stopping',
        'STOPPED': 'Workspace is stopped',
    };

    return messages[state] || `Workspace is in ${state} state`;
}

exports.getWorkspaceStatus = async (req, res) => {
    try {
        const workspaceId = req.params.workspaceId;
        const workspaceDetail = await WorkspacesModel.findByWorkspaceId(workspaceId);
        const workspace = await workspaceService.getWorkspace(workspaceId);
        if (!workspace && workspaceDetail) {
            return sendError(res, { message: "Workspace not found" }, 404);
        }
        await WorkspacesModel.updateStateById(workspaceDetail.id, workspace.State);
        sendSuccess(res, {
            workspaceId: workspaceId,
            state: workspace.State,
        }, getStatusMessage(workspace.State), 200);

    } catch (error) {
        sendError(res, { message: error.message || 'Failed to get workspace status' }, 500);
    }
}

exports.getWorkspacePreviousImages = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const os = req.query.os;
        const images = await WorkspacesImageModel.findByUserIdAndOS(instructorId, os);
        sendSuccess(res, images, "Previous workspace images retrieved successfully", 200);
    } catch (error) {
        sendError(res, { message: error.message || 'Failed to get workspace status' }, 500);
    }
}

exports.getWorkspaceImageStatus = async (req, res) => {
    try {
        const imageId = req.params.imageId;
        const workspaceId = req.query.workspaceId;
        const workspaceDetail = await WorkspacesModel.findByWorkspaceId(workspaceId);
        if (!workspaceDetail) {
            return sendError(res, { message: "Workspace not found" }, 404);
        }
        const workspaceImage = await workspaceService.getWorkspaceImage(imageId);
        await WorkspacesModel.updateImageIdAndStateById(workspaceDetail.id, workspaceImage.ImageId, workspaceImage.State);
        sendSuccess(res, {
            imageId: workspaceImage.ImageId,
            state: workspaceImage.State,
        }, getStatusMessage(workspaceImage.State), 200);

    } catch (error) {
        sendError(res, { message: error.message || 'Failed to get workspace status' }, 500);
    }
}