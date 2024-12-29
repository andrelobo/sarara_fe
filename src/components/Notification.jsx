// eslint-disable-next-line no-unused-vars
import React from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle } from 'react-icons/fa';

const Notification = ({ message }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-error text-text p-4 rounded-md shadow-lg flex items-center space-x-2 animate-bounce">
      <FaExclamationTriangle />
      <span>{message}</span>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
};

export default Notification;

