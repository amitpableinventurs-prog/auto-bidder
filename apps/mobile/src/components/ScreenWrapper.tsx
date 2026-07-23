import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TAB_BAR_HEIGHT } from '../theme';
import MainHeader from './MainHeader';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withHeader?: boolean;
  withTabBar?: boolean;
  navigation?: any;
  options?: any;
  route?: any;
  scrollable?: boolean;
  backgroundColor?: string;
  headerTransparent?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  contentContainerStyle,
  withHeader = false,
  withTabBar = false,
  navigation,
  options,
  route,
  scrollable = false,
  backgroundColor = COLORS.white,
  headerTransparent = false,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const Container = scrollable ? ScrollView : View;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        paddingTop: !withHeader && !headerTransparent ? insets.top : 0,
        paddingBottom: !withTabBar ? insets.bottom : 0,
      }
    ]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {withHeader && (
        <MainHeader
          navigation={navigation}
          options={options}
          route={route}
        />
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Container
          style={[styles.flex, style]}
          contentContainerStyle={[
            scrollable && styles.scrollContent,
            scrollable && { paddingBottom: (withTabBar ? TAB_BAR_HEIGHT : 0) + insets.bottom + 20 },
            isLargeScreen && styles.centeredContent,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={scrollable}
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centeredContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
});

export default ScreenWrapper;
