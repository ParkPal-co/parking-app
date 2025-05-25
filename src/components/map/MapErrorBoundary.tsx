import React from "react";
import { Alert } from "../ui/Alert";

interface MapErrorBoundaryProps {
  children: React.ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

export class MapErrorBoundary extends React.Component<
  MapErrorBoundaryProps,
  MapErrorBoundaryState
> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in map component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          variant="error"
          title="Map Error"
          message="There was an error loading the map. Please try refreshing the page."
        />
      );
    }

    return this.props.children;
  }
}
