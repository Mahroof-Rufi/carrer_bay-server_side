import express, { Router } from "express";
import userAuth from "../../middlewares/userAuth";
import { chatController } from "../../providers/controllers";
import employerAuth from "../../middlewares/employerAuth";

const router = express.Router()

router.route('/user/add-connection').post( userAuth, (req, res) => chatController.addUserConnection(req, res))
router.route('/user/get-connections').get( userAuth, (req, res) => chatController.getConnectedUsers(req, res))
router.route('/user/get-messages/:receiver_id').get( userAuth, (req, res) => chatController.getUserMessagesByReceiverId(req, res))
router.route('/user/save-message').post( userAuth, (req, res) => chatController.saveMessageByUser(req, res))


router.route('/employer/add-connection').post( employerAuth, (req, res) => chatController.addEmployerConnection(req, res))
router.route('/employer/get-connections').get( employerAuth, (req, res) => chatController.getEmployerConnections(req, res))
router.route('/employer/get-user').get( employerAuth, (req, res) => chatController.getUserById(req, res))
router.route('/employer/get-messages/:receiver_id').get( employerAuth, (req, res) => chatController.getEmployerMessagesByReceiverId(req, res))
router.route('/employer/save-message').post( employerAuth, (req, res) => chatController.saveMessageByEmployer(req, res))
router.route('/employer/schedule-interview')
    .post( employerAuth, (req, res) => chatController.scheduleInterview(req, res))
    .patch( employerAuth, (req, res) => chatController.cancelScheduleInterview(req, res))

export default router