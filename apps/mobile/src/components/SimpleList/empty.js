import React from 'react';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTracked } from '../../provider';
import { COLORS_NOTE } from '../../utils/Colors';
import { SIZE } from '../../utils/SizeUtils';
import { Button } from '../Button';
import Seperator from '../Seperator';
import Heading from '../Typography/Heading';
import Paragraph from '../Typography/Paragraph';


export const Empty = ({
  loading = true,
  placeholderData,
  absolute,
  headerProps,
}) => {
  const [state] = useTracked();
  const {colors} = state;
  const insets = useSafeAreaInsets();
  const {height} = useWindowDimensions();

  return (
    <View
      style={[
        {
          backgroundColor: colors.bg,
          position: absolute ? 'absolute' : 'relative',
          zIndex: absolute ? 10 : null,
          height: height - 250 - insets.top,
          width: '100%',
        },
      ]}>
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Heading>{placeholderData.heading}</Heading>
        <Paragraph
          textBreakStrategy="balanced"
          style={{
            textAlign: 'center',
            width: '80%',
          }}
          color={colors.icon}>
          {loading ? placeholderData.loading : placeholderData.paragraph}
        </Paragraph>
        <Seperator />
        {placeholderData.button && !loading ? (
          <Button
            onPress={placeholderData.action}
            title={placeholderData.button}
            icon="plus"
            type="accent"
            fontSize={SIZE.md}
            accentColor="bg"
            accentText={
              COLORS_NOTE[headerProps?.heading?.toLowerCase()]
                ? headerProps.heading?.toLowerCase()
                : 'accent'
            }
          />
        ) : loading ? (
          <ActivityIndicator
            color={
              COLORS_NOTE[headerProps?.heading?.toLowerCase()]
                ? COLORS_NOTE[headerProps?.heading?.toLowerCase()]
                : colors.accent
            }
          />
        ) : null}
      </View>
    </View>
  );
};
