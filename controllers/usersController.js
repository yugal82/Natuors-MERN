const sharp = require('sharp');
const multer = require('multer');
const Users = require('../models/userModel');
const AppError = require('../utils/error');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user._id}-${Date.now()}.${extension}`)
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image. Please upload an image', 400), false);
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadMiddleware = upload.single('photo');

const getUsers = async (req, res, next) => {
    try {
        const users = await Users.find();
        res.status(200).json({
            status: 'Success',
            results: users.length,
            data: {
                users
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: 'Bad request'
        })
    }
}

const getUser = async (req, res, next) => {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) {
            next(new AppError('No user found. Please put in the correct ID', 404));
        }

        res.status(200).json({
            status: 'Success',
            data: {
                user
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const postUser = (req, res) => {
    res.status(500).json({
        status: 'Fail',
        message: 'This route is not for signup. Please use /signup instead.'
    });
}

const updateMe = async (req, res, next) => {
    try {
        // 1. Create error if user posts password in request
        if (req.body.password || req.body.confirmPassword) {
            return next(new AppError('This route is not for password change.', 400))
        }
        if (req.body.role) {
            return next(new AppError('You cannot change the role.', 400));
        }

        // 2. Update user document
        const bodyObject = {
            name: req.body.name,
            email: req.body.email
        }
        if (req.file) {
            bodyObject.photo = req.file.filename
        }
        const updatedUser = await Users.findByIdAndUpdate(req.user._id, bodyObject, { new: true, runValidators: true });

        res.status(200).json({
            status: 'Success',
            message: 'Data updated successfully',
            data: {
                user: updatedUser
            }
        })
    } catch (error) {
        res.status().json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const resizeUserPhoto = async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);

    next();
}

const deleteMe = async (req, res, next) => {
    try {
        await Users.findByIdAndUpdate(req.user._id, { active: false });

        res.status(204).json({
            status: 'Success',
            message: 'The account has been deleted. If you want to not delete your account, log back in'
        })
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const getMe = (req, res, next) => {
    try {
        req.params.id = req.user.id;
        next();
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

module.exports = { getUsers, postUser, updateMe, deleteMe, getMe, getUser, uploadMiddleware, resizeUserPhoto };
