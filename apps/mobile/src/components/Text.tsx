import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text as RNText, TextProps, TextStyle } from "react-native";
import { colors } from "../theme/colors";

type Props = PropsWithChildren<TextProps & { style?: StyleProp<TextStyle> }>;

export function AppText({ children, style, ...props }: Props) {
  return (
    <RNText {...props} style={[styles.base, style]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text
  }
});
