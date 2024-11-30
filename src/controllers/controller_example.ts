import logger from '../utility/logger';
import { getUserById as user_service } from '../services/service_example';
export const getUserById = async () => {
  logger.info('REQUETST IS NOW IN CONTROLLER');
  user_service();
};
