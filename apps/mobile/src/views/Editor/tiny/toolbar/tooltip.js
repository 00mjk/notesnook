import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { Easing, timing } from 'react-native-reanimated';
import { useTracked } from '../../../../provider';
import { DDS } from '../../../../services/DeviceDetection';
import {
  eSendEvent,
  eSubscribeEvent,
  eUnSubscribeEvent
} from '../../../../services/EventManager';
import { editing } from '../../../../utils';
import { normalize } from '../../../../utils/SizeUtils';
import { sleep } from '../../../../utils/TimeUtils';
import ColorGroup from './colorgroup';
import { execCommands } from './commands';
import { formatSelection, properties } from './constants';
import ToolbarItem from './item';
import ToolbarLinkInput from './linkinput';

let translateValue = new Animated.Value(400);
let animating = false;
function animate(val, time = 200) {
  if (animating) return;
  timing(translateValue, {
    toValue: val,
    duration: time,
    easing: Easing.in(Easing.ease),
  }).start(async () => {
    await sleep(time);
    animating = false;
  });
}

const Tooltip = () => {
  const [state] = useTracked();
  const {colors} = state;
  const [group, setGroup] = useState({
    data: [],
    title: null,
    default: null,
    type: null,
  });
  const floating = group?.type === 'table' || DDS.isTab;

  useEffect(() => {
    eSubscribeEvent('showTooltip', show);
    return () => {
      eUnSubscribeEvent('showTooltip', show);
    };
  }, []);

  const show = async (data) => {
    properties.userBlur = true;
    if (!data && editing.tooltip) {
      editing.tooltip = null;
      animate(70, 100);
      await sleep(100);
      setGroup(null);
      return;
    }
    if (!data) return;

    let time = editing.tooltip === 'table' || data.type === 'table' ? 400 : 100;

    if (data && editing.tooltip && editing.tooltip !== data.type) {
      let translate =
        editing.tooltip === 'table' || data.type === 'table' ? 400 : 70;
      animate(translate, time);
      await sleep(time);
    }
    editing.tooltip = data.title;
    setGroup(data);
    await sleep(5);
    animate(0, time);
    if (editing.tooltip !== "link") {
      properties.pauseSelectionChange = false;
    }
  };

  let style = React.useMemo(() => {
    return {
      borderRadius: 5,
      padding: floating ? 5 : 0,
      position: 'absolute',
      bottom: 50,
      width: group?.type === 'table' ? 35 * 5 + 15 : floating ? '50%' : '100%',
      minHeight: normalize(50) ,
      backgroundColor: colors.nav,
      alignSelf: 'center',
      flexDirection: 'row',
      borderWidth: floating ? 1 : 0,
      borderColor: floating && colors.nav,
      zIndex: 10,
      marginBottom: 0,
      paddingHorizontal: 6,
      transform: [
        {
          translateY: translateValue,
        },
      ],
    };
  }, [floating, colors.accent, colors.bg, group?.type]);

  let ParentElement = (props) => (
    <Animated.View style={style}>
      {group && /^(link|table|ul|align)$/.test(group.type) ? (
        <View
          style={{
            justifyContent: 'space-around',
            alignItems: 'center',
            flexDirection: 'row',
            width: '100%',
            backgroundColor: colors.bg,
            marginVertical: 5,
            borderRadius: 5,
          }}
          children={props.children}></View>
      ) : (
        <ScrollView
          style={{
            width: '100%',
            backgroundColor: colors.bg,
            marginVertical: 5,
            borderRadius: 5,
            paddingHorizontal: 0,
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            justifyContent: 'space-around',
            alignItems: 'center',
            flexDirection: 'row',
            minWidth: '100%',
          }}
          children={props.children}
        />
      )}
    </Animated.View>
  );

  return (
    <ParentElement>
      {group && !group.data && /^(link|video|)$/.test(group.type) && (
        <ToolbarLinkInput
          format={group.type}
          setVisible={() => {
            show();
          }}
          type={group.type}
          value={group.value}
        />
      )}

      {!group?.data && group?.type === 'table' && (
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          {[
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
          ].map((item, index) => (
            <TouchableOpacity
              key={item.toString()}
              onPress={() => {
                let columnCount = 5;
                let rowNumber = Math.floor(index / columnCount);
                let columnNumber = index - rowNumber * columnCount;
                formatSelection(
                  execCommands.table(rowNumber + 1, columnNumber + 1),
                );
                eSendEvent('showTooltip');
              }}
              style={{
                width: 25,
                height: 25,
                borderWidth: 1,
                borderColor: colors.icon,
                marginHorizontal: 5,
                marginVertical: 5,
              }}
            />
          ))}
        </View>
      )}

      {/^(hilitecolor|forecolor|)$/.test(group?.type) ? (
        <ColorGroup group={group} />
      ) : null}

      {group &&
        group.data &&
        /^(hilitecolor|forecolor|)$/.test(group.type) === false &&
        group.data.map((item) =>
          /^(video|link|)$/.test(group.type) ? (
            <ToolbarLinkInput
              key={item.formatValue || item.format}
              setVisible={() => {
                show();
              }}
              format={item.format}
              type={item.type}
              showTitle={true}
              premium={item.premium}
              groupFormat={group.title}
              groupDefault={group.default}
              formatValue={item.formatValue}
              fullname={item.fullname}
            />
          ) : (
            <ToolbarItem
              key={item.formatValue || item.format}
              format={item.format}
              formatValue={item.formatValue}
              type={item.type}
              showTitle={item.showTitle}
              premium={item.premium}
              groupFormat={group.title}
              groupDefault={group.default}
              text={item.text}
              fullname={item.fullname}
            />
          ),
        )}
    </ParentElement>
  );
};

export default Tooltip;
