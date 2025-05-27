import { JsStack } from "@/components/JsStack";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Animated } from "react-native"; // <-- Required for Animated.add

const ANIMATION_DURATION = 550;

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <JsStack
          screenOptions={{
            cardOverlayEnabled: true,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, next, layouts }) => {
              const INITIAL_TRANSLATE_X_MULTIPLIER = 1.6;
              const NEXT_TRANSLATE_X_MULTIPLIER = -0.3;

              // Translate current screen
              const currentTranslateX = current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  INITIAL_TRANSLATE_X_MULTIPLIER * layouts.screen.width,
                  0,
                ],
                extrapolate: "clamp",
              });

              // Translate next screen (if exists)
              const nextTranslateX = next
                ? next.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      0,
                      NEXT_TRANSLATE_X_MULTIPLIER * layouts.screen.width,
                    ],
                    extrapolate: "clamp",
                  })
                : new Animated.Value(0); // ensure it's an Animated.Value

              // Combine into single translateX value
              const combinedTranslateX = next
                ? Animated.add(currentTranslateX, nextTranslateX)
                : currentTranslateX;

              return {
                cardStyle: {
                  transform: [{ translateX: combinedTranslateX }],
                },
              };
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="index"
            options={{ title: "Home", headerShown: false }}
          />
        </JsStack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
