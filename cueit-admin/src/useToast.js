import { useContext } from 'react';
import ToastContext from './ToastContext.js';

export default function useToast() {
  return useContext(ToastContext);
}
