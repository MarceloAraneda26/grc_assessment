import { Component } from 'react';

// Los error boundaries solo se pueden implementar como clase (no hay
// equivalente en hooks) — atrapan errores de renderizado que de otra forma
// dejan la app entera en pantalla blanca sin ningún mensaje.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error de renderizado no capturado:', error, info);
  }

  handleReset = () => {
    window.location.hash = '#/inicio';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
          <div className="max-w-md w-full bg-surface border border-border rounded-2xl shadow-[var(--shadow)] p-7 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h1 className="text-lg font-bold text-text mb-2">Algo salió mal</h1>
            <p className="text-sm text-text-secondary mb-5 leading-relaxed">
              Ocurrió un error inesperado en la aplicación. Las respuestas ya guardadas no se pierden — puedes volver al inicio y retomar la evaluación desde el Historial.
            </p>
            <button onClick={this.handleReset} className="btn btn-primary">
              ← Volver al inicio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
