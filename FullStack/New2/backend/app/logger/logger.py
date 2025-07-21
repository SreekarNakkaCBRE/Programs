# app/logger/logger.py
import logging


def configure_logging(level=logging.INFO):
    logging.basicConfig(level=level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


class Logger:
    @staticmethod
    def get_logger(class_name):
        logger = logging.getLogger(class_name)
        return logger


# Configure logger at the start of your application
configure_logging(logging.INFO)  # Set to INFO to capture INFO and ERROR logs

# Default logger instance for the module
logger = Logger.get_logger(__name__)