import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-rose-500/10 mb-4">
            <AlertTriangle size={32} className="text-rose-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-1">Something went wrong</h3>
          <p className="text-sm text-zinc-500 mb-4">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
