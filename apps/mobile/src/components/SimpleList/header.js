import React from 'react';
import {View} from 'react-native';
import {useTracked} from '../../provider';
import {useMessageStore} from '../../provider/stores';
import {DDS} from '../../services/DeviceDetection';
import {COLORS_NOTE} from '../../utils/Colors';
import {hexToRGBA} from '../../utils/ColorUtils';
import {normalize, SIZE} from '../../utils/SizeUtils';
import {Button} from '../Button';
import {Placeholder} from '../ListPlaceholders';
import Heading from '../Typography/Heading';
import Paragraph from '../Typography/Paragraph';
import {Announcement} from './announcement';
import {Card} from './card';

export const Header = React.memo(
  ({
    type,
    messageCard = true,
    title,
    paragraph,
    color,
    onPress,
    shouldShow = false,
    icon,
    screen,
  }) => {
    const [state] = useTracked();
    const {colors} = state;
    const announcement = useMessageStore().announcement;

    return announcement ? (
      <Announcement color={color || colors.accent} />
    ) : type === 'search' ? null : DDS.isLargeTablet() && !shouldShow ? (
      <View
        style={{
          minHeight: 50,
          marginBottom: 5,
          padding: 0,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {messageCard && (
          <Card color={COLORS_NOTE[title.toLowerCase()] || colors.accent} />
        )}
      </View>
    ) : (
      <View
        style={{
          width: '100%',
        }}>
        {messageCard && (
          <Card color={COLORS_NOTE[title.toLowerCase()] || colors.accent} />
        )}
        <View
          style={{
            minHeight: 195,
            padding: 12,
            width: '100%',
            zIndex: 10,
            justifyContent: 'flex-end',
            backgroundColor: COLORS_NOTE[title.toLowerCase()]
              ? hexToRGBA(COLORS_NOTE[title.toLowerCase()], 0.15)
              : color || colors.shade,
          }}>
          <View
            style={{
              right: 0,
              paddingRight: 12,
              opacity: 0.5,
              bottom: 0,
              paddingHorizontal: 12,
              position: 'absolute',
            }}>
            <Placeholder
              color={COLORS_NOTE[title.toLowerCase()] || colors.accent}
              w={normalize(150)}
              h={normalize(150)}
              type={screen === 'Favorites' ? 'favorites' : type}
            />
          </View>

          <View
            style={{
              marginTop: 15,
            }}>
            <Heading
              style={{marginBottom: paragraph ? 0 : 0}}
              size={SIZE.xxxl * 1.2}>
              <Heading size={SIZE.xxxl * 1.2} color={colors.accent}>
                {title.slice(0, 1) === '#' ? '#' : null}
              </Heading>

              {title.slice(0, 1) === '#' ? title.slice(1) : title}
            </Heading>

            {paragraph ? (
              <Button
                height={20}
                title={paragraph}
                icon={icon}
                style={{
                  alignSelf: 'flex-start',
                  paddingLeft: 0,
                }}
                textStyle={{
                  fontWeight: 'normal',
                }}
                iconSize={SIZE.sm}
                fontSize={SIZE.sm}
                onPress={onPress}
              />
            ) : null}
          </View>
        </View>
      </View>
    );
  },
);
