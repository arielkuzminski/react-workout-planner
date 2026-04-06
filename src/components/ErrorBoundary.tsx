import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-danger-soft flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-danger" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Coś poszło nie tak</h1>
          <p className="text-sm text-text-secondary">
            Wystąpił nieoczekiwany błąd. Twoje dane treningowe są bezpieczne w pamięci przeglądarki.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 font-semibold text-text-inverted transition-colors hover:bg-brand-hover active:bg-brand-active"
          >
            <RotateCcw className="w-4 h-4" />
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }
}
