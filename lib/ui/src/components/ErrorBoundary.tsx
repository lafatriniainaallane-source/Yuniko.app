import React from 'react';

type Props = { children?: React.ReactNode };

export class ErrorBoundary extends React.Component<Props, { error: Error | null }> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(err: Error, info: unknown) {
    // TODO: wire to central logging provider in later phases
    // console.error(err, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20 }}>
          <h3>Something went wrong</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}
