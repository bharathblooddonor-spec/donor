import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * Catches render-time crashes so a bug in one screen shows a recoverable error
 * instead of a white screen. Without this, any uncaught render error takes down
 * the whole app — which in an emergency blood app means someone loses access to
 * a phone number when they most need it.
 *
 * Error boundaries only catch errors during render, in lifecycle methods, and
 * in constructors below them. Async rejections and event-handler throws still
 * need their own try/catch.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // No crash reporter is wired up yet. When you add one (Sentry, Crashlytics),
    // report it here — see DEPLOYMENT.md.
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <Feather name="alert-triangle" size={40} color="#D32F2F" />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          This screen ran into an unexpected problem. You can try again, or use another tab.
        </Text>

        {__DEV__ && <Text style={styles.devDetail}>{String(error?.message || error)}</Text>}

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={this.handleReset}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Try loading this screen again"
        >
          <Feather name="refresh-cw" size={15} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>

        <View style={styles.emergencyBox}>
          <Text style={styles.emergencyText}>
            In a medical emergency, call <Text style={styles.emergencyNumber}>108</Text> directly.
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 14,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  devDetail: {
    fontSize: 11,
    color: '#991b1b',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    fontFamily: 'monospace',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 20,
    height: 42,
    borderRadius: 8,
    marginTop: 20,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emergencyBox: {
    marginTop: 24,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emergencyText: {
    fontSize: 11,
    color: '#991b1b',
    textAlign: 'center',
  },
  emergencyNumber: {
    fontWeight: '800',
  },
});
