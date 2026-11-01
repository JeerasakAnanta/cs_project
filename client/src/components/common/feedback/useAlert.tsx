import React, { useCallback, useState } from 'react';
import CustomAlert from './CustomAlert';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  type: AlertType;
  title: string;
  message?: string;
}

// แทน window.alert(): เรียก notify(...) แล้ว render {alertNode} ไว้ใน JSX
export const useAlert = () => {
  const [state, setState] = useState<AlertState | null>(null);

  const notify = useCallback(
    (type: AlertType, title: string, message?: string) =>
      setState({ type, title, message }),
    []
  );

  const alertNode: React.ReactNode = state && (
    <CustomAlert
      isOpen
      onClose={() => setState(null)}
      type={state.type}
      title={state.title}
      message={state.message}
    />
  );

  return { notify, alertNode };
};
