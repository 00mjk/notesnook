import React, {useRef} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {notesnook} from '../../../e2e/test.ids';
import {useTracked} from '../../provider';
import {useSettingStore, useUserStore} from '../../provider/stores';
import {DDS} from '../../services/DeviceDetection';
import Navigation from '../../services/Navigation';
import {SIZE} from '../../utils/SizeUtils';
import {ActionIcon} from '../ActionIcon';
import {Button} from '../Button';
import Menu, {MenuItem} from 'react-native-reanimated-material-menu';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const HeaderRightMenu = ({currentScreen, action, rightButtons}) => {
  const [state] = useTracked();
  const {colors} = state;
  const syncing = useUserStore(state => state.syncing);
  const deviceMode = useSettingStore(state => state.deviceMode);
  const menuRef = useRef();
  return (
    <View style={styles.rightBtnContainer}>
      {syncing && <ActivityIndicator size={SIZE.xl} color={colors.accent} />}
      {currentScreen !== 'Settings' && (
        <ActionIcon
          onPress={async () => {
            Navigation.navigate('Search', {
              menu: false,
            });
          }}
          testID={notesnook.ids.default.header.buttons.left}
          name="magnify"
          color={colors.pri}
          customStyle={styles.rightBtn}
        />
      )}

      {deviceMode !== 'mobile' ? (
        <Button
          onPress={action}
          testID={notesnook.ids.default.addBtn}
          icon={currentScreen === 'Trash' ? 'delete' : 'plus'}
          iconSize={SIZE.xl}
          type="shade"
          style={{
            marginLeft: 20,
            width: 50,
            height: 35,
          }}
        />
      ) : null}

      {rightButtons && (
        <Menu
          ref={menuRef}
          animationDuration={200}
          style={{
            borderRadius: 5,
            backgroundColor: colors.bg,
          }}
          button={
            <ActionIcon
              onPress={() => {
                menuRef.current?.show();
              }}
              testID={notesnook.ids.default.header.buttons.left}
              name="dots-vertical"
              color={colors.pri}
              customStyle={styles.rightBtn}
            />
          }>
          {rightButtons.map((item, index) => (
            <MenuItem
              key={item.title}
              onPress={() => {
                menuRef.current?.hide();
                item.func();
              }}
              textStyle={{
                fontSize: SIZE.md,
                color: colors.pri,
              }}>
              <Icon name={item.icon} size={SIZE.md} />
              {'  ' + item.title}
            </MenuItem>
          ))}
        </Menu>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rightBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    marginLeft: 10,
    paddingRight: 0,
  },
});
