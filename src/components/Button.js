import PropTypes from 'prop-types';
import './Button.css';
import { colors, fonts, spacing } from '../../design/theme';

const typeToColor = {
  primary: colors.primary,
  secondary: colors.secondary,
  danger: colors.red,
};

const Button = ({ label, onClick, type = 'primary', disabled = false }) => {
  // Set CSS variables for theme tokens
  const style = {
    '--btn-bg': typeToColor[type] || colors.primary,
    '--btn-color': colors.base,
    '--btn-font': fonts.sans.join(', '),
    '--btn-padding': `${spacing.sm} ${spacing.md}`,
    '--btn-radius': spacing.xs,
  };
  return (
    <button
      className={`button button--${type}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
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
