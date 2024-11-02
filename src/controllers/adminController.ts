import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../utility';


// View all registered users
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users: string[] = ['ali', 'ahmed'];

    return res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

// Ban or deactivate a specific user by user ID
export const banUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId: string } = req.params;

    // Simulated user retrieval
    const user = { name: 'ahmed', isActive: true };

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    user.isActive = false;
    console.log(user);

    return res.status(200).json({
        status: 'success',
        message: 'User has been banned or deactivated.',
    });
});
