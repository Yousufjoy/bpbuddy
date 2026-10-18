import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/use-responsive';

/**
 * Drop-in replacement for `SafeAreaView` on every screen.
 *
 * The outer safe-area view keeps the screen background edge-to-edge, while the
 * inner column is capped + centred on tablets / desktop / web so headers,
 * lists and forms never stretch across a huge viewport.
 */
export function ScreenContainer({ children, style, ...rest }: SafeAreaViewProps) {
  const { contentMaxWidth } = useResponsive();
  return (
    <SafeAreaView style={style} {...rest}>
      <View style={[styles.column, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});

export default ScreenContainer;
