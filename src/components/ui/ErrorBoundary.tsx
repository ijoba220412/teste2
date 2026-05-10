import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ERRO CAPTURADO PELO ERROR BOUNDARY:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-red-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            
            <h1 className="text-2xl font-black text-red-800 uppercase mb-4">
              Oops! Algo deu errado
            </h1>
            
            <p className="text-red-600 mb-6 uppercase font-bold text-sm">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 bg-red-50 p-4 rounded-xl">
                <summary className="font-bold text-red-700 cursor-pointer uppercase text-xs mb-2">
                  Detalhes do erro (clique para expandir)
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap break-all">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              className="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold uppercase hover:bg-red-700 transition-colors shadow-lg"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
