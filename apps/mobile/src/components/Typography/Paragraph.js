import React from 'react';
import { Text } from 'react-native';
import { useTracked } from '../../provider';
import { SIZE } from '../../utils/SizeUtils';

/**
 *
 * @typedef {import('react-native').TextProps} TextType
 * @typedef {Object} restTypes
 * @property {string} color color
 * @property {number} size color
 */
/**
 *
 * @param {TextType | restTypes} props all props
 */
const Paragraph = ({color, size = SIZE.sm, style, ...restProps}) => {
  const [state] = useTracked();
  const {colors} = state;

  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1}
      {...restProps}
      style={[
        {
          fontSize: size || SIZE.sm,
          color: color || colors.pri,
          fontWeight: '400',
        },
        style,
      ]}></Text>
  );
};

export default Paragraph;
