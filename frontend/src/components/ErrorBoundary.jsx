import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    this.setState({ error, info })
    console.error('Uncaught React error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h1 style={{ color: '#c53030' }}>Something went wrong.</h1>
          <p style={{ color: '#4a5568' }}>An unexpected error occurred while rendering the app.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
            {this.state.error && this.state.error.toString()}
            {this.state.info && '\n\n' + this.state.info.componentStack}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
