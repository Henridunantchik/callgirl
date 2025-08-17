import express from 'express'
import { 
  deleteUser, 
  getAllUser, 
  getUser, 
  updateUser,
  updateOnlineStatus,
  getOnlineStatus,
  markOffline
} from '../controllers/User.controller.js'
import upload from '../config/multer.js'
import { authenticate } from '../middleware/authenticate.js'

const UserRoute = express.Router()

UserRoute.use(authenticate)

UserRoute.get('/get-user/:userid', getUser)
UserRoute.put('/update', upload.single('file'), updateUser)
UserRoute.get('/get-all-user', getAllUser)
UserRoute.delete('/delete/:id', deleteUser)

// Online status routes
UserRoute.put('/online-status', updateOnlineStatus)
UserRoute.get('/online-status/:userId', getOnlineStatus)
UserRoute.put('/offline', markOffline)

export default UserRoute