import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ label, onClick, type = 'primary', disabled = false }) => {
  return (
    <button
      className={`button button--${type}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  disabled: PropTypes.bool,
};

export default Button;
