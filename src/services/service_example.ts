import logger from '../utility/logger';
import {getUserById as user_repo}  from '../repositories/repository_example';
export const getUserById = async () => {
    logger.info('REQUETST IS NOW IN SERVICES');
    user_repo();
};